export type PackageDTO = {
  _id: string;
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
  fixed?: boolean; // ✅ NEW field for clarity
};

import * as LucideIcons from "lucide-react";

// All valid icon names from Lucide
export type IconName = keyof typeof LucideIcons;

export interface Service {
  _id: string;
  title: string;
  description: string;
  badge?: string;
  icon: IconName;
}

export interface SubmissionFile {
  fileUrl: string;
  filename: string;
}

export interface SubmissionType {
  _id: string;
  orderId: string;
  clerkId: string;
  email?: string;
  files: SubmissionFile[]; // All files in a single array
  createdAt: string;
  updatedAt: string;
}

// Duplicate SubmissionFile removed
export interface SubmissionFile {
  fileUrl: string;
  filename: string;
  fileId: string;
  mimeType: string;
}
