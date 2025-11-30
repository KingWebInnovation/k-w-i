import mongoose from "mongoose";
import dotenv from "dotenv";
import { Service } from "./lib/interface/interface";
import Services from "./lib/model/services";

dotenv.config();

// Service Data without hardcoded IDs
export const servicesData: Omit<Service, "_id">[] = [
  {
    title: "Tailored Website Solutions",
    description:
      "We craft modern, responsive websites using Next.js or WordPress to perfectly match your brand and business goals.",
    icon: "Globe",
    badge: "Starting at $200",
  },
  {
    title: "Reliable Hosting & Security",
    description:
      "Enjoy worry-free hosting with SSL protection, automatic backups, and continuous security updates for peace of mind.",
    icon: "ShieldCheck",
    badge: "99.9% Uptime",
  },
  {
    title: "Custom Professional Emails",
    description:
      "Get branded email addresses like you@yourcompany.com to enhance credibility and strengthen client communication.",
    icon: "Mail",
    badge: ".com Domain",
  },
  {
    title: "Seamless Payment Options",
    description:
      "Integrate credit cards, PayPal, and other popular payment methods to start accepting payments instantly and securely.",
    icon: "CreditCard",
    badge: "Card & PayPal Ready",
  },
  {
    title: "Dedicated Support Team",
    description:
      "Our team is available via phone and email to provide assistance whenever you need it, ensuring smooth operations.",
    icon: "Phone",
    badge: "24/7 Service",
  },
  {
    title: "Optimized Performance",
    description:
      "Fast-loading websites designed to rank high on Google and provide an exceptional user experience to drive conversions.",
    icon: "Zap",
    badge: "Speed & SEO Optimized",
  },
];

async function seedServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to database");

    await Services.deleteMany({});
    await Services.insertMany(servicesData);

    console.log("Services seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding services:", error);
    process.exit(1);
  }
}

seedServices();
