import plivo from "plivo";
import CallSession, { type ICallSession } from "../../models/CallSession.js";
import Booking from "../../models/Booking.js";
import User from "../../models/User.js";
import Worker from "../../models/Worker.js";

export function last10Digits(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-10);
}

export function formatE164(phone: string): string {
  if (!phone) return "";
  const clean = phone.replace(/[^\d+]/g, "");
  if (clean.startsWith("+")) return clean;
  if (clean.length === 10) return `+91${clean}`;
  if (clean.startsWith("91") && clean.length === 12) return `+${clean}`;
  return `+${clean}`;
}

export class PlivoService {
  private client: any | null = null;
  private authId: string;
  private authToken: string;
  private plivoNumber: string;
  private backendUrl: string;

  constructor() {
    this.authId = process.env.PLIVO_AUTH_ID || "";
    this.authToken = process.env.PLIVO_AUTH_TOKEN || "";
    this.plivoNumber = process.env.PLIVO_NUMBER || "+918000000000";
    this.backendUrl = (
      process.env.BACKEND_URL ||
      process.env.CLIENT_URL ||
      "https://karmiq.onrender.com"
    ).replace(/\/+$/, "");

    if (this.authId && this.authToken) {
      try {
        this.client = new (plivo as any).Client(this.authId, this.authToken);
        console.log("[Plivo] Initialized Plivo client with Auth ID:", this.authId.slice(0, 6) + "...");
      } catch (err) {
        console.error("[Plivo] Failed to initialize Plivo client:", err);
      }
    } else {
      console.warn("[Plivo] Notice: PLIVO_AUTH_ID or PLIVO_AUTH_TOKEN not configured. Running in simulation mode.");
    }
  }

  getVirtualNumber(): string {
    return this.plivoNumber;
  }

  /**
   * Get an existing active call session for a booking or create a new one.
   */
  async getOrCreateSession(bookingId: string): Promise<ICallSession> {
    const existing = await CallSession.findOne({
      bookingId,
      status: "ACTIVE",
      expiresAt: { $gt: new Date() },
    });

    if (existing) {
      return existing;
    }

    const booking: any = await Booking.findById(bookingId)
      .populate("customerId", "name phone")
      .populate({
        path: "workerId",
        populate: { path: "userId", select: "name phone" },
      });

    if (!booking) {
      throw new Error("Booking not found");
    }

    const customerPhone = booking.customerId?.phone;
    const technicianPhone = booking.workerId?.userId?.phone;

    if (!customerPhone) {
      throw new Error("Customer phone number is missing from booking");
    }
    if (!technicianPhone) {
      throw new Error("Assigned technician phone number is missing from booking");
    }

    // Default session lifespan: 4 hours
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000);

    const session = await CallSession.create({
      bookingId: booking._id,
      customerId: booking.customerId._id,
      technicianId: booking.workerId._id,
      customerPhone,
      technicianPhone,
      virtualNumber: this.plivoNumber,
      status: "ACTIVE",
      expiresAt,
    });

    console.log(
      `[Plivo] Created CallSession ${session._id} for Booking ${bookingId} (Virtual: ${this.plivoNumber})`
    );

    return session;
  }

  /**
   * Resolve an incoming call to the Plivo virtual number.
   * Matches the caller (Customer or Technician) to an active booking session.
   */
  async resolveCallerSession(fromNumber: string): Promise<{
    session: ICallSession | null;
    targetPhone: string | null;
    role: "customer" | "technician" | null;
  }> {
    const callerDigits = last10Digits(fromNumber);
    if (!callerDigits) {
      return { session: null, targetPhone: null, role: null };
    }

    // Find all active sessions where caller is either customer or technician
    const activeSessions = await CallSession.find({
      status: { $in: ["ACTIVE", "IN_PROGRESS"] },
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    for (const s of activeSessions) {
      if (last10Digits(s.customerPhone) === callerDigits) {
        return {
          session: s,
          targetPhone: formatE164(s.technicianPhone),
          role: "customer",
        };
      }
      if (last10Digits(s.technicianPhone) === callerDigits) {
        return {
          session: s,
          targetPhone: formatE164(s.customerPhone),
          role: "technician",
        };
      }
    }

    return { session: null, targetPhone: null, role: null };
  }

  /**
   * Generates Plivo XML in response to POST /api/telephony/plivo/answer webhook.
   */
  async handleAnswerWebhook(payload: {
    From?: string;
    To?: string;
    CallUUID?: string;
    Direction?: string;
  }): Promise<string> {
    const from = payload.From || "";
    const callUuid = payload.CallUUID || "";

    console.log(`[Plivo] Answer Webhook received from: "${from}", CallUUID: "${callUuid}"`);

    const { session, targetPhone, role } = await this.resolveCallerSession(from);

    const response = new (plivo as any).Response();

    if (!session || !targetPhone) {
      console.warn(`[Plivo] No active CallSession matching caller: "${from}"`);
      response.addSpeak(
        "Sorry, no active KarmiK service booking was found for your phone number. Please check your booking in the KarmiK app."
      );
      response.addHangup();
      return response.toXML();
    }

    console.log(
      `[Plivo] Bridging call: ${role} (${from}) -> ${targetPhone} via Virtual Number: ${session.virtualNumber}`
    );

    // Update session with CallUUID and track in call history
    session.status = "IN_PROGRESS";
    if (callUuid) {
      session.plivoSessionUuid = callUuid;
      if (!session.callUuids) session.callUuids = [];
      if (!session.callUuids.includes(callUuid)) {
        session.callUuids.push(callUuid);
      }
    }
    await session.save();

    const actionUrl = `${this.backendUrl}/api/telephony/plivo/dial-status`;

    const dial = response.addDial({
      callerId: session.virtualNumber,
      action: actionUrl,
      method: "POST",
      timeout: 35,
    });
    dial.addNumber(targetPhone);

    return response.toXML();
  }

  /**
   * Handles call completion / status updates via POST /api/telephony/plivo/dial-status webhook.
   */
  async handleDialStatus(payload: {
    CallUUID?: string;
    DialStatus?: string;
    DialBLegUUID?: string;
    DialBLegStatus?: string;
    Duration?: string;
  }): Promise<string> {
    const callUuid = payload.CallUUID;
    const dialStatus = payload.DialStatus || payload.DialBLegStatus || "unknown";

    console.log(
      `[Plivo] DialStatus Webhook: CallUUID: "${callUuid}", Status: "${dialStatus}", Duration: "${payload.Duration || 0}s"`
    );

    if (callUuid) {
      const session = await CallSession.findOne({
        $or: [{ plivoSessionUuid: callUuid }, { callUuids: callUuid }],
      });
      if (session) {
        if (dialStatus === "completed") {
          session.status = "ENDED";
        } else {
          // If busy or unanswered, keep ACTIVE so they can call back
          session.status = "ACTIVE";
        }
        await session.save();
      }
    }

    const response = new (plivo as any).Response();
    return response.toXML();
  }

  /**
   * Validates webhook authenticity using Plivo signature if configured.
   */
  validateWebhook(uri: string, nonce: string, signature: string): boolean {
    if (!this.authToken) return true; // Permissive in dev if no token configured
    try {
      return (plivo as any).validateSignature(uri, nonce, signature, this.authToken);
    } catch (e) {
      console.warn("[Plivo] Signature validation warning:", e);
      return true;
    }
  }
}

export const plivoService = new PlivoService();
