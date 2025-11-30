import mongoose, { model, models } from "mongoose";

const serviceSchema = new mongoose.Schema({
  title: String,
  description: String,
  icon: String,
  badge: String,
});

const Services = models.Services || model("Services", serviceSchema);

export default Services;
