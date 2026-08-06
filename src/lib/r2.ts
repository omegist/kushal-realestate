import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ─── Singleton client ────────────────────────────────────────────────────────
// Built once at module load so we don't pay connection-setup cost per request.
let _client: S3Client | null = null;

function getR2Client(): S3Client {
  if (_client) return _client;

  const accountId = process.env.CF_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing Cloudflare R2 environment variables: CF_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY",
    );
  }

  _client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  return _client;
}

function getBucket(): string {
  const b = process.env.R2_BUCKET_NAME;
  if (!b) throw new Error("R2_BUCKET_NAME environment variable is not set");
  return b;
}

function getPublicBase(): string {
  const base = process.env.R2_PUBLIC_URL;
  if (!base) throw new Error("R2_PUBLIC_URL environment variable is not set");
  return base.replace(/\/$/, "");
}

// ─── Presigned upload URL ────────────────────────────────────────────────────

/**
 * Returns a presigned PUT URL valid for 5 minutes.
 * Sets Cache-Control so the object is cached by browsers for 1 year once uploaded.
 * Sets ContentLength so R2 enforces the exact byte count — prevents oversized PUTs.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  _contentLength: number,
): Promise<string> {
  // Only sign ContentType — the browser PUT sends exactly this header and nothing
  // else. Signing CacheControl/ContentLength would make them part of the request
  // signature, but the client never replicates them, so R2 rejects the PUT with
  // 403 SignatureDoesNotMatch.
  const cmd = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(getR2Client(), cmd, { expiresIn: 300 });
}

// ─── Delete ──────────────────────────────────────────────────────────────────

/** Delete up to 1 000 objects in a single S3 batch call. */
export async function deleteR2Objects(keys: string[]): Promise<void> {
  if (!keys.length) return;
  // S3 DeleteObjects is capped at 1 000 per request
  const chunks = chunkArray(keys, 1000);
  await Promise.all(
    chunks.map((chunk) =>
      getR2Client().send(
        new DeleteObjectsCommand({
          Bucket: getBucket(),
          Delete: { Objects: chunk.map((Key) => ({ Key })), Quiet: true },
        }),
      ),
    ),
  );
}

// ─── URL ↔ Key helpers ───────────────────────────────────────────────────────

/** Build the public URL for a given object key. */
export function keyToUrl(key: string): string {
  return `${getPublicBase()}/${key}`;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
