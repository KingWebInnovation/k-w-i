"use client";

import { useState } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import styles from "./OrderUpload.module.css";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";

interface AttachmentFile {
  id: string;
  file?: File;
  filename: string;
  mimeType?: string;
}

interface Props {
  orderId: string;
  currentStatus: string;
  clerkId: string;
  email?: string;
  isAdmin?: boolean;
}

export default function OrderUploads({
  orderId,
  currentStatus,
  clerkId,
  email,
  isAdmin = false,
}: Props) {
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<AttachmentFile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles: AttachmentFile[] = Array.from(e.target.files).map(
      (file) => ({
        id: uuidv4(),
        file,
        filename: file.name,
        mimeType: file.type,
      })
    );
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  // ✅ Admin uploads work → move order to "completed"
  const handleUpload = async () => {
    if (!files.length) {
      console.warn("⚠️ No files selected for upload.");
      return;
    }

    setLoading(true);
    try {
      const uploadedFiles = [];

      for (const f of files) {
        if (!f.file) continue;

        const res = await fetch("/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: f.file.name }),
        });

        if (!res.ok) throw new Error("Failed to get signed URL");
        const { signedUrl, path } = await res.json();

        const uploadRes = await fetch(signedUrl, {
          method: "PUT",
          body: f.file,
        });
        if (!uploadRes.ok) throw new Error(`Upload failed for ${f.file.name}`);

        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/kwi/${path}`;

        uploadedFiles.push({
          fileUrl: publicUrl,
          filename: f.file.name,
          fileId: path,
          mimeType: f.file.type,
        });
      }

      await axios.post("/api/submissions", {
        orderId,
        clerkId,
        email,
        files: uploadedFiles,
      });

      // ✅ Mark as completed
      await axios.patch(`/api/orders/${orderId}`, { status: "completed" });

      setFiles([]);
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["submissions", orderId] });

      toast.success("Files uploaded. Order marked as completed.");
    } catch (err) {
      console.error("❌ Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Client accepts → move to "accepted"
  const handleAccept = async () => {
    if (!window.confirm("Accept this order and release payment?")) return;

    setLoading(true);
    try {
      await axios.patch(`/api/orders/${orderId}`, {
        status: "accepted",
        paymentStatus: "authorized",
      });

      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      toast.success("Order accepted! Funds will be released.");
    } catch (err) {
      console.error("❌ Accept order error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.sectionBlock}>
      {/* Admin uploads only when order is inprogress */}
      {isAdmin && currentStatus === "inprogress" && (
        <>
          <h3>Upload Completed Work (Admin)</h3>
          <input type="file" multiple onChange={handleFileChange} />
          {files.length > 0 && (
            <ul>
              {files.map((f) => (
                <li key={f.id}>
                  📎 <span>{f.filename}</span>
                  <button onClick={() => removeFile(f.id)}>Remove</button>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={handleUpload}
            className={styles.completeBtn}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Submit & Mark Completed"}
          </button>
        </>
      )}

      {/* Client accepts only when order is completed */}
      {!isAdmin && currentStatus === "completed" && (
        <button onClick={handleAccept} disabled={loading}>
          {loading ? "Processing..." : "Accept & Release Payment"}
        </button>
      )}
    </div>
  );
}
