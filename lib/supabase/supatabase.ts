import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// ✅ Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const BUCKET_NAME = "kwi";

/**
 * Uploads a file (Buffer or Blob) to Supabase Storage
 */
export async function uploadFileToSupabase(
  file: Buffer | Blob,
  filename: string,
  folder: string
): Promise<{ url: string; public_id: string }> {
  const filePath = `${folder}/${uuidv4()}-${filename}`;

  const contentType =
    file instanceof Blob
      ? file.type || "application/octet-stream"
      : "application/octet-stream";

  // ✅ Type assertion for Supabase: convert Buffer to Uint8Array
  const uploadFile: string | Uint8Array | Blob =
    file instanceof Buffer ? new Uint8Array(file) : file;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, uploadFile, {
      cacheControl: "3600",
      upsert: false,
      contentType,
    });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    url: publicUrlData.publicUrl,
    public_id: filePath,
  };
}

/**
 * Deletes a file from Supabase Storage
 */
export async function deleteFileFromSupabase(filePath: string) {
  console.log("🗑 Attempting to delete:", filePath);

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);
  if (error) throw error;

  console.log("✅ Deleted from Supabase:", data);
  return data;
}
