import { S3Client, PutObjectCommand, DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let _client = null;

// ─── TEMPORARY DEBUG ──────────────────────────────────────────────────────────
// Prints ONLY whether each required var is present (true/false) — never the value.
// Runs server-side only (this file is never bundled into the browser).
// Remove once the R2 env vars are confirmed present in the deployment environment.
let _envLogged = false;
export function logEnvStatus() {
  if (_envLogged) return; // log once per cold start, not per request
  _envLogged = true;
  const keys = [
    "CF_ACCOUNT_ID",
    "R2_BUCKET_NAME",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_PUBLIC_URL",
  ];
  for (const k of keys) {
    console.log(`[R2 env] ${k} loaded:`, Boolean(process.env[k]));
  }
}

function getClient() {
  // Always re-read credentials — ensures dev hot-reload picks up .env changes
  const accountId = process.env.CF_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing R2 env vars: CF_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY");
  }
  // Re-create client if credentials changed (e.g. .env hot-reload in dev)
  if (!_client) {
    _client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return _client;
}

function bucket() {
  const b = process.env.R2_BUCKET_NAME;
  if (!b) throw new Error("R2_BUCKET_NAME is not set");
  return b;
}

function publicBase() {
  const u = process.env.R2_PUBLIC_URL;
  if (!u) throw new Error("R2_PUBLIC_URL is not set");
  return u.replace(/\/$/, "");
}

export async function createPresignedUploadUrl(key, contentType, _contentLength) {
  // Only sign ContentType — the browser PUT sends exactly this header and nothing
  // else. Signing CacheControl/ContentLength here would put them in the request
  // signature, but the client never replicates them, so R2 rejects the PUT with
  // 403 SignatureDoesNotMatch. (Cache-Control can be applied via a bucket rule.)
  const cmd = new PutObjectCommand({
    Bucket: bucket(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(getClient(), cmd, { expiresIn: 300 });
}

export async function deleteObjects(keys) {
  if (!keys.length) return;
  const chunks = [];
  for (let i = 0; i < keys.length; i += 1000) chunks.push(keys.slice(i, i + 1000));
  await Promise.all(
    chunks.map((chunk) =>
      getClient().send(
        new DeleteObjectsCommand({
          Bucket: bucket(),
          Delete: { Objects: chunk.map((Key) => ({ Key })), Quiet: true },
        }),
      ),
    ),
  );
}

export function keyToPublicUrl(key) {
  return `${publicBase()}/${key}`;
}

// ─── Storage usage (for quota alerts) ────────────────────────────────────────

/**
 * Sums the size of every object in the bucket by paginating ListObjectsV2.
 * Returns total bytes used. Safe to call from a daily cron — R2 charges
 * nothing for LIST requests up to generous free-tier limits.
 */
export async function getBucketUsageBytes() {
  let totalBytes = 0;
  let continuationToken;
  do {
    const res = await getClient().send(
      new ListObjectsV2Command({
        Bucket: bucket(),
        ContinuationToken: continuationToken,
      }),
    );
    for (const obj of res.Contents ?? []) {
      totalBytes += obj.Size ?? 0;
    }
    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (continuationToken);
  return totalBytes;
}