"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { PackageDTO } from "@/lib/interface/interface";
import styles from "./page.module.css";

interface EditPackagePageProps {
  params: {
    id: string;
  };
}

export default function EditPackagePage({ params }: EditPackagePageProps) {
  const router = useRouter();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<PackageDTO>({
    _id: "",
    title: "",
    price: null,
    billingCycle: "monthly",
    description: "",
    features: [],
    popular: false,
    planType: "development",
    options: {
      complexityLevels: [],
      pagesRange: [],
      extraFeatures: [],
    },
    fixed: false,
  });

  /** Load existing package */
  useEffect(() => {
    if (!id) return;
    const loadPackage = async () => {
      try {
        const res = await axios.get(`/api/packages/${id}`);
        setForm(res.data);
      } catch (err) {
        console.error("Failed to load package:", err);
        setError("Failed to load package.");
      } finally {
        setLoading(false);
      }
    };
    loadPackage();
  }, [id]);

  /** Fully typed updateField */
  const updateField = <K extends keyof PackageDTO>(
    key: K,
    value: PackageDTO[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /** Save changes */
  const saveChanges = async () => {
    setSaving(true);
    try {
      await axios.patch(`/api/packages/${form._id}`, form);
      router.push("/admindashboard/packages");
    } catch (err) {
      console.error("Failed to save package:", err);
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading package...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Edit Package: {form.title}</h1>

      <div className={styles.form}>
        <div className={styles.formGroup}>
          <label>Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Price</label>
          <input
            type="number"
            value={form.price ?? ""}
            onChange={(e) => updateField("price", Number(e.target.value))}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Billing Cycle</label>
          <select
            value={form.billingCycle}
            onChange={(e) =>
              updateField(
                "billingCycle",
                e.target.value as PackageDTO["billingCycle"]
              )
            }
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="one-time">One-Time</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Features</label>
          <textarea
            rows={6}
            value={form.features.join("\n")}
            onChange={(e) =>
              updateField("features", e.target.value.split("\n"))
            }
          />
          <p className={styles.featuresNote}>One feature per line.</p>
        </div>

        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            checked={form.popular}
            onChange={(e) => updateField("popular", e.target.checked)}
          />
          <label>Mark as Most Popular</label>
        </div>

        <button
          className={styles.saveButton}
          onClick={saveChanges}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
