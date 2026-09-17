import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import routes from "./routes/index.js";
import telephonyRoutes from "./routes/telephony.routes.js";
import { notFound, errorHandler } from "./middleware/error.js";

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDirs = [
  path.resolve(process.cwd(), "../dist"),
  path.resolve(process.cwd(), "dist"),
  path.resolve(__dirname, "../../dist"),
  path.resolve(__dirname, "../dist"),
  path.resolve(__dirname, "../../../dist"),
];
const clientDist = candidateDirs.find((dir) => fs.existsSync(path.join(dir, "index.html")));
if (clientDist) {
  console.log(`[Static] Serving frontend client from: ${clientDist}`);
} else {
  console.warn("[Static] Notice: No frontend dist containing index.html found.");
}

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map((s) => s.trim()) : true,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging to immediately identify any 401s or failed calls
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms) [Auth: ${Boolean(req.headers.authorization)}]`);
  });
  next();
});

// Rate limit: generous for development & polling, with proper JSON error responses
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please try again in a moment." }
  })
);

app.get("/api/health", (req, res) => res.json({ success: true, data: { status: "ok" } }));
app.use("/api", routes);
app.use("/api/telephony", telephonyRoutes);

// Serve static frontend in production if dist directory containing index.html exists
if (clientDist) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.originalUrl.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;