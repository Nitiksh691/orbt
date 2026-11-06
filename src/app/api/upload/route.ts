import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/adminAuth";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  // 🔒 Admin-only endpoint
  const authError = requireAdmin(req);
  if (authError) return authError;

  if (!process.env.CLOUDINARY_URL) {
    return NextResponse.json(
      { error: "Cloudinary not configured (missing CLOUDINARY_URL)" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const image = body?.image as string | undefined;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!image.startsWith("data:image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }
    const base64Data = image.split(",")[1] ?? "";
    const approxBytes = Math.ceil(base64Data.length * 0.75);
    if (approxBytes > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Image too large (max 10MB). Use a smaller image." }, { status: 413 });
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: "orbt/menu",
      resource_type: "image",
      transformation: [
        { width: 1200, height: 1200, crop: "limit" },
        { quality: "auto:good", fetch_format: "auto" }
      ]
    });

    if (!result?.secure_url) {
      return NextResponse.json({ error: "Cloudinary did not return a URL" }, { status: 502 });
    }

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[api/upload] Cloudinary upload error:", message);
    return NextResponse.json(
      { error: "Failed to upload image", detail: process.env.NODE_ENV === "development" ? message : undefined },
      { status: 500 }
    );
  }
}
