"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import styles from "./page.module.css";
import type { Service } from "@/lib/interface/interface";

export default function AddServicePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("");
  const [icon, setIcon] =
    useState<keyof typeof import("lucide-react")>("Globe");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newService: Omit<Service, "_id" | "id"> = {
        title,
        description,
        badge,
        icon,
      };

      await axios.post("/api/admin/services", newService);

      alert("Service added successfully!");
      router.push("/admindashboard/manageservices");
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(
        axiosError.response?.data?.message ||
          axiosError.message ||
          "Failed to add service"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageHeading}>Add New Service</h1>

      {error && <p className={styles.errorMessage}>Error: {error}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.formLabel}>
          Title:
          <input
            className={`${styles.formInput} ${styles.focusable}`}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label className={styles.formLabel}>
          Description:
          <textarea
            className={`${styles.formTextarea} ${styles.focusable}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>

        <label className={styles.formLabel}>
          Badge:
          <input
            className={`${styles.formInput} ${styles.focusable}`}
            type="text"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
          />
        </label>

        <label className={styles.formLabel}>
          Icon:
          <select
            className={`${styles.formSelect} ${styles.focusable}`}
            value={icon}
            onChange={(e) =>
              setIcon(e.target.value as keyof typeof import("lucide-react"))
            }
          >
            <option value="Globe">Globe</option>
            <option value="ShieldCheck">ShieldCheck</option>
            <option value="Mail">Mail</option>
            <option value="CreditCard">CreditCard</option>
            <option value="Phone">Phone</option>
            <option value="Zap">Zap</option>
          </select>
        </label>

        <button type="submit" className={styles.saveButton} disabled={loading}>
          {loading ? "Adding..." : "Add Service"}
        </button>
      </form>
    </div>
  );
}
