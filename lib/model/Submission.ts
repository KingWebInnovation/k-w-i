import mongoose, { Schema, model, Model, Document } from "mongoose";
import { SubmissionFile } from "../interface/interface";

export interface SubmissionDocument extends Document {
  orderId: string;
  clerkId: string;
  email?: string;
  files: SubmissionFile[];
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<SubmissionDocument>(
  {
    orderId: { type: String, required: true },
    clerkId: { type: String, required: true },
    email: { type: String },
    files: [
      {
        fileUrl: { type: String, required: true },
        filename: { type: String, required: true },
        fileId: { type: String, required: true },
        mimeType: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const SubmissionModel: Model<SubmissionDocument> =
  mongoose.models.Submission ||
  model<SubmissionDocument>("Submission", SubmissionSchema);

export default SubmissionModel;
