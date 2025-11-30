"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import styles from "./PlanModal.module.css";
import { PackageDTO } from "@/lib/interface/interface";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type Props = {
  plan: PackageDTO | null;
  onClose: () => void;
};
type BillingInterval = "monthly" | "yearly" | "hourly" | "once";

export default function PlanModal({ plan, onClose }: Props) {
  const { isSignedIn, user } = useUser();
  const [formData, setFormData] = useState({
    name: user?.fullName || "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    phone: "",
    description: "",
    files: [] as File[],
    links: [] as string[],
    planType: plan?.planType || "",
    features: [] as string[],
    price: plan?.price || 0,
    interval: "monthly" as BillingInterval,
  });

  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isDevelopment = formData.planType === "development";
  const isMaintenance = formData.planType === "maintenance";

  useEffect(() => {
    if (isDevelopment && formData.interval !== "once") {
      setFormData((prev) => ({ ...prev, interval: "once" }));
    }
  }, [isDevelopment, formData.interval]);

  useEffect(() => {
    if (!plan) return;
    const basePrice = plan.price || 0;
    setFormData((prev) => ({
      ...prev,
      price: prev.interval === "yearly" ? basePrice * 12 : basePrice,
    }));
  }, [formData.interval, plan]);

  if (!plan) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === modalRef.current) onClose();
  };

  const toggleFeature = (feature: string) => {
    setFormData((prev) => {
      if (isDevelopment) {
        return {
          ...prev,
          features: prev.features.includes(feature) ? [] : [feature],
        };
      }
      return {
        ...prev,
        features: prev.features.includes(feature)
          ? prev.features.filter((f) => f !== feature)
          : [...prev.features, feature],
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...Array.from(files)],
      }));
    }
  };

  const removeFile = (i: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, idx) => idx !== i),
    }));
  };

  const addLink = () => {
    if (!urlInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      links: [...prev.links, urlInput.trim()],
    }));
    setUrlInput("");
  };

  const removeLink = (i: number) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.filter((_, idx) => idx !== i),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !plan) return;

    setLoading(true);
    try {
      const uploadedFileUrls: string[] = [];

      for (const file of formData.files) {
        const { data } = await axios.post("/api/upload-url", {
          fileName: file.name,
        });

        const { signedUrl, path } = data;

        await fetch(signedUrl, { method: "PUT", body: file });

        uploadedFileUrls.push(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/kwi/${path}`
        );
      }

      const dataToSend = new FormData();
      dataToSend.append("userId", user.id);
      dataToSend.append("name", formData.name);
      dataToSend.append("email", formData.email);
      dataToSend.append("phone", formData.phone);
      dataToSend.append("planId", plan._id);
      dataToSend.append("planName", plan.title);
      dataToSend.append("planTitle", plan.title);
      dataToSend.append("planType", formData.planType);
      dataToSend.append("description", formData.description);
      dataToSend.append("price", formData.price.toString());
      dataToSend.append("interval", formData.interval);

      formData.features.forEach((f, i) =>
        dataToSend.append(`features[${i}]`, f)
      );
      uploadedFileUrls.forEach((url, i) =>
        dataToSend.append(`fileUrls[${i}]`, url)
      );
      formData.links.forEach((link, i) =>
        dataToSend.append(`links[${i}]`, link)
      );

      const endpoint = isMaintenance ? "/api/subscription" : "/api/orders";

      await axios.post(endpoint, dataToSend);

      toast.success("Request submitted!");

      router.push(
        isMaintenance
          ? "/clientdashboard/subscription"
          : "/clientdashboard/orders"
      );

      onClose();
    } catch {
      toast.error("Failed to submit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      ref={modalRef}
      onClick={handleBackdropClick}
    >
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✖
        </button>

        <div className={styles.header}>
          <h2>
            {plan.title}{" "}
            {plan.billingCycle === "monthly" ? "Care Plan" : "Website"}
          </h2>

          <p className={styles.planDesc}>{plan.description}</p>
          <p className={styles.planPrice}>${formData.price}</p>
        </div>

        {!isSignedIn ? (
          <div className={styles.authPrompt}>
            <p className={styles.warning}>Please sign in to continue.</p>
            <div className={styles.authButtons}>
              <SignInButton mode="modal">
                <button className={styles.primaryBtn}>Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className={styles.secondaryBtn}>Sign Up</button>
              </SignUpButton>
            </div>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            {/* NAME */}
            <div className={styles.row}>
              <label>Name</label>
              <input
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                required
              />
            </div>

            {/* EMAIL */}
            <div className={styles.row}>
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, email: e.target.value }))
                }
                required
              />
            </div>

            {/* PHONE */}
            <div className={styles.row}>
              <label>Phone</label>
              <input
                placeholder="+254712345678"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, phone: e.target.value }))
                }
                required
              />
            </div>

            {/* PLAN TYPE */}
            <div className={styles.row}>
              <label>Plan Type</label>
              <select
                value={formData.planType}
                disabled={isMaintenance}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, planType: e.target.value }))
                }
              >
                <option value="">Select...</option>
                <option value="development">Development</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            {/* INTERVAL */}
            <div className={styles.row}>
              <label>Interval</label>
              <select
                value={formData.interval}
                disabled={isDevelopment}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    interval: e.target.value as BillingInterval,
                  }))
                }
              >
                {isDevelopment ? (
                  <option value="once">Once</option>
                ) : (
                  <>
                    <option value="hourly">Hourly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </>
                )}
              </select>
            </div>

            {/* FEATURES */}
            <div className={styles.row}>
              <label>Features</label>
              <div className={styles.featuresGrid}>
                {[
                  "Basic WordPress",
                  "Custom Design",
                  "Extra Pages",
                  "E-Commerce",
                ].map((feature) => {
                  const checked = formData.features.includes(feature);
                  const disabled =
                    (isDevelopment &&
                      !checked &&
                      formData.features.length > 0) ||
                    isMaintenance;

                  return (
                    <div
                      key={feature}
                      className={`${styles.featureItem} ${
                        checked ? styles.checked : ""
                      } ${disabled ? styles.disabled : ""}`}
                      onClick={() => !disabled && toggleFeature(feature)}
                    >
                      {feature}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className={styles.rowTop}>
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>

            {/* FILE UPLOAD */}
            <div className={styles.rowTop}>
              <label>Files</label>
              <div className={styles.fileInputWrapper}>
                <input type="file" multiple onChange={handleFileChange} />
                {formData.files.length > 0 && (
                  <ul className={styles.fileList}>
                    {formData.files.map((file, i) => (
                      <li key={i} className={styles.fileItem}>
                        {file.name}
                        <button type="button" onClick={() => removeFile(i)}>
                          ✖
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* LINKS */}
            <div className={styles.rowTop}>
              <label>Links</label>
              <div>
                <div className={styles.linkRow}>
                  <input
                    type="url"
                    value={urlInput}
                    placeholder="https://example.com"
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={addLink}
                  >
                    Add
                  </button>
                </div>

                {formData.links.length > 0 && (
                  <ul className={styles.linkList}>
                    {formData.links.map((link, i) => (
                      <li key={i} className={styles.linkItem}>
                        <a href={link} target="_blank">
                          {link}
                        </a>
                        <button type="button" onClick={() => removeLink(i)}>
                          ✖
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <button className={styles.primaryBtn} disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
