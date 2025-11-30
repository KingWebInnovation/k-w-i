"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./page.module.css";

interface ISubscription {
  _id: string;
  planTitle: string;
  interval: string;
  email: string;
  description: string;
  status: "pending" | "active" | "paused" | "cancelled" | "expired";
  price: number;
  startDate: string;
  nextBillingDate: string;
  features: string[];
  links?: string[];
  fileUrls?: string[];
}

async function fetchSubscription(id: string): Promise<ISubscription> {
  const { data } = await axios.get(`/api/subscription/${id}`);
  return data;
}

async function updateSubscription(id: string, updates: Partial<ISubscription>) {
  const { data } = await axios.patch(`/api/subscription/${id}`, updates);
  return data;
}

export default function EditSubscription() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [formData, setFormData] = useState<Partial<ISubscription>>({});
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newLink, setNewLink] = useState("");

  const { data, isLoading } = useQuery<ISubscription>({
    queryKey: ["subscription", id],
    queryFn: () =>
      id ? fetchSubscription(id) : Promise.reject("Invalid subscription ID"),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: async (updates: Partial<ISubscription>) => {
      if (!id) throw new Error("Invalid subscription ID");

      const uploadedFileUrls: string[] = [];

      // ✅ Upload new files before saving
      for (const file of newFiles) {
        const { data } = await axios.post("/api/upload-url", {
          fileName: file.name,
        });

        const { signedUrl, path } = data;
        if (!signedUrl || !path) {
          throw new Error("Failed to get signed upload URL from API");
        }

        await fetch(signedUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/nxtsite/${path}`;
        uploadedFileUrls.push(publicUrl);
      }

      const finalUpdates = {
        ...updates,
        fileUrls: [...(updates.fileUrls || []), ...uploadedFileUrls],
      };

      return updateSubscription(id, finalUpdates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", id] });
      setNewFiles([]);
      setNewLink("");
      toast.success("✅ Subscription updated successfully!", {
        autoClose: 2000,
      });
      setTimeout(() => {
        router.push(`/clientdashboard/subscription/${id}`);
      }, 2000);
    },
    onError: () => {
      toast.error("❌ Failed to update subscription");
    },
  });

  useEffect(() => {
    if (data) {
      setFormData({
        planTitle: data.planTitle,
        interval: data.interval,
        email: data.email,
        description: data.description,
        price: data.price,
        features: data.features || [],
        links: data.links || [],
        fileUrls: data.fileUrls || [],
      });
    }
  }, [data]);

  if (!id) return <p className={styles.errorMsg}>⚠️ Invalid subscription ID</p>;
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>⏳</div>
        <p>Loading subscription...</p>
      </div>
    );
  }
  if (!data)
    return <p className={styles.errorMsg}>⚠️ Subscription not found</p>;

  // ---------- handlers ----------

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddLink = () => {
    if (!newLink.trim()) return;
    const updatedLinks = [...(formData.links || []), newLink.trim()];
    setFormData((prev) => ({ ...prev, links: updatedLinks }));
    setNewLink("");
  };

  const handleRemoveLink = (index: number) => {
    const updatedLinks = formData.links?.filter((_, i) => i !== index) || [];
    setFormData((prev) => ({ ...prev, links: updatedLinks }));
  };

  const handleRemoveFile = (url: string) => {
    const updatedFiles =
      formData.fileUrls?.filter((file) => file !== url) || [];
    setFormData((prev) => ({ ...prev, fileUrls: updatedFiles }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <section className={styles.section}>
      <button className={styles.backBtn} onClick={() => router.back()}>
        ← Back
      </button>

      <div className={styles.detailsCard}>
        <h1 className={styles.heading}>Edit Subscription</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Plan Title */}
          <label>
            Plan Title
            <input
              type="text"
              name="planTitle"
              value={formData.planTitle || ""}
              onChange={handleChange}
              required
            />
          </label>

          {/* Interval */}
          <label>
            Billing Interval
            <input
              type="text"
              name="interval"
              value={formData.interval || ""}
              onChange={handleChange}
              required
            />
          </label>

          {/* Email */}
          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              readOnly
            />
          </label>

          {/* Description */}
          <label>
            Description
            <textarea
              name="description"
              rows={5}
              value={formData.description || ""}
              onChange={handleChange}
              required
            />
          </label>

          {/* Price */}
          <label>
            Price
            <input
              type="number"
              name="price"
              value={formData.price || ""}
              readOnly
            />
          </label>

          {/* Features */}
          <div className={styles.featuresContainer}>
            <strong>Features</strong>
            <ul>
              {formData.features?.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div className={styles.linksContainer}>
            <strong>Links</strong>
            <ul>
              {formData.links?.map((link, index) => (
                <li key={index} className={styles.linkRow}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.linkItem}
                  >
                    {link}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(index)}
                    className={styles.removeBtn}
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
            <div className={styles.addLinkRow}>
              <input
                type="url"
                placeholder="https://example.com"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddLink}
                className={styles.addLinkBtn}
              >
                ➕ Add Link
              </button>
            </div>
          </div>

          {/* Files */}
          <div className={styles.filesContainer}>
            <strong>Files</strong>
            <ul>
              {formData.fileUrls?.map((url, i) => (
                <li key={i} className={styles.fileItem}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {url.split("/").pop()}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(url)}
                    className={styles.removeBtn}
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className={styles.fileInput}
            />
            {newFiles.length > 0 && (
              <ul>
                {newFiles.map((file, i) => (
                  <li key={i}>{file.name} (to be uploaded)</li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            className={styles.saveBtn}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </section>
  );
}
