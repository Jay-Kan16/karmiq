import dns from "node:dns";
import mongoose from "mongoose";

// Resolve MongoDB SRV records reliably (prevents querySrv ECONNREFUSED on Windows/ISP DNS)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is required");
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}