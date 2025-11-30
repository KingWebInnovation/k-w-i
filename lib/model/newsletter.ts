import mongoose, { Schema, model, models } from "mongoose";

export interface ISubscriber {
  email: string;
  createdAt?: Date;
}

const subscriberSchema = new Schema<ISubscriber>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Subscriber =
  models.Subscriber || model<ISubscriber>("Newsletter", subscriberSchema);

export default Subscriber;
