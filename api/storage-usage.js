import { getBucketUsageBytes } from "./_r2.js";
import { getDatabaseSizeBytes, getStorageUsageBytes } from "./_supabase-usage.js";
import { sendAlertEmail } from "./_alert.js";

const GB = 1024 * 1024 * 1024;
const MB = 1024 * 1024;

// Free-tier limits, and the level at which we start warning.
const THRESHOLDS = {
  r2: { label: "Cloudflare R2 storage", warn: 9 * GB, limit: 10 * GB },
  db: { label: "Supabase database", warn: 430 * MB, limit: 500 * MB },
  storage: { label: "Supabase file storage", warn: 900 * MB, limit: 1 * GB },
};

/** Shared handler — usable from Vercel's serverless entry and local dev middleware. */
export async function handler(req) {
  const [r2Bytes, dbBytes, storageBytes] = await Promise.all([
    getBucketUsageBytes().catch((err) => {
      console.error("[storage-usage] R2 check failed:", err);
      return null;
    }),
    getDatabaseSizeBytes().catch((err) => {
      console.error("[storage-usage] Supabase DB check failed:", err);
      return null;
    }),
    getStorageUsageBytes().catch((err) => {
      console.error("[storage-usage] Supabase storage check failed:", err);
      return null;
    }),
  ]);

  const usage = { r2: r2Bytes, db: dbBytes, storage: storageBytes };

  const alerts = [];
  for (const key of Object.keys(THRESHOLDS)) {
    const t = THRESHOLDS[key];
    const used = usage[key];
    if (used !== null && used >= t.warn) {
      alerts.push({ key, ...t, used });
    }
  }

  const isCronRequest = req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;
  if (isCronRequest && alerts.length > 0) {
    await sendAlertEmail(alerts);
  }

  return {
    usage,
    limits: Object.fromEntries(Object.entries(THRESHOLDS).map(([k, v]) => [k, { warn: v.warn, limit: v.limit, label: v.label }])),
    alerts: alerts.map((a) => a.key),
    emailSent: isCronRequest && alerts.length > 0,
  };
}

/** Vercel serverless entry point */
export default async function storageUsageRoute(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const result = await handler(req);
    res.status(200).json(result);
  } catch (err) {
    console.error("[storage-usage]", err);
    res.status(500).json({ error: err?.message ?? "Failed to check storage usage." });
  }
}