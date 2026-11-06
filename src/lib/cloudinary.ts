import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  secure: true,
  // The SDK automatically uses process.env.CLOUDINARY_URL if available
  // cloudinary://<cloud_name>:<api_key>:<api_secret>@res.cloudinary.com/<cloud_name>
});

// In development, warn early if the key is missing so the 500 is obvious
if (!process.env.CLOUDINARY_URL && process.env.NODE_ENV === "development") {
  console.warn("[cloudinary] CLOUDINARY_URL is not set — /api/upload will fail with 500");
}

export default cloudinary;
