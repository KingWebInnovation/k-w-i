"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";

import styles from "./page.module.css";
import { Star, Check, Pencil, Trash2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { PackageDTO } from "@/lib/interface/interface";

export default function AdminPriceCardGrid() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<PackageDTO[]>({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await axios.get<PackageDTO[]>("/api/packages");
      return res.data;
    },
  });

  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      await axios.delete(`/api/packages/${id}`);
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    } catch (err) {
      console.error("Failed to delete package:", err);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>Loading packages...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.error}>
        <p>Failed to load packages. Please try again later.</p>
      </div>
    );
  }

  return (
    <section className={styles.section} id="pricing">
      <div className={styles.container}>
        <h2>Manage Packages</h2>

        <div className={styles.grid}>
          {data?.map((plan) => (
            <AdminPricingCard
              key={plan._id}
              plan={plan}
              isAdmin={isAdmin}
              router={router}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

type Props = {
  plan: PackageDTO;
  isAdmin: boolean;
  router: ReturnType<typeof useRouter>;
  onDelete: (id: string) => void;
};

export function AdminPricingCard({ plan, isAdmin, router, onDelete }: Props) {
  const handleEditClick = () => {
    router.push(`/admindashboard/packages/${plan._id}/edit`);
  };

  const handleDeleteClick = () => {
    onDelete(plan._id);
  };

  return (
    <div className={`${styles.card} ${plan.popular ? styles.popular : ""}`}>
      {plan.popular && (
        <span className={styles.badge}>
          <Star size={14} />
          Most Popular
        </span>
      )}

      <div className={styles.header}>
        <h3 className={styles.title}>{plan.title} Care Plan</h3>
        <p>{plan.description}</p>
      </div>

      <div className={styles.priceContainer}>
        <span className={styles.price}>
          {plan.price != null ? `$${plan.price.toLocaleString()}` : "From $250"}
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

      {isAdmin && (
        <div className={styles.buttonGroup}>
          <button className={styles.editInlineButton} onClick={handleEditClick}>
            <Pencil size={16} /> Edit
          </button>
          <button
            className={styles.deleteInlineButton}
            onClick={handleDeleteClick}
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
