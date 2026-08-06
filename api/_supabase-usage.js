import { createClient } from "@supabase/supabase-js";

let _admin = null;

/**
 * Admin client using the SERVICE ROLE key — required to read database size
 * and to list every file across all storage buckets. This key must never be
 * exposed to the browser; it is only read here, inside a serverless function.
 */
function getAdminClient() {
  if (_admin) return _admin;
  const rawUrl = process.env.VITE_SUPABASE_URL;
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!rawUrl || !rawKey) {
    throw new Error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  }
  // Defensive cleanup: strip accidental quotes/whitespace/trailing slash that
  // are easy to introduce when copy-pasting into a .env file.
  const url = rawUrl.trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");
  const serviceKey = rawKey.trim().replace(/^["']|["']$/g, "");
  try {
    new URL(url);
  } catch {
    throw new Error(`VITE_SUPABASE_URL is not a valid URL: "${url}". It should look like https://xxxxx.supabase.co with no quotes, spaces, or trailing slash.`);
  }
  _admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  return _admin;
}

/**
 * Reads the Postgres database size in bytes via the `get_database_size_bytes()`
 * function (see supabase_setup.sql — must be created once in the Supabase SQL editor).
 */
export async function getDatabaseSizeBytes() {
  const { data, error } = await getAdminClient().rpc("get_database_size_bytes");
  if (error) throw new Error(`Failed to read database size: ${error.message}`);
  return Number(data ?? 0);
}

/**
 * Sums the size of every file across every Supabase Storage bucket.
 * Recurses into folders. Capped defensively at 20 000 objects per bucket
 * so a runaway bucket can't hang the cron job.
 */
export async function getStorageUsageBytes() {
  const admin = getAdminClient();
  const { data: buckets, error } = await admin.storage.listBuckets();
  if (error) throw new Error(`Failed to list storage buckets: ${error.message}`);

  let totalBytes = 0;
  for (const bucket of buckets ?? []) {
    totalBytes += await sumFolderBytes(admin, bucket.name, "", 0);
  }
  return totalBytes;
}

async function sumFolderBytes(admin, bucketName, path, objectsSeen) {
  const MAX_OBJECTS = 20000;
  let total = 0;
  let offset = 0;
  const limit = 1000;

  while (objectsSeen < MAX_OBJECTS) {
    const { data: items, error } = await admin.storage.from(bucketName).list(path, { limit, offset });
    if (error) throw new Error(`Failed to list "${bucketName}/${path}": ${error.message}`);
    if (!items || items.length === 0) break;

    for (const item of items) {
      objectsSeen++;
      const isFolder = item.id === null && item.metadata === null;
      const itemPath = path ? `${path}/${item.name}` : item.name;
      if (isFolder) {
        total += await sumFolderBytes(admin, bucketName, itemPath, objectsSeen);
      } else {
        total += item.metadata?.size ?? 0;
      }
    }

    if (items.length < limit) break;
    offset += limit;
  }
  return total;
}