export interface UploadUrlRequest {
  propertyId: string;
  contentType: string;
  fileSize: number;
  mediaType: "images" | "videos";
}

export interface UploadUrlResponse {
  presignedUrl: string;
  publicUrl: string;
  key: string;
}

export async function getUploadUrl(req: UploadUrlRequest): Promise<UploadUrlResponse> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to get upload URL.");
  return json as UploadUrlResponse;
}
