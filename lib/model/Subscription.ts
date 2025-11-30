import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISubscription extends Document {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  email: string;
  phone: string;

  planId: Types.ObjectId;
  planTitle: string;
  planName: "Basic" | "Growth" | "Premium" | "Test";
  price: number;
  interval: "monthly" | "yearly" | "hourly";
  description: string;
  features?: string[];
  fileUrls?: string[];
  links?: string[];

  startDate: Date;
  nextBillingDate: Date;
  endDate?: Date;

  status:
    | "pending"
    | "active"
    | "paused"
    | "cancelled"
    | "expired"
    | "payment_failed";

  // ✅ Payment provider references
  paypalSubscriptionId?: string;

  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    planId: { type: Schema.Types.ObjectId, ref: "Packages", required: true },
    planTitle: { type: String, required: true },
    planName: {
      type: String,
      enum: ["Basic", "Growth", "Premium", "Test"],
      required: true,
    },
    price: { type: Number, required: true },
    interval: {
      type: String,
      enum: ["monthly", "yearly", "hourly"],
      required: true,
    },
    description: { type: String, required: true },
    features: { type: [String], default: [] },
    fileUrls: { type: [String], default: [] },
    links: { type: [String], default: [] },

    startDate: { type: Date, default: Date.now },
    nextBillingDate: { type: Date, required: true },
    endDate: { type: Date },

    status: {
      type: String,
      enum: [
        "pending",
        "active",
        "paused",
        "cancelled",
        "expired",
        "payment_failed",
      ],
      default: "pending",
    },

    // ✅ Payment provider reference
    paypalSubscriptionId: { type: String },
  },
  { timestamps: true }
);

export const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
