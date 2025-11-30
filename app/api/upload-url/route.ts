import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with project URL and service key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Handle POST requests
export async function POST(req: Request) {
  try {
    // Extract the file name from the request body
    const { fileName } = await req.json();

    // Create a signed upload URL for the incoming file
    const { data, error } = await supabase.storage
      .from("kwi")
      .createSignedUploadUrl(`uploads/${Date.now()}-${fileName}`);

    // Handle Supabase error
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Return signed URL data
    return NextResponse.json(data);
  } catch (err) {
    // Handle unexpected server error
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
