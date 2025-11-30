"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

interface Order {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  planId: string;
  planTitle: string;
  planType: "development" | "maintenance";
  features?: string[];
  description: string;
  fileUrls?: string[];
  createdAt: string;
  status:
    | "pending"
    | "inprogress"
    | "completed"
    | "accepted"
    | "failed"
    | "cancelled";
  paymentStatus: "unpaid" | "captured" | "authorized" | "voided" | "refunded";
}

async function fetchOrders(): Promise<Order[]> {
  const { data } = await axios.get("/api/orders");
  return data;
}

export default function MyOrders() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>⏳</div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.errorContainer}>
        <h1>⚠️ Failed to load orders</h1>
        <p>Please try again later.</p>
        <button onClick={() => refetch()} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          <h2>No orders found</h2>
          <p>
            You have not placed any orders yet. When you do, they will appear
            here.
          </p>
          <button
            className={styles.ctaButton}
            onClick={() => router.push("/#pricing")}
          >
            Place Your First Order
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h1 className={styles.heading}>My Orders</h1>
        <p className={styles.subheading}>
          Track and manage all your project orders in one place.
        </p>
      </div>

      <div className={styles.grid}>
        {data.map((order) => {
          // project status badge
          const statusClass =
            order.status === "pending"
              ? styles.statusPending
              : order.status === "inprogress"
              ? styles.statusInProgress
              : order.status === "completed"
              ? styles.statusCompleted
              : order.status === "accepted"
              ? styles.statusAccepted
              : order.status === "failed"
              ? styles.statusFailed
              : styles.statusCancelled;

          // payment status badge
          const paymentClass =
            order.paymentStatus === "unpaid"
              ? styles.paymentUnpaid
              : order.paymentStatus === "captured"
              ? styles.paymentCaptured
              : order.paymentStatus === "authorized"
              ? styles.paymentAuthorized
              : order.paymentStatus === "voided"
              ? styles.paymentVoided
              : styles.paymentRefunded;

          return (
            <div key={order._id} className={styles.card}>
              {/* Header with plan title + order number */}
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>{order.planTitle}</h2>
                <span className={styles.orderNumber}>
                  #{order.userId.slice(0, 20)}
                </span>
              </div>

              {/* Sub-header: plan type + created date */}
              <div className={styles.subHeader}>
                <span className={styles.planType}>
                  {order.planType === "development"
                    ? "💻 Development"
                    : "🛠️ Maintenance"}
                </span>
                <p className={styles.createdAt}>
                  Placed on {new Date(order.createdAt).toDateString()}
                </p>
              </div>

              {/* Status badges */}
              <div className={styles.statusRow}>
                <div>
                  <strong>Project Status</strong>
                  <span className={`${styles.status} ${statusClass}`}>
                    {order.status}
                  </span>
                </div>
                <div>
                  <strong>Payment Status</strong>
                  <span className={`${styles.status} ${paymentClass}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Customer details */}
              <div className={styles.infoRow}>
                <div>
                  <strong>Name</strong>
                  <p>{order.name}</p>
                </div>
                <div>
                  <strong>Email</strong>
                  <p>{order.email}</p>
                </div>
                <div>
                  <strong>Phone</strong>
                  <p>{order.phone}</p>
                </div>
              </div>

              {/* Optional fields */}
              {order.features && order.features.length > 0 && (
                <div className={styles.features}>
                  <strong>Features</strong>
                  <ul>
                    {order.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {order.description && (
                <div className={styles.description}>
                  <p>{order.description}</p>
                </div>
              )}

              {order.fileUrls && order.fileUrls.length > 0 && (
                <div className={styles.fileLink}>
                  {order.fileUrls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📎 File {i + 1}
                    </a>
                  ))}
                </div>
              )}

              {/* Footer with actions */}
              <div className={styles.cardFooter}>
                <button
                  className={styles.viewButton}
                  onClick={() =>
                    router.push(`/clientdashboard/orders/${order._id}`)
                  }
                >
                  View Details <span className={styles.buttonIcon}>→</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
