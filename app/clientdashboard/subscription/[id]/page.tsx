"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";

interface ISubscription {
  _id: string;
  planTitle: string;
  interval: string;
  email: string;
  name: string;
  price: number;
  startDate: string;
  nextBillingDate: string;
  description: string;
  status: string;
  features: string[];
  fileUrls: string[];
  links: string[];
}

// ✅ API fetcher
async function fetchSubscription(id: string): Promise<ISubscription> {
  const { data } = await axios.get(`/api/subscription/${id}`);
  return data;
}

export default function SubscriptionDetails() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const queryClient = useQueryClient();

  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  const [loadingAction, setLoadingAction] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // ✅ React Query fetch
  const {
    data: subscription,
    isLoading,
    isError,
  } = useQuery<ISubscription>({
    queryKey: ["subscription", id],
    queryFn: () => fetchSubscription(id!),
    enabled: !!id,
  });

  // ✅ Loading UI
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>⏳</div>
        <p>Loading subscription details...</p>
      </div>
    );
  }

  // ✅ Error UI
  if (isError || !subscription) {
    return (
      <div className={styles.errorContainer}>
        <h1>⚠️ Failed to load subscription</h1>
        <button
          className={styles.retryButton}
          onClick={() => router.push("/subscription")}
        >
          Retry
        </button>
      </div>
    );
  }

  // ✅ Normalized values
  const normalizedStatus = subscription.status?.toLowerCase() || "pending";
  const statusClass =
    normalizedStatus === "pending"
      ? styles.statusPending
      : normalizedStatus === "active"
      ? styles.statusActive
      : normalizedStatus === "paused"
      ? styles.statusPaused
      : normalizedStatus === "cancelled"
      ? styles.statusCancelled
      : styles.statusExpired;

  const shortId = `${subscription._id.toString().slice(0, 4)}${subscription._id
    .toString()
    .slice(-4)}`;

  // ✅ Handlers
  // ✅ PayPal handler for subscription
  const handlePayPal = async () => {
    if (!id || !subscription) return;
    try {
      const res = await axios.post("/api/paypal/create", {
        type: "subscription", // 👈 tell backend it's a subscription
        subscriptionId: subscription._id,
        amount: subscription.price,
      });

      const approvalUrl = res.data.links?.find(
        (link: { rel: string }) => link.rel === "approve"
      )?.href;

      if (approvalUrl) {
        window.location.href = approvalUrl;
      } else {
        alert("Could not start PayPal payment.");
      }
    } catch (err) {
      console.error("PayPal error:", err);
      alert("Failed to initiate PayPal payment.");
    }
  };

  // ✅ Paystack handler for subscription
  const handlePaystack = async () => {
    if (!id || !subscription) return;

    try {
      const res = await axios.post("/api/paystack/initialize", {
        type: "subscription",
        subscriptionId: subscription._id,
        email: subscription.email,
        name: subscription.name,
        amount: subscription.price,
      });

      if (res.data?.status && res.data.data?.authorization_url) {
        // Redirect to Paystack checkout page
        window.location.href = res.data.data.authorization_url;
      } else {
        alert("Could not start Paystack subscription payment.");
      }
    } catch (err) {
      console.error("Paystack error:", err);
      alert("Failed to initiate Paystack subscription.");
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to cancel this subscription?"))
      return;

    setLoadingAction(true);
    try {
      await axios.patch(`/api/subscription/${id}`, { status: "cancelled" });
      alert("Subscription has been cancelled.");
      queryClient.invalidateQueries({ queryKey: ["subscription", id] });
    } catch (err) {
      console.error("Cancel subscription error:", err);
      alert("Failed to cancel subscription.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (normalizedStatus !== "cancelled") {
      alert("You can only delete subscriptions that are cancelled.");
      return;
    }
    if (!window.confirm("This will permanently delete the subscription."))
      return;

    setLoadingAction(true);
    try {
      await axios.delete(`/api/subscription/${id}`);
      alert("Subscription deleted successfully.");
      queryClient.removeQueries({ queryKey: ["subscription", id] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      router.push("/clientdashboard/subscription");
    } catch (err) {
      console.error("Delete subscription error:", err);
      alert("Failed to delete subscription.");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <section className={styles.section}>
      {/* Back Button */}
      <button
        className={styles.backBtn}
        onClick={() =>
          router.push(
            isAdmin
              ? "/admindashboard/subscription"
              : "/clientdashboard/subscription"
          )
        }
      >
        ← Back to {isAdmin ? "Admin Dashboard" : "My Subscription"}
      </button>

      <div className={styles.detailsCard}>
        {/* Header */}
        <div className={styles.headerRow}>
          <h1 className={styles.heading}>
            {subscription.planTitle} ({subscription.interval})
          </h1>
          <div className={styles.idStatus}>
            <span className={styles.orderId}>Sub ID: {shortId}</span>
            <span className={`${styles.status} ${statusClass}`}>
              {normalizedStatus}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <div>
              <strong>Email:</strong>
              <p>{subscription.email}</p>
            </div>

            <div>
              <strong>Price:</strong>
              <p>
                {subscription.price.toFixed(2)} / {subscription.interval}
              </p>
            </div>

            {normalizedStatus === "active" && (
              <div>
                <strong>Next Billing:</strong>
                <p>
                  {new Date(subscription.nextBillingDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {normalizedStatus === "active" && (
            <div className={styles.infoSingle}>
              <strong>Started:</strong>
              <p>{new Date(subscription.startDate).toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Description */}
        <div className={styles.sectionBlock}>
          <h2>Description</h2>
          <p>{subscription.description}</p>
        </div>

        {/* Features */}
        {subscription.features?.length > 0 && (
          <div className={styles.sectionBlock}>
            <h2>Features</h2>
            <ul className={styles.featureList}>
              {subscription.features.map((feature, idx) => (
                <li key={idx}>✅ {feature}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Files */}
        {subscription.fileUrls?.length > 0 && (
          <div className={styles.sectionBlock}>
            <h2>Attached Files</h2>
            <ul className={styles.fileList}>
              {subscription.fileUrls.map((url, idx) => (
                <li key={idx}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.fileLink}
                  >
                    {decodeURIComponent(
                      url.split("/").pop() || `File ${idx + 1}`
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Links */}
        {subscription.links?.length > 0 && (
          <div className={styles.sectionBlock}>
            <h2>Links</h2>
            <ul className={styles.linkList}>
              {subscription.links.map((link, idx) => (
                <li key={idx} className={styles.linkItem}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.linkText}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        {!isAdmin && (
          <div className={styles.actions}>
            {normalizedStatus === "pending" && (
              <>
                <button
                  className={styles.payBtn}
                  onClick={() => setShowPaymentModal(true)}
                  disabled={loadingAction}
                >
                  Pay Now
                </button>

                <Link
                  href={`/clientdashboard/subscription/${subscription._id}/edit`}
                  className={styles.editBtn}
                >
                  Edit
                </Link>

                <button
                  className={styles.cancelBtn}
                  onClick={handleCancel}
                  disabled={loadingAction}
                >
                  {loadingAction ? "Cancelling..." : "Cancel"}
                </button>
              </>
            )}

            {normalizedStatus === "active" && (
              <>
                <button
                  className={styles.cancelBtn}
                  onClick={handleCancel}
                  disabled={loadingAction}
                >
                  {loadingAction ? "Cancelling..." : "Cancel Subscription"}
                </button>

                <a
                  href={`https://wa.me/1234567890?text=Hi, I need help with my subscription ${shortId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.chatBtn}
                >
                  💬 Chat with Us
                </a>
              </>
            )}

            {normalizedStatus === "cancelled" && (
              <button
                className={styles.deleteBtn}
                onClick={handleDelete}
                disabled={loadingAction}
              >
                {loadingAction ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ✅ Payment Modal (Paystack enabled, PayPal disabled) */}
      {showPaymentModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Select Payment Method</h2>

            {/* Disabled PayPal button with warning */}
            <button
              disabled
              className={`${styles.modalPayBtn} ${styles.disabledBtn}`}
              title="Currently disabled. Please use Paystack to pay for subscriptions."
            >
              Pay with PayPal (Disabled)
            </button>
            <p className={styles.warningText}>
              ⚠️ PayPal is not available right now. Please use Paystack.
            </p>

            {/* Active Paystack button */}
            <button onClick={handlePaystack} className={styles.modalPayBtn}>
              Pay with Card (Paystack)
            </button>

            <button
              onClick={() => setShowPaymentModal(false)}
              className={styles.modalCloseBtn}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
