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
  const { data } = await axios.get("/api/admin/orders");
  return data;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  if (isLoading) {
    return (
      <section className={styles.section}>
        <div className={styles.statusCard}>
          <div className={styles.statusIcon}>⏳</div>
          <h2 className={styles.statusHeading}>Loading orders...</h2>
          <p className={styles.statusText}>
            Please wait while we fetch the orders.
          </p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={styles.section}>
        <div className={`${styles.statusCard} ${styles.errorState}`}>
          <div className={styles.statusIcon}>⚠️</div>
          <h2 className={styles.statusHeading}>Failed to load orders</h2>
          <p className={styles.statusText}>
            Something went wrong while fetching the orders.
          </p>
          <button onClick={() => refetch()} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!data || data.length === 0) {
    return (
      <section className={styles.section}>
        <div className={`${styles.statusCard} ${styles.emptyState}`}>
          <div className={styles.statusIcon}>📭</div>
          <h2 className={styles.statusHeading}>No orders found</h2>
          <p className={styles.statusText}>
            No orders are currently in the system.
          </p>
        </div>
      </section>
    );
  }

  // Group orders by userId
  const ordersByUser: Record<string, Order[]> = {};
  data.forEach((order) => {
    if (!ordersByUser[order.userId]) ordersByUser[order.userId] = [];
    ordersByUser[order.userId].push(order);
  });

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Admin Dashboard</h1>
        <p className={styles.subheading}>
          Track and manage all customer orders.
        </p>
      </div>

      {Object.entries(ordersByUser).map(([userId, orders]) => (
        <div key={userId} className={styles.clerkGroup}>
          <h2 className={styles.clerkTitle}>
            👤 {orders[0].name} <span>[{userId.slice(0, 20)}]</span>
          </h2>

          <div className={styles.grid}>
            {orders.map((order) => {
              // Project status badge
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

              // Payment status badge
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
                  {/* Header */}
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{order.planTitle}</h3>
                    <span className={styles.orderNumber}>
                      #{order._id.slice(0, 8)}
                    </span>
                  </div>

                  {/* Subheader */}
                  <div className={styles.subHeader}>
                    <span className={styles.planType}>
                      {order.planType === "development"
                        ? "Development"
                        : "Maintenance"}
                    </span>
                    <p className={styles.createdAt}>
                      Placed on {new Date(order.createdAt).toDateString()}
                    </p>
                  </div>

                  {/* Status Row */}
                  <div className={styles.statusRow}>
                    <div>
                      <strong>Project</strong>
                      <span className={`${styles.status} ${statusClass}`}>
                        {order.status}
                      </span>
                    </div>
                    <div>
                      <strong>Payment</strong>
                      <span className={`${styles.status} ${paymentClass}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
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

                  {/* Features */}
                  {order.features && order.features.length > 0 && (
                    <div className={styles.features}>
                      <strong>Features</strong>
                      <ul>
                        {order.features.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Description */}
                  {order.description && (
                    <div className={styles.description}>
                      <p>{order.description}</p>
                    </div>
                  )}

                  {/* File Links */}
                  {order.fileUrls && order.fileUrls.length > 0 && (
                    <div className={styles.fileLinks}>
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

                  {/* Footer */}
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
        </div>
      ))}
    </section>
  );
}
