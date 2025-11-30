"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import styles from "./page.module.css";
import Link from "next/link";
import { useState } from "react";
import OrderUploads from "@/components/OrderUpload";
import { toast } from "react-toastify";

interface Order {
  _id: string;
  packageId: string;
  email: string;
  words: string;
  subject: string;
  dueDate: string;
  description: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  links?: string[];
  fileUrls?: string[];
  price: number;
  clerkId: string;
  name: string;
}

interface SubmissionFile {
  fileId: string;
  fileUrl: string;
  filename: string;
  mimeType: string;
}

interface Submission {
  orderId: string;
  clerkId: string;
  email?: string;
  files: SubmissionFile[];
  createdAt: string;
  updatedAt: string;
}

async function fetchOrder(id: string): Promise<Order> {
  const { data } = await axios.get(`/api/orders/${id}`);
  return data;
}

async function fetchSubmissions(orderId: string): Promise<Submission[]> {
  const { data } = await axios.get(`/api/submissions?orderId=${orderId}`);
  return data ? [data] : [];
}

export default function OrderDetails() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const queryClient = useQueryClient();

  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [accepting, setAccepting] = useState(false);

  const {
    data: orderData,
    isLoading,
    isError,
  } = useQuery<Order>({
    queryKey: ["order", id],
    queryFn: () => fetchOrder(id!),
    enabled: !!id,
  });

  const { data: submissions, isLoading: subsLoading } = useQuery<Submission[]>({
    queryKey: ["submissions", id],
    queryFn: () => fetchSubmissions(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>⏳</div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (isError || !orderData) {
    return (
      <div className={styles.errorContainer}>
        <h1>⚠️ Failed to load order</h1>
        <button
          className={styles.retryButton}
          onClick={() => router.push("/orders")}
        >
          Retry
        </button>
      </div>
    );
  }

  const normalizedStatus = orderData.status?.toLowerCase() || "pending";
  const statusClass =
    normalizedStatus === "pending"
      ? styles.statusPending
      : normalizedStatus === "inprogress"
      ? styles.statusInProgress
      : normalizedStatus === "completed"
      ? styles.statusCompleted
      : normalizedStatus === "accepted"
      ? styles.statusAccepted
      : normalizedStatus === "cancelled"
      ? styles.statusCancelled
      : styles.statusFailed;

  const shortId = `${orderData._id.slice(0, 4)}${orderData._id.slice(-4)}`;

  const paymentStatus = orderData.paymentStatus?.toLowerCase() || "unpaid";
  const paymentClass =
    paymentStatus === "captured"
      ? styles.paymentPaid
      : paymentStatus === "pending"
      ? styles.paymentPending
      : styles.paymentUnpaid;

  const handleCancel = async () => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await axios.patch(`/api/orders/${id}`, { status: "cancelled" });
      toast.success("Order has been cancelled.");
      queryClient.invalidateQueries({ queryKey: ["order", id] });
    } catch (err) {
      console.error("Cancel order error:", err);
      toast.error("Failed to cancel order. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (normalizedStatus !== "cancelled") {
      toast.error("You can only delete orders that are cancelled.");
      return;
    }

    if (!window.confirm("This will permanently delete the order. Continue?"))
      return;

    try {
      await axios.delete(`/api/orders/${id}`);
      toast.success("Order deleted successfully.");
      queryClient.removeQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      router.push("/orders");
    } catch (err) {
      console.error("Delete order error:", err);
      toast.error("Failed to delete order. Please try again.");
    }
  };

  const handlePayPal = async () => {
    try {
      const res = await axios.post("/api/paypal/create", {
        orderId: orderData._id,
        amount: orderData.price,
      });

      const approvalUrl = res.data.links?.find(
        (link: { rel: string }) => link.rel === "approve"
      )?.href;

      if (approvalUrl) {
        window.location.href = approvalUrl;
      } else {
        toast.error("Could not start PayPal payment. Please try again.");
      }
    } catch (err) {
      console.error("❌ PayPal create error:", err);
      toast.error("Payment initialization failed. Try again later.");
    }
  };

  const handleAccept = async () => {
    if (!id) return;
    setAccepting(true);
    try {
      await axios.patch(`/api/orders/${id}`, {
        status: "accepted",
        paymentStatus: "authorized",
      });
      toast.success("Order accepted! Funds will be released.");
      queryClient.invalidateQueries({ queryKey: ["order", id] });
    } catch (err) {
      console.error("Accept order error:", err);
      toast.error("Failed to accept order.");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <section className={styles.section}>
      <button
        className={styles.backBtn}
        onClick={() =>
          router.push(
            isAdmin ? "/admindashboard/orders" : "/clientdashboard/orders"
          )
        }
      >
        ← Back to {isAdmin ? "Admin Dashboard" : "My Orders"}
      </button>

      <div className={styles.detailsCard}>
        {/* Header */}
        <div className={styles.headerRow}>
          <h1 className={styles.heading}>Subject: {orderData.subject}</h1>
          <div className={styles.idStatus}>
            <span className={styles.orderId}>Order No: {shortId}</span>
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
              <p>{orderData.email}</p>
            </div>
            <div>
              <strong>Words:</strong>
              <p>{orderData.words}</p>
            </div>
            <div>
              <strong>Price:</strong>
              <p>{orderData.price.toFixed(2)}</p>
            </div>
          </div>

          <div className={styles.infoSingle}>
            <strong>Placed:</strong>
            <p>{new Date(orderData.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Description */}
        <div className={styles.sectionBlock}>
          <h2>Description</h2>
          <p>{orderData.description}</p>
        </div>

        {/* Client Files */}
        {orderData.fileUrls && orderData.fileUrls.length > 0 && (
          <div className={styles.sectionBlock}>
            <h2>Client Files</h2>
            <ul className={styles.fileList}>
              {orderData.fileUrls.map((url, index) => {
                const rawName = decodeURIComponent(
                  url.split("/").pop() || `File ${index + 1}`
                );
                const fileName = rawName.includes("-")
                  ? rawName.split("-").slice(1).join("-")
                  : rawName;

                return (
                  <li key={index} className={styles.fileItem}>
                    <span className={styles.fileIcon}>📎</span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.fileLink}
                    >
                      {fileName}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Attached Links */}
        {orderData.links && orderData.links.length > 0 && (
          <div className={styles.sectionBlock}>
            <h2>Attached Links</h2>
            <ul className={styles.linkList}>
              {orderData.links.map((link, index) => (
                <li key={index} className={styles.linkItem}>
                  <span className={styles.linkIcon}>🔗</span>
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

        {/* Payment Status */}
        <div className={styles.sectionBlock}>
          <h2>Payment Status</h2>
          <span className={`${styles.paymentStatus} ${paymentClass}`}>
            {paymentStatus}
          </span>
        </div>

        {/* Actions */}
        {!isAdmin && (
          <div className={styles.actions}>
            {normalizedStatus === "accepted" ? (
              <p className={styles.thankYouMsg}>
                🎉 Thank you for working with us!
              </p>
            ) : paymentStatus === "captured" ? (
              <>
                {normalizedStatus === "completed" && (
                  <button
                    onClick={handleAccept}
                    className={styles.acceptBtn}
                    disabled={accepting}
                  >
                    {accepting ? "Accepting..." : "Accept Order"}
                  </button>
                )}
                <a
                  href={`https://wa.me/${encodeURIComponent("254715710940")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.chatBtn}
                >
                  💬 Chat With Us
                </a>
              </>
            ) : normalizedStatus !== "cancelled" ? (
              <>
                <button
                  className={styles.payBtn}
                  onClick={() => setShowPaymentModal(true)}
                >
                  Pay Now
                </button>
                <Link
                  href={`/orders/${orderData._id}/edit`}
                  className={styles.editBtn}
                >
                  Edit
                </Link>
                <button onClick={handleCancel} className={styles.cancelBtn}>
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={handleDelete} className={styles.deleteBtn}>
                Delete
              </button>
            )}
          </div>
        )}

        {isAdmin && normalizedStatus === "inprogress" && (
          <div className={styles.uploadSection}>
            <h2 className={styles.uploadHeading}>Admin Uploads</h2>
            <OrderUploads
              orderId={orderData._id}
              currentStatus={normalizedStatus}
              clerkId={user?.id || ""}
              email={user?.primaryEmailAddress?.emailAddress || ""}
              isAdmin={isAdmin}
            />
          </div>
        )}
      </div>

      {/* ✅ Payment Modal */}
      {showPaymentModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Select Payment Method</h2>
            <button onClick={handlePayPal} className={styles.modalPayBtn}>
              Pay with PayPal
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
