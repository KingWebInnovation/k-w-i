"use client";

import { useQuery } from "@tanstack/react-query";
import ServiceCard from "./ServiceCard";
import styles from "./ServiceSection.module.css";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import coreValues from "../../../public/kwi-values.jpg";
import { Service } from "@/lib/interface/interface";

export default function ServicesSection() {
  const coreValuesList = [
    "Teamwork",
    "Communication",
    "Quality",
    "Innovation",
    "Integrity",
  ];

  // 🔥 Typed fetch function
  async function fetchServices(): Promise<Service[]> {
    const res = await fetch("/api/services", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch services");
    return res.json();
  }

  // 🚀 React Query with typed data
  const {
    data: services,
    isLoading,
    error,
  } = useQuery<Service[], Error>({
    queryKey: ["services"],
    queryFn: fetchServices,
  });

  return (
    <section className={styles.section} id="services">
      <div className={styles.container}>
        <h1 className={styles.heading}>
          All the Tools You Need to <span>Grow Online</span>
        </h1>

        <p className={styles["intro-text"]}>
          From custom web design to hosting, email, and payment solutions — we
          take care of your tech so you can focus on scaling your business.
        </p>

        <div className={styles["values-and-cards"]}>
          {/* Left - Values */}
          <div className={styles.valuesSection}>
            <div className={styles.valuesImageWrapper}>
              <Image
                src={coreValues}
                alt="Our Core Values"
                className={styles.valuesImage}
              />
              <ul className={styles.valuesList}>
                {coreValuesList.map((value) => (
                  <li key={value} className={styles.valueItem}>
                    {value}
                  </li>
                ))}
              </ul>
            </div>

            <h2>Our Values</h2>
            <p className={styles.valuesText}>
              At King Web Innovation, we prioritize teamwork, communication,
              quality, innovation, and integrity in every project.
            </p>
          </div>

          {/* Right - Cards */}
          <div className={styles.grid}>
            {isLoading && <p>Loading services...</p>}
            {error && <p>{error.message}</p>}

            {services?.map((service) => (
              <ServiceCard key={service._id} {...service} />
            ))}
          </div>
        </div>

        <div className={styles["stats-section"]}>
          <p className={styles["stats-heading"]}>
            Join 100+ US businesses already thriving online with us
          </p>
        </div>

        <Link href="/" className={styles["cta-link"]}>
          Get Started <ArrowRight width={20} />
        </Link>
      </div>
    </section>
  );
}
