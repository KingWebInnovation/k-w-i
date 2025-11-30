"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

interface Subscription {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  planId: string;
  planTitle: string;
  planType: "maintenance";
  features?: string[];
  description: string;
  fileUrls?: string[];
  createdAt: string;
  status: "pending" | "active" | "paused" | "cancelled" | "expired";
  paymentStatus: "unpaid" | "captured" | "authorized" | "voided" | "refunded";
}

async function fetchSubscriptions(): Promise<Subscription[]> {
  const { data } = await axios.get("/api/subscription");
  return data;
}

export default function MySubscriptions() {
  const router = useRouter();
  const {
    data: subscriptions,
    isLoading,
    isError,
    refetch,
  } = useQuery<Subscription[]>({
    queryKey: ["subscriptions"],
    queryFn: fetchSubscriptions,
  });

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>⏳</div>
        <p>Loading your subscriptions...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.errorContainer}>
        <h1>⚠️ Failed to load subscriptions</h1>
        <p>Please try again later.</p>
        <button onClick={() => refetch()} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          <h2>No subscriptions found</h2>
          <p>
            You have not started any subscriptions yet. When you do, they will
            appear here.
          </p>
          <button
            className={styles.ctaButton}
            onClick={() => router.push("/#pricing")}
          >
            Start a Subscription
          </button>
        </div>
      </section>
    );
  }

  const renderSubscriptionCard = (sub: Subscription) => {
    const statusClass =
      sub.status === "pending"
        ? styles.statusPending
        : sub.status === "active"
        ? styles.statusActive
        : sub.status === "paused"
        ? styles.statusPaused
        : sub.status === "cancelled"
        ? styles.statusCancelled
        : styles.statusExpired;

    const paymentClass =
      sub.paymentStatus === "unpaid"
        ? styles.paymentUnpaid
        : sub.paymentStatus === "captured"
        ? styles.paymentCaptured
        : sub.paymentStatus === "authorized"
        ? styles.paymentAuthorized
        : sub.paymentStatus === "voided"
        ? styles.paymentVoided
        : styles.paymentRefunded;

    return (
      <div key={sub._id} className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{sub.planTitle}</h2>
          <span className={styles.orderNumber}>#{sub.userId.slice(0, 20)}</span>
        </div>

        <div className={styles.subHeader}>
          <span className={styles.planType}>🛠️ Maintenance</span>
          <p className={styles.createdAt}>
            Started on {new Date(sub.createdAt).toDateString()}
          </p>
        </div>

        <div className={styles.statusRow}>
          <div>
            <strong>Status</strong>
            <span className={`${styles.status} ${statusClass}`}>
              {sub.status}
            </span>
          </div>
          <div>
            <strong>Payment Status</strong>
            <span className={`${styles.status} ${paymentClass}`}>
              {sub.paymentStatus}
            </span>
          </div>
        </div>

        <div className={styles.infoRow}>
          <div>
            <strong>Name</strong>
            <p>{sub.name}</p>
          </div>
          <div>
            <strong>Email</strong>
            <p>{sub.email}</p>
          </div>
          <div>
            <strong>Phone</strong>
            <p>{sub.phone}</p>
          </div>
        </div>

        {sub.features && sub.features.length > 0 && (
          <div className={styles.features}>
            <strong>Features</strong>
            <ul>
              {sub.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        {sub.description && (
          <div className={styles.description}>{sub.description}</div>
        )}

        {sub.fileUrls && sub.fileUrls.length > 0 && (
          <div className={styles.fileLink}>
            {sub.fileUrls.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                📎 File {i + 1}
              </a>
            ))}
          </div>
        )}

        <div className={styles.cardFooter}>
          <button
            className={styles.viewButton}
            onClick={() =>
              router.push(`/clientdashboard/subscription/${sub._id}`)
            }
          >
            View Details <span className={styles.buttonIcon}>→</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h1 className={styles.heading}>My Subscriptions</h1>
        <p className={styles.subheading}>
          Track and manage all your active subscriptions here.
        </p>
      </div>

      <div className={styles.grid}>
        {subscriptions.map(renderSubscriptionCard)}
      </div>
    </section>
  );
}
