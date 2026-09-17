import { Schema, model, type Document } from "mongoose";

export type CallSessionStatus = "ACTIVE" | "IN_PROGRESS" | "ENDED" | "EXPIRED";

export interface ICallSession extends Document {
  bookingId: Schema.Types.ObjectId;
  customerId: Schema.Types.ObjectId;
  technicianId: Schema.Types.ObjectId;
  customerPhone: string;
  technicianPhone: string;
  plivoSessionUuid?: string;
  callUuids: string[];
  virtualNumber: string;
  status: CallSessionStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const callSessionSchema = new Schema<ICallSession>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    technicianId: {
      type: Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
      index: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    technicianPhone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    plivoSessionUuid: {
      type: String,
      sparse: true,
      index: true,
    },
    callUuids: {
      type: [String],
      default: [],
      index: true,
    },
    virtualNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "IN_PROGRESS", "ENDED", "EXPIRED"],
      default: "ACTIVE",
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

callSessionSchema.index({ customerPhone: 1, status: 1 });
callSessionSchema.index({ technicianPhone: 1, status: 1 });
callSessionSchema.index({ bookingId: 1, status: 1 });

export default model<ICallSession>("CallSession", callSessionSchema);
