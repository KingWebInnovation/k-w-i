"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./page.module.css";

interface Order {
  _id: string;
  packageId: string;
  userId: string;
  email: string;
  description: string;
  status:
    | "pending"
    | "inprogress"
    | "completed"
    | "accepted"
    | "failed"
    | "cancelled";
  paymentStatus: "unpaid" | "captured" | "authorized" | "voided" | "refunded";
  createdAt: string;
  updatedAt: string;
  price: number;
  links?: string[];
  fileUrls?: string[];
}

async function fetchOrder(id: string): Promise<Order> {
  const { data } = await axios.get(`/api/orders/${id}`);
  return data;
}

async function updateOrder(id: string, updates: Partial<Order>) {
  const { data } = await axios.patch(`/api/orders/${id}`, updates);
  return data;
}

export default function EditOrder() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [formData, setFormData] = useState<Partial<Order>>({});
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newLink, setNewLink] = useState("");

  const { data, isLoading } = useQuery<Order>({
    queryKey: ["order", id],
    queryFn: () => (id ? fetchOrder(id) : Promise.reject("Invalid ID")),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: async (updates: Partial<Order>) => {
      if (!id) throw new Error("Invalid ID");

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

        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/kwi/${path}`;
        uploadedFileUrls.push(publicUrl);
      }

      const finalUpdates = {
        ...updates,
        fileUrls: [...(updates.fileUrls || []), ...uploadedFileUrls],
      };

      return updateOrder(id, finalUpdates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      setNewFiles([]);
      setNewLink("");
      toast.success("✅ Order updated successfully!", { autoClose: 2000 });
      setTimeout(() => {
        router.push(`/orders/${id}`);
      }, 2000);
    },
    onError: () => {
      toast.error("❌ Failed to update order");
    },
  });

  useEffect(() => {
    if (data) {
      setFormData({
        email: data.email,
        description: data.description,
        links: data.links || [],
        price: data.price,
        paymentStatus: data.paymentStatus,
        fileUrls: data.fileUrls || [],
      });
    }
  }, [data]);

  if (!id) return <p className={styles.errorMsg}>⚠️ Invalid order ID</p>;
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>⏳</div>
        <p>Loading order...</p>
      </div>
    );
  }
  if (!data) return <p className={styles.errorMsg}>⚠️ Order not found</p>;

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
        <h1 className={styles.heading}>Edit Order</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* User ID */}
          <label>
            User ID
            <input type="text" value={data.userId} readOnly />
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
              readOnly
              value={formData.price || ""}
            />
          </label>

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
