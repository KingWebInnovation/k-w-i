import mongoose from "mongoose";
import dotenv from "dotenv";
import Packages from "./lib/model/packages";

// Load the standard .env file
dotenv.config();

const plans = [
  {
    title: "Basic Websit",
    price: 250,
    billingCycle: "one-time",
    description:
      "A clean, professional website with up to 3 pages. Ideal for small businesses or personal brands.",
    features: [
      "Custom design OR CMS (WordPress)",
      "Mobile responsive",
      "Basic SEO setup",
      "Contact form",
      "Social media integration",
      "1 month free support",
    ],
    planType: "development",
    fixed: true,
  },
  {
    title: "Custom Website",
    price: null,
    billingCycle: "one-time",
    description:
      "A fully customized website tailored to your unique business needs. Pricing depends on features and complexity.",
    features: [
      "Unlimited pages",
      "E-commerce support",
      "Payment integrations",
      "Admin dashboards",
      "Custom functionality",
      "Advanced SEO & analytics",
    ],
    planType: "development",
    fixed: false,
    options: {
      complexityLevels: ["Basic", "Intermediate", "Complex"],
      pagesRange: ["1-5", "6-10", "10+"],
      extraFeatures: [
        "Blog",
        "E-commerce",
        "Admin Dashboard",
        "Payment Integration",
      ],
    },
  },
  {
    title: "Maintenance Basic",
    price: 49,
    billingCycle: "monthly",
    description:
      "Essential maintenance to keep your website secure, updated, and running smoothly.",
    features: [
      "Website hosting",
      "SSL certificate",
      "Weekly backups",
      "Security updates",
      "Technical support",
      "99.9% uptime guarantee",
    ],
    planType: "maintenance",
  },
  {
    title: "Maintenance Growth",
    price: 99,
    billingCycle: "monthly",
    description:
      "Everything in Basic plus ongoing updates and SEO improvements to help grow your digital presence.",
    features: [
      "Everything in Basic",
      "Content updates (2 per month)",
      "SEO optimization",
      "Google Analytics setup",
      "Performance monitoring",
      "Priority support",
    ],
    planType: "maintenance",
    popular: true,
  },
  {
    title: "Maintenance Premium",
    price: 199,
    billingCycle: "monthly",
    description:
      "Full digital support including marketing integrations, reporting, and dedicated management.",
    features: [
      "Everything in Growth",
      "Social media management",
      "Email marketing setup",
      "Google Ads management",
      "Monthly performance reports",
      "Dedicated account manager",
    ],
    planType: "maintenance",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    await Packages.deleteMany({});
    await Packages.insertMany(plans);
    console.log("Pricing plans seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
