import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IOrder extends Document {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  email: string;
  phone: string;

  planId: Types.ObjectId;
  planTitle: string;
  planType: "development" | "maintenance";
  price: number;
  features?: string[];
  description: string;
  fileUrls?: string[];
  links?: string[];

  // ✅ Payment provider references
  paypalOrderId?: string;
  paystackReference?: string;
  paystackAccessCode?: string;
  status:
    | "pending"
    | "approved"
    | "inprogress"
    | "completed"
    | "accepted"
    | "failed"
    | "cancelled";
  paymentStatus: "unpaid" | "captured" | "authorized" | "voided" | "refunded";

  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    planId: { type: Schema.Types.ObjectId, ref: "Packages", required: true },
    planTitle: { type: String, required: true },
    planType: {
      type: String,
      enum: ["development", "maintenance"],
      required: true,
    },
    price: { type: Number, required: true },

    features: {
      type: [String],
      validate: {
        validator: function (v: string[]) {
          return this.planType === "development" ? true : v.length === 0;
        },
        message: "Maintenance plans cannot have features",
      },
    },

    description: { type: String, required: true },
    fileUrls: { type: [String], default: [] },
    links: { type: [String], default: [] },

    // ✅ Payment provider fields
    paypalOrderId: { type: String },
    paystackReference: { type: String },
    paystackAccessCode: { type: String },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "inprogress",
        "completed",
        "accepted",
        "failed",
        "cancelled",
      ],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "captured", "authorized", "voided", "refunded"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
