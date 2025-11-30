import { connectDB } from "@/lib/DB/ConnectDB";
import { SubmissionFile } from "@/lib/interface/interface";
import SubmissionModel from "@/lib/model/Submission";
import { NextRequest, NextResponse } from "next/server";

// -------------------- POST --------------------
export async function POST(req: NextRequest) {
  console.log("📡 [POST] /api/submissions called");
  await connectDB();
  console.log("✅ Database connected");

  try {
    const { orderId, clerkId, email, files } = await req.json();
    console.log("📥 Parsed request body:", { orderId, clerkId, email, files });

    if (!files?.length || !orderId || !clerkId) {
      console.warn("⚠️ Missing required fields:", { orderId, clerkId, files });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("🔍 Looking for existing submission with orderId:", orderId);
    let submission = await SubmissionModel.findOne({ orderId });

    if (submission) {
      console.log("📂 Found existing submission. Checking for duplicates...");
      const existingIds = new Set(submission.files.map((f) => f.fileId));
      const newFiles = files.filter(
        (f: SubmissionFile) => !existingIds.has(f.fileId)
      );

      if (newFiles.length) {
        console.log("➕ Appending new files:", newFiles);
        submission.files.push(...newFiles);
        await submission.save();
        console.log("✅ Submission updated successfully");
      } else {
        console.log("ℹ️ No new files to add");
      }
    } else {
      console.log("🆕 Creating new submission record");
      submission = await SubmissionModel.create({
        orderId,
        clerkId,
        email,
        files,
      });
      console.log("✅ Submission created successfully");
    }

    return NextResponse.json(submission.toObject(), { status: 201 });
  } catch (error) {
    console.error("❌ Error in POST /api/submissions:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// -------------------- GET --------------------
export async function GET(req: NextRequest) {
  console.log("📡 [GET] /api/submissions called with url:", req.url);
  await connectDB();
  console.log("✅ Database connected");

  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("orderId");
    console.log("🔍 Extracted orderId:", orderId);

    if (!orderId) {
      console.warn("⚠️ Missing orderId in query params");
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const submission = await SubmissionModel.findOne({ orderId }).lean<{
      orderId: string;
      clerkId: string;
      email?: string;
      files: SubmissionFile[];
      createdAt: Date;
      updatedAt: Date;
    }>();

    if (!submission) {
      console.log("ℹ️ No submission found for orderId:", orderId);
      return NextResponse.json({ files: [] }, { status: 200 });
    }

    const responseData = {
      orderId: submission.orderId,
      clerkId: submission.clerkId,
      email: submission.email,
      files: submission.files,
      createdAt: submission.createdAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
    };

    console.log("✅ Returning submission data:", responseData);
    return NextResponse.json(responseData, { status: 200 });
  } catch (error: unknown) {
    console.error("❌ Error in GET /api/submissions:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
