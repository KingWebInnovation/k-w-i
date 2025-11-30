import { Schema, Document, models, model } from "mongoose";

export interface IPackages extends Document {
  title: string;
  price?: number | null;
  billingCycle: "one-time" | "monthly" | "hourly";
  description?: string;
  features: string[];
  popular?: boolean;
  planType: "development" | "maintenance";
  options?: {
    complexityLevels?: string[];
    pagesRange?: string[];
    extraFeatures?: string[];
  };
}

const PricingPlanSchema = new Schema<IPackages>(
  {
    title: { type: String, required: true },

    price: {
      type: Number,
      required: function () {
        return this.planType === "maintenance";
      },
      default: null,
    },

    billingCycle: {
      type: String,
      enum: ["one-time", "monthly", "hourly"],
      required: true,
    },

    description: { type: String },
    features: [{ type: String, required: true }],
    popular: { type: Boolean, default: false },

    planType: {
      type: String,
      enum: ["development", "maintenance"],
      required: true,
    },

    options: {
      complexityLevels: [String],
      pagesRange: [String],
      extraFeatures: [String],
    },
  },
  { timestamps: true }
);

const Packages =
  models.Packages || model<IPackages>("Packages", PricingPlanSchema);

export default Packages;
