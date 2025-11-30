"use client";

import styles from "./page.module.css";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Service } from "@/lib/interface/interface";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import coreValues from "@/public/kwi-values.jpg";
import axios, { AxiosError } from "axios";

// 🔹 Service Card with Edit & Delete
interface AdminServiceCardProps extends Service {
  onDelete: (id: string) => void;
}

export function AdminServiceCard({
  _id,
  title,
  description,
  badge,
  icon,
  onDelete,
}: AdminServiceCardProps) {
  const IconComponent: LucideIcon =
    (LucideIcons[icon as keyof typeof LucideIcons] as LucideIcon) ??
    LucideIcons.HelpCircle;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <IconComponent size={28} strokeWidth={1.5} />
        </div>
        {badge && <span className={styles.badge}>{badge}</span>}
      </div>

      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>

      <div className={styles.cardButtons}>
        {/* Edit Button */}
        <Link
          href={`/admindashboard/manageservices/${_id}/edit`}
          className={styles.editButton}
        >
          Edit
        </Link>

        {/* Delete Button */}
        <button className={styles.deleteButton} onClick={() => onDelete(_id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

// 🔹 Main Admin Services Section
export default function AdminServicesSection() {
  const coreValuesList = [
    "Teamwork",
    "Communication",
    "Quality",
    "Innovation",
    "Integrity",
  ];
  const queryClient = useQueryClient();

  // Fetch services
  async function fetchServices(): Promise<Service[]> {
    try {
      const { data } = await axios.get<Service[]>("/api/admin/services");
      return data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch services"
      );
    }
  }
  // Delete service
  async function deleteService(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await axios.delete(`/api/admin/services/${id}`);
      queryClient.invalidateQueries({ queryKey: ["services"] });
      alert("Service deleted successfully!");
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete service"
      );
    }
  }
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
              <AdminServiceCard
                key={service._id}
                {...service}
                onDelete={deleteService}
              />
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
