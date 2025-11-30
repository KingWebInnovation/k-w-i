"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

interface PackageForm {
  title: string;
  price: number | null;
  billingCycle: "monthly" | "yearly" | "one-time";
  description: string;
  features: string[];
  planType: "development" | "maintenance";
  fixed: boolean;
  popular?: boolean;
}

export default function AddPackageForm() {
  const router = useRouter();
  const [form, setForm] = useState<PackageForm>({
    title: "",
    price: null,
    billingCycle: "one-time",
    description: "",
    features: [],
    planType: "development",
    fixed: false,
    popular: false,
  });

  const [newFeature, setNewFeature] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fully typed updateField
  const updateField = <K extends keyof PackageForm>(
    key: K,
    value: PackageForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addFeature = () => {
    if (newFeature.trim() === "") return;
    setForm((prev) => ({ ...prev, features: [...prev.features, newFeature] }));
    setNewFeature("");
  };

  const removeFeature = (index: number) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await axios.post("/api/packages", form);
      router.push("/admindashboard/packages");
    } catch (err) {
      console.error("Failed to add package:", err);
      setError("Failed to add package.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Add New Package</h2>
      {error && <div className={styles.error}>{error}</div>}
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Price</label>
          <input
            type="number"
            value={form.price ?? ""}
            onChange={(e) => updateField("price", Number(e.target.value))}
            required={form.planType === "maintenance"}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Billing Cycle</label>
          <select
            value={form.billingCycle}
            onChange={(e) =>
              updateField(
                "billingCycle",
                e.target.value as PackageForm["billingCycle"]
              )
            }
          >
            <option value="one-time">One-Time</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Add Feature</label>
          <div className={styles.featureInputRow}>
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
            />
            <button type="button" onClick={addFeature}>
              Add
            </button>
          </div>
          <ul className={styles.featureList}>
            {form.features.map((feature, index) => (
              <li key={index} className={styles.featureItem}>
                {feature}
                <button type="button" onClick={() => removeFeature(index)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.formGroup}>
          <label>Plan Type</label>
          <select
            value={form.planType}
            onChange={(e) =>
              updateField("planType", e.target.value as PackageForm["planType"])
            }
            required
          >
            <option value="development">Development</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            checked={form.fixed}
            onChange={(e) => updateField("fixed", e.target.checked)}
          />
          <label>Fixed Price</label>
        </div>

        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            checked={form.popular || false}
            onChange={(e) => updateField("popular", e.target.checked)}
          />
          <label>Mark as Most Popular</label>
        </div>

        <button className={styles.saveButton} type="submit" disabled={saving}>
          {saving ? "Saving..." : "Add Package"}
        </button>
      </form>
    </div>
  );
}
