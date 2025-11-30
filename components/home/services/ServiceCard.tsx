"use client";

import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import styles from "./ServiceCard.module.css";
import { Service } from "@/lib/interface/interface";

// Derive all valid icon names from LucideIcons
type IconName = keyof typeof LucideIcons;

interface ServiceWithIcon extends Omit<Service, "icon"> {
  icon: IconName;
}

export default function ServiceCard({
  title,
  description,
  badge,
  icon,
}: ServiceWithIcon) {
  const IconComponent: LucideIcon =
    (LucideIcons[icon] as LucideIcon) || LucideIcons.HelpCircle;

  return (
    <div className={styles.card}>
      {/* Card header */}
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <IconComponent size={28} strokeWidth={1.5} />
        </div>
        {badge && <span className={styles.badge}>{badge}</span>}
      </div>

      {/* Content */}
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </div>
  );
}
