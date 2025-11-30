"use client";

import { Check, Star } from "lucide-react";
import styles from "./PricingCard.module.css";
import { PackageDTO } from "@/lib/interface/interface";

type Props = {
  plan: PackageDTO;
  onSelect: (plan: PackageDTO) => void;
};

export default function PricingCard({ plan, onSelect }: Props) {
  const getButtonLabel = (title: string, billingCycle: string) => {
    if (billingCycle === "one-time") return "Get Started";
    switch (title.toLowerCase()) {
      case "basic":
        return "Choose Basic";
      case "growth":
        return "Choose Growth";
      case "premium":
        return "Choose Premium";
      default:
        return "Choose Plan";
    }
  };

  const isCustom = plan.title.toLowerCase().includes("custom");

  return (
    <div
      className={`${styles.card} ${plan.popular ? styles.popular : ""} ${
        isCustom ? styles.custom : ""
      }`}
    >
      {plan.popular && (
        <span className={styles.badge}>
          <Star size={14} className={styles.starIcon} />
          Most Popular
        </span>
      )}

      <div className={styles.header}>
        <h3 className={styles.title}>{plan.title} Care Plan</h3>
        <p>{plan.description}</p>
      </div>

      <div className={styles.priceContainer}>
        <span className={styles.price}>
          {plan.price !== null && plan.price !== undefined
            ? `$${plan.price.toLocaleString()}`
            : "From $250"}
        </span>
        {plan.price && (
          <span className={styles.cycle}>/{plan.billingCycle}</span>
        )}
      </div>

      <ul className={styles.features}>
        {plan.features.map((feature, i) => (
          <li key={i} className={styles.featureItem}>
            <Check size={16} strokeWidth={2} />
            {feature}
          </li>
        ))}
      </ul>

      {isCustom ? (
        <div className={styles.buttonGroup}>
          <a
            href="https://wa.me/19414480584?text=Hi%20I%20am%20interested%20in%20your%20Custom%20Plan"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.contactButton}
          >
            Contact Us
          </a>
        </div>
      ) : (
        <button className={styles.button} onClick={() => onSelect(plan)}>
          {getButtonLabel(plan.title, plan.billingCycle)}
        </button>
      )}
    </div>
  );
}
