// Importing Lucide icon names is optional; we’ll type them as string
import * as LucideIcons from "lucide-react";

export type IconName = keyof typeof LucideIcons;

export interface Service {
  id: number;
  title: string;
  description: string;
  badge: string;
  icon: IconName;
}

export const servicesData: Service[] = [
  {
    id: 1,
    title: "Tailored Website Solutions",
    description:
      "We craft modern, responsive websites using Next.js or WordPress to perfectly match your brand and business goals.",
    icon: "Globe",
    badge: "Starting at $200",
  },
  {
    id: 2,
    title: "Reliable Hosting & Security",
    description:
      "Enjoy worry-free hosting with SSL protection, automatic backups, and continuous security updates for peace of mind.",
    icon: "ShieldCheck",
    badge: "99.9% Uptime",
  },
  {
    id: 3,
    title: "Custom Professional Emails",
    description:
      "Get branded email addresses like you@yourcompany.com to enhance credibility and strengthen client communication.",
    icon: "Mail",
    badge: ".com Domain",
  },
  {
    id: 4,
    title: "Seamless Payment Options",
    description:
      "Integrate credit cards, PayPal, and other popular payment methods to start accepting payments instantly and securely.",
    icon: "CreditCard",
    badge: "Card & PayPal Ready",
  },
  {
    id: 5,
    title: "Dedicated Support Team",
    description:
      "Our team is available via phone and email to provide assistance whenever you need it, ensuring smooth operations.",
    icon: "Phone",
    badge: "24/7 Service",
  },
  {
    id: 6,
    title: "Optimized Performance",
    description:
      "Fast-loading websites designed to rank high on Google and provide an exceptional user experience to drive conversions.",
    icon: "Zap",
    badge: "Speed & SEO Optimized",
  },
];

export interface Testimonial {
  quote: string;
  rating: number;
  name: string;
  business: string;
  location: string;
  createdAt?: string; // optional if you want to sort by latest
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "King Web Innovation completely revamped our online store. Sales skyrocketed by 180% within just two months, and the team made the process seamless and stress-free.",
    rating: 5,
    name: "Emily Johnson",
    business: "Johnson Home Goods",
    location: "New York, NY",
    createdAt: "2025-08-01",
  },
  {
    quote:
      "Our new website from King Web Innovation attracts high-quality leads every week. The user experience is outstanding, and the team was responsive at every step.",
    rating: 5,
    name: "Michael Smith",
    business: "Smith Construction Co.",
    location: "Los Angeles, CA",
    createdAt: "2025-08-05",
  },
  {
    quote:
      "I was impressed by how King Web Innovation captured our brand's personality. Our catering business now reaches more clients than ever before, and the site looks amazing!",
    rating: 5,
    name: "Olivia Davis",
    business: "Olivia's Catering",
    location: "Chicago, IL",
    createdAt: "2025-08-07",
  },
  {
    quote:
      "Working with King Web Innovation has been transformative. Our nonprofit now connects with donors nationwide through a beautiful, intuitive website.",
    rating: 5,
    name: "David Wilson",
    business: "Bright Future Foundation",
    location: "Austin, TX",
    createdAt: "2025-08-10",
  },
];
