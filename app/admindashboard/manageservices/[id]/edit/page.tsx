"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import styles from "./page.module.css";
import type { Service } from "@/lib/interface/interface";

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id;

  const [service, setService] = useState<Service | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("");
  const [icon, setIcon] =
    useState<keyof typeof import("lucide-react")>("Globe");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the service from API
  useEffect(() => {
    async function fetchService() {
      try {
        const { data } = await axios.get<Service>(
          `/api/admin/services/${serviceId}`
        );
        setService(data);
        setTitle(data.title);
        setDescription(data.description);
        setBadge(data.badge || "");
        setIcon(data.icon);
      } catch (err) {
        const axiosError = err as AxiosError<{ message: string }>;
        setError(
          axiosError.response?.data?.message ||
            axiosError.message ||
            "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchService();
  }, [serviceId]);

  if (loading) return <p>Loading service...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!service) return <p>Service not found.</p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.patch(`/api/admin/services/${service._id}`, {
        title,
        description,
        badge,
        icon,
      });

      alert("Service updated successfully!");
      router.push("/admindashboard/manageservices");
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      alert(
        axiosError.response?.data?.message ||
          axiosError.message ||
          "Update failed"
      );
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageHeading}>Edit Service</h1>
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

        <button type="submit" className={styles.saveButton}>
          Save Changes
        </button>
      </form>
    </div>
  );
}
