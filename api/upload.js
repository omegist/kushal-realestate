import { createPresignedUploadUrl, keyToPublicUrl, logEnvStatus } from "./_r2.js";

const MAX_BYTES = 20 * 1024 * 1024;

const MIME_TO_EXT = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

/** Shared handler — called by both Vercel and the Vite dev middleware */
export async function handler(body) {
  logEnvStatus(); // TEMPORARY: prints true/false for each R2 var (never the value)
  const { propertyId, contentType, fileSize, mediaType } = body;

  if (!propertyId || typeof propertyId !== "string" || propertyId.length > 128) {
    throw new Error("Invalid propertyId.");
  }
  if (!["images", "videos"].includes(mediaType)) {
    throw new Error("Invalid mediaType.");
  }

  const ext = MIME_TO_EXT[contentType];
  if (!ext) {
    throw new Error(`File type "${contentType}" is not allowed.`);
  }
  if (!Number.isInteger(fileSize) || fileSize <= 0 || fileSize > MAX_BYTES) {
    throw new Error("Invalid fileSize.");
  }

  const uuid = crypto.randomUUID();
  const key = `properties/${propertyId}/${mediaType}/${uuid}.${ext}`;
  const presignedUrl = await createPresignedUploadUrl(key, contentType, fileSize);

  return { presignedUrl, publicUrl: keyToPublicUrl(key), key };
}

/** Vercel serverless entry point */
export default async function uploadRoute(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const result = await handler(req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err?.message ?? "Upload URL generation failed." });
  }
}
