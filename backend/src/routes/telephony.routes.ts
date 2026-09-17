import { Router } from "express";
import { auth, type AuthRequest } from "../middleware/auth.js";
import { plivoService } from "../services/calling/plivoService.js";
import Booking from "../models/Booking.js";
import Worker from "../models/Worker.js";

const r = Router();

/**
 * Plivo Incoming Call Webhook (Answer URL)
 * Publicly accessible endpoint invoked by Plivo when a call hits the Plivo Virtual Number.
 * Responds with Plivo XML <Response><Dial...></Response>
 */
r.post("/plivo/answer", async (req, res, next) => {
  try {
    const xml = await plivoService.handleAnswerWebhook(req.body);
    res.set("Content-Type", "text/xml");
    return res.status(200).send(xml);
  } catch (err) {
    console.error("[Plivo Webhook] Answer error:", err);
    res.set("Content-Type", "text/xml");
    return res
      .status(200)
      .send(
        "<Response><Speak>A connection error occurred. Please try calling again in a moment.</Speak><Hangup/></Response>"
      );
  }
});

/**
 * Plivo Dial Status Callback Webhook
 * Publicly accessible endpoint invoked by Plivo when call completes or status updates.
 */
r.post("/plivo/dial-status", async (req, res, next) => {
  try {
    const xml = await plivoService.handleDialStatus(req.body);
    res.set("Content-Type", "text/xml");
    return res.status(200).send(xml);
  } catch (err) {
    console.error("[Plivo Webhook] Dial status error:", err);
    res.set("Content-Type", "text/xml");
    return res.status(200).send("<Response/>");
  }
});

/**
 * Initialize or get a Plivo Call Session for a booking.
 * Protected with JWT Auth. Accessible by either the customer or assigned worker.
 */
r.post("/sessions", auth, async (req: AuthRequest, res, next) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: "bookingId is required" });
    }

    const b: any = await Booking.findById(bookingId);
    if (!b) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Verify user authorization: customer, assigned worker, or admin
    const isCustomer = b.customerId?.toString() === req.user!.id;
    let isWorker = false;
    if (req.user!.role === "worker") {
      const w = await Worker.findOne({ userId: req.user!.id });
      isWorker = Boolean(w && b.workerId && b.workerId.toString() === w._id.toString());
    }

    if (!isCustomer && !isWorker && req.user!.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized for this booking session" });
    }

    const session = await plivoService.getOrCreateSession(bookingId);

    // Return the virtual number and session info (NEVER counterparty personal phone)
    return res.status(200).json({
      success: true,
      data: {
        sessionId: session._id,
        virtualNumber: session.virtualNumber,
        isConfigured: plivoService.isConfigured(),
        status: session.status,
        expiresAt: session.expiresAt,
        role: isCustomer ? "customer" : "technician",
      },
    });
  } catch (err: any) {
    console.error("[Telephony] Create session error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to create call session" });
  }
});

/**
 * Get active session status for a booking.
 * Protected with JWT Auth.
 */
r.get("/sessions/:bookingId", auth, async (req: AuthRequest, res, next) => {
  try {
    const bookingId = String(req.params.bookingId);
    const session = await plivoService.getOrCreateSession(bookingId);
    return res.status(200).json({
      success: true,
      data: {
        sessionId: session._id,
        virtualNumber: session.virtualNumber,
        isConfigured: plivoService.isConfigured(),
        status: session.status,
        expiresAt: session.expiresAt,
      },
    });
  } catch (err: any) {
    return res.status(404).json({ success: false, message: err.message || "Session not found" });
  }
});

export default r;
