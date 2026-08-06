import { deleteObjects } from "./_r2.js";

const MAX_KEYS = 500;

/** Shared handler — called by both Vercel and the Vite dev middleware */
export async function handler(body) {
  const { keys } = body;
  if (!Array.isArray(keys) || keys.length === 0) {
    throw new Error("keys must be a non-empty array.");
  }
  if (keys.length > MAX_KEYS) {
    throw new Error(`Cannot delete more than ${MAX_KEYS} files per request.`);
  }
  if (keys.some((k) => typeof k !== "string" || k.length === 0 || k.length > 1024)) {
    throw new Error("Invalid key in array.");
  }
  await deleteObjects(keys);
  return { deleted: keys.length };
}

/** Vercel serverless entry point */
export default async function deleteFilesRoute(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const result = await handler(req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error("[R2] delete-files:", err);
    res.status(400).json({ error: err?.message ?? "Delete failed." });
  }
}
