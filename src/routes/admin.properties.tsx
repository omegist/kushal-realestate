import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminShell } from "../components/AdminShell";
import { getAgency } from "../lib/data";
import { supabase } from "../lib/supabaseClient";
import { urlToKey } from "../lib/r2-client";
import { getUploadUrl } from "./-api.upload";
import { deleteFiles } from "./-api.delete-file";
import type { UploadUrlRequest } from "./-api.upload";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/admin/properties")({
  component: () => (
    <AdminShell>
      <ManageProperties />
    </AdminShell>
  ),
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface Property {
  id: string;
  created_at: string;
  title: string;
  type: string;
  category: string;
  location: string;
  area_buildup: string;
  area_carpet: string;
  floor: string;
  total_floors: string;
  construction_age: string;
  price: string;
  price_negotiable: boolean;
  description: string;
  features: string;
  contact_name: string;
  contact_phone: string;
  office_phone: string;
  status: string;
  is_featured: boolean;
  photos: string[];
  agency: "kushal" | "bhoomi";
}

type EditingProperty = Omit<Property, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

/**
 * A photo slot in the editor.
 *
 * - Existing (already in R2):  { kind: "url",  url: "https://..." }
 * - Pending (browser memory):  { kind: "file", file: File, previewUrl: string }
 *
 * Pending files are never uploaded until Save is clicked.
 * previewUrl is a blob: URL created with URL.createObjectURL and revoked on cleanup.
 */
type PhotoSlot =
  | { kind: "url"; url: string }
  | { kind: "file"; file: File; previewUrl: string };

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPES = ["Residential", "Commercial", "Plot"] as const;
const CATEGORIES = ["Sale", "Rent", "New Construction", "Resale"] as const;
const STATUSES = ["Active", "Sold", "Rented"] as const;
const AGENCIES = [
  { value: "kushal", label: "Kushal Enterprises" },
  { value: "bhoomi", label: "Bhoomi Realty" },
] as const;

const EMPTY: EditingProperty = {
  title: "",
  type: "Residential",
  category: "Sale",
  location: "",
  area_buildup: "",
  area_carpet: "",
  floor: "",
  total_floors: "",
  construction_age: "",
  price: "",
  price_negotiable: false,
  description: "",
  features: "",
  contact_name: "Anil",
  contact_phone: "9029847968",
  office_phone: "9326313320",
  status: "Active",
  is_featured: false,
  photos: [],
  agency: "kushal",
};

// ─── Image compression ────────────────────────────────────────────────────────

const COMPRESSION_THRESHOLD = 1 * 1024 * 1024; // 1 MB
const MAX_DIMENSION = 2400; // px

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= COMPRESSION_THRESHOLD) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }

      ctx.drawImage(img, 0, 0, width, height);

      const quality = file.size > 5 * 1024 * 1024 ? 0.85 : 0.92;
      const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) { resolve(file); return; }
          resolve(new File([blob], file.name, { type: outputType }));
        },
        outputType,
        quality,
      );
    };

    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });
}

// ─── Upload helper ────────────────────────────────────────────────────────────

async function uploadFileToR2(
  file: File,
  propertyId: string,
  onProgress: (pct: number) => void,
): Promise<string> {
  const compressed = await compressImage(file);

  const req: UploadUrlRequest = {
    propertyId,
    contentType: compressed.type,
    fileSize: compressed.size,
    mediaType: compressed.type.startsWith("video/") ? "videos" : "images",
  };
  console.debug("[upload] requesting presigned URL", { name: file.name, type: compressed.type, size: compressed.size });
  const { presignedUrl, publicUrl } = await getUploadUrl(req);
  const putHost = (() => { try { return new URL(presignedUrl).host; } catch { return "?"; } })();
  console.debug("[upload] presigned URL generated", { host: putHost, publicUrl });

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", compressed.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        console.debug("[upload] PUT succeeded", { status: xhr.status, host: putHost });
        onProgress(100);
        resolve();
      } else {
        // R2 responded but rejected the object — surface the real cause + body.
        const body = xhr.responseText?.slice(0, 500) ?? "";
        console.error("[upload] PUT rejected by R2", { status: xhr.status, host: putHost, body });
        reject(new Error(r2StatusMessage(xhr.status, body)));
      }
    };
    xhr.onerror = () => {
      // status 0 + onerror = the request never completed at the network layer.
      // For a cross-origin PUT to R2 the overwhelmingly common cause is a failed
      // CORS preflight (the bucket has no CORS rule allowing this origin + PUT).
      // Genuine connectivity loss is the only other cause, so name both.
      console.error("[upload] PUT failed at network layer", { status: xhr.status, host: putHost });
      reject(new Error(
        `Upload blocked before it reached storage (host ${putHost}). ` +
        `This is almost always a missing R2 CORS rule for this site's origin ` +
        `(the browser preflight was rejected), or a lost connection.`,
      ));
    };
    xhr.ontimeout = () => reject(new Error("Upload timed out — the file may be too large or the connection too slow."));
    xhr.timeout = 120_000;

    xhr.send(compressed);
  });

  return publicUrl;
}

/** Map an R2/S3 HTTP status to a human-meaningful cause instead of a bare code. */
function r2StatusMessage(status: number, body: string): string {
  const code = /<Code>([^<]+)<\/Code>/.exec(body)?.[1];
  switch (status) {
    case 400: return `Cloudflare rejected the upload (400${code ? ` ${code}` : ""}) — content-type or key invalid.`;
    case 403: return `Cloudflare rejected the upload (403${code ? ` ${code}` : ""}) — signature mismatch, expired URL, or invalid credentials.`;
    case 404: return "Cloudflare rejected the upload (404) — bucket not found.";
    case 413: return "Cloudflare rejected the upload (413) — file exceeds the allowed size.";
    default:  return `Cloudflare rejected the upload (${status}${code ? ` ${code}` : ""}).`;
  }
}

// ─── useUpload hook ───────────────────────────────────────────────────────────

interface UploadState {
  uploading: boolean;
  progress: number[];
}

function useUpload() {
  const [state, setState] = useState<UploadState>({ uploading: false, progress: [] });

  /**
   * Atomic upload: every file must succeed or the whole batch is considered failed.
   *
   * Resolves with all public URLs (same order as input) when every upload succeeds.
   * Rejects with an AtomicUploadError that carries the keys already uploaded
   * so the caller can delete them as part of a rollback.
   */
  const upload = useCallback(async (
    files: File[],
    propertyId: string,
  ): Promise<string[]> => {
    if (!files.length) return [];

    setState({ uploading: true, progress: files.map(() => 0) });

    // Track every URL that lands in R2 so we can roll them back on any failure.
    const uploadedUrls: string[] = [];

    try {
      const urls = await Promise.all(
        files.map((file, i) =>
          uploadFileToR2(file, propertyId, (pct) =>
            setState((prev) => {
              const next = [...prev.progress];
              next[i] = pct;
              return { ...prev, progress: next };
            }),
          ).then((url) => {
            uploadedUrls.push(url);
            return url;
          }),
        ),
      );
      setState({ uploading: false, progress: [] });
      return urls;
    } catch (err) {
      setState({ uploading: false, progress: [] });
      // Attach already-uploaded URLs so the caller can clean them up
      throw new AtomicUploadError(
        err instanceof Error ? err.message : "An upload failed.",
        uploadedUrls,
      );
    }
  }, []);

  return { ...state, upload };
}

/** Thrown by upload() when any file in the batch fails. */
class AtomicUploadError extends Error {
  readonly uploadedUrls: string[];
  constructor(message: string, uploadedUrls: string[]) {
    super(message);
    this.name = "AtomicUploadError";
    this.uploadedUrls = uploadedUrls;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

function ManageProperties() {
  const [rows, setRows] = useState<Property[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<EditingProperty | null>(null);

  /**
   * Photo slots for the editor.
   * - "url" slots = already in R2 (existing property photos)
   * - "file" slots = selected by user, living only in browser memory
   *
   * Nothing is uploaded until Save is clicked.
   */
  const [slots, setSlots] = useState<PhotoSlot[]>([]);

  // Snapshot of the original URL slots when the modal opens — used to detect removals
  const originalUrls = useRef<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, progress, upload } = useUpload();

  // Revoke all pending blob: URLs to free browser memory
  const revokePendingPreviews = useCallback((target: PhotoSlot[]) => {
    target.forEach((s) => { if (s.kind === "file") URL.revokeObjectURL(s.previewUrl); });
  }, []);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[Supabase] load properties:", error);
      toast.error("Failed to load properties.");
      return;
    }
    setRows((data as Property[]) ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (row: Property) => {
    originalUrls.current = [...(row.photos ?? [])];
    setSlots((row.photos ?? []).map((url) => ({ kind: "url", url })));
    setEditing({ ...row });
  };

  const openNew = () => {
    originalUrls.current = [];
    setSlots([]);
    setEditing({ ...EMPTY });
  };

  const closeModal = () => {
    revokePendingPreviews(slots);
    setSlots([]);
    setEditing(null);
  };

  // Add newly selected files as pending slots (no upload yet)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const newSlots: PhotoSlot[] = Array.from(e.target.files).map((file) => ({
      kind: "file",
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setSlots((prev) => [...prev, ...newSlots]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeSlot = (index: number) => {
    setSlots((prev) => {
      const slot = prev[index];
      if (slot.kind === "file") URL.revokeObjectURL(slot.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    const existingUrls = slots
      .filter((s): s is { kind: "url"; url: string } => s.kind === "url")
      .map((s) => s.url);
    const pendingFiles = slots
      .filter((s): s is { kind: "file"; file: File; previewUrl: string } => s.kind === "file")
      .map((s) => s.file);
    const isNew = !editing.id;

    // ── NEW PROPERTY ──────────────────────────────────────────────────────────
    if (isNew) {
      // Step 1: Insert the property with no photos yet to get the real ID
      const { id: _id, created_at: _ca, ...payload } = editing as Property;
      const { data: inserted, error: insertError } = await supabase
        .from("properties")
        .insert({ ...payload, photos: [] })
        .select("id")
        .single();

      if (insertError || !inserted) {
        console.error("[Supabase] insert property:", insertError);
        toast.error("Failed to create property. Please try again.");
        return;
      }

      const propertyId: string = inserted.id;

      // Step 2: Upload all files atomically — all must succeed or we roll back
      if (pendingFiles.length) {
        let uploadedUrls: string[];
        try {
          uploadedUrls = await upload(pendingFiles, propertyId);
        } catch (err) {
          // Roll back any files that did land in R2
          const partialUrls = err instanceof AtomicUploadError ? err.uploadedUrls : [];
          if (partialUrls.length) {
            const keys = partialUrls.map(urlToKey).filter(Boolean);
            if (keys.length) deleteFiles(keys).catch(console.error);
          }
          // Roll back the property record
          await supabase.from("properties").delete().eq("id", propertyId);
          const reason = err instanceof Error ? err.message : "Upload failed.";
          toast.error("Upload failed — property was not saved.", {
            description: `${reason} Please try again.`,
            duration: 8000,
          });
          return;
        }

        // Step 3: Patch the property record with the confirmed photo URLs
        const { error: patchError } = await supabase
          .from("properties")
          .update({ photos: uploadedUrls })
          .eq("id", propertyId);

        if (patchError) {
          console.error("[Supabase] patch photos:", patchError);
          // All files are in R2 but the DB has no URLs — clean up both
          const keys = uploadedUrls.map(urlToKey).filter(Boolean);
          if (keys.length) deleteFiles(keys).catch(console.error);
          await supabase.from("properties").delete().eq("id", propertyId);
          toast.error("Failed to save photo URLs. Property was rolled back.");
          return;
        }
      }

      toast.success("Property created successfully.");

    // ── EXISTING PROPERTY ─────────────────────────────────────────────────────
    } else {
      const propertyId = editing.id!;

      // Step 1: Upload new files atomically — all must succeed or we abort
      let uploadedUrls: string[] = [];
      if (pendingFiles.length) {
        try {
          uploadedUrls = await upload(pendingFiles, propertyId);
        } catch (err) {
          // Roll back any files that did land in R2
          const partialUrls = err instanceof AtomicUploadError ? err.uploadedUrls : [];
          if (partialUrls.length) {
            const keys = partialUrls.map(urlToKey).filter(Boolean);
            if (keys.length) deleteFiles(keys).catch(console.error);
          }
          const reason = err instanceof Error ? err.message : "Upload failed.";
          toast.error("Upload failed — property was not updated.", {
            description: `${reason} Please try again.`,
            duration: 8000,
          });
          return;
        }
      }

      // Step 2: Update the property record with all confirmed URLs
      const finalPhotos = [...existingUrls, ...uploadedUrls];
      const { id: _id, created_at: _ca, ...payload } = editing as Property;
      const { error: updateError } = await supabase
        .from("properties")
        .update({ ...payload, photos: finalPhotos })
        .eq("id", propertyId);

      if (updateError) {
        console.error("[Supabase] update property:", updateError);
        // DB write failed — roll back the newly uploaded files
        if (uploadedUrls.length) {
          const keys = uploadedUrls.map(urlToKey).filter(Boolean);
          if (keys.length) deleteFiles(keys).catch(console.error);
        }
        toast.error("Failed to save property. Please try again.");
        return;
      }

      // Step 3: Delete photos removed during editing — only after DB write succeeds
      const removedUrls = originalUrls.current.filter((u) => !existingUrls.includes(u));
      if (removedUrls.length) {
        const keys = removedUrls.map(urlToKey).filter(Boolean);
        if (keys.length) deleteFiles(keys).catch((err) => console.error("[R2] cleanup removed:", err));
      }

      toast.success("Property saved successfully.");
    }

    revokePendingPreviews(slots);
    setSlots([]);
    setEditing(null);
    load();
  };

  const del = async (row: Property) => {
    if (!confirm("Delete this property and all its media?")) return;

    // Step 1: Delete the DB record first
    const { error } = await supabase.from("properties").delete().eq("id", row.id);
    if (error) {
      console.error("[Supabase] delete property:", error);
      toast.error("Failed to delete property.");
      return;
    }

    // Step 2: Best-effort R2 cleanup (fire-and-forget after DB is clean)
    const keys = (row.photos ?? []).map(urlToKey).filter(Boolean);
    if (keys.length) deleteFiles(keys).catch((err) => console.error("[R2] cleanup on delete:", err));

    toast.success("Property deleted.");
    load();
  };

  const toggleFeatured = async (row: Property) => {
    const { error } = await supabase
      .from("properties")
      .update({ is_featured: !row.is_featured })
      .eq("id", row.id);
    if (error) { toast.error("Failed to update featured status."); return; }
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Properties</h1>
        <button onClick={openNew} className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy">
          + Add New Property
        </button>
      </div>

      <div className="mt-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search properties by name..."
          className="w-full max-w-md rounded-lg border border-border bg-navy px-4 py-2.5 text-sm text-white placeholder:text-grey-light focus:border-gold focus:outline-none"
        />
      </div>

      <div className="admin-card mt-5 overflow-x-auto rounded-xl">
        <table className="w-full text-left text-sm">
          <thead className="text-grey-light font-semibold">
            <tr className="border-b border-border">
              <th className="p-3">Photo</th>
              <th className="p-3">Title</th>
              <th className="p-3">Type</th>
              <th className="p-3">Agency</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const filteredRows = rows.filter((r) =>
                r.title.toLowerCase().includes(search.trim().toLowerCase())
              );
              if (rows.length === 0) {
                return (
                  <tr>
                    <td colSpan={7} className="p-5 text-center text-grey-light">
                      No properties yet. Add your first listing.
                    </td>
                  </tr>
                );
              }
              if (filteredRows.length === 0) {
                return (
                  <tr>
                    <td colSpan={7} className="p-5 text-center text-grey-light">
                      No properties match "{search}".
                    </td>
                  </tr>
                );
              }
              return filteredRows.map((r) => (
                <tr key={r.id} className="border-b border-border text-white">
                  <td className="p-3">
                    {r.photos?.[0] ? (
                      <img src={r.photos[0]} alt="" className="h-10 w-14 rounded object-cover" />
                    ) : (
                      <div className="flex h-10 w-14 items-center justify-center rounded bg-card">🏢</div>
                    )}
                  </td>
                  <td className="p-3 max-w-[220px] truncate">
                    {r.title}{r.is_featured && <span className="ml-1 text-gold">★</span>}
                  </td>
                  <td className="p-3">{r.type}</td>
                  <td className="p-3">{getAgency(r.agency).label}</td>
                  <td className="p-3 text-gold">{r.price}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3 whitespace-nowrap">
                    <button onClick={() => openEdit(r)} className="text-emerald hover:underline">Edit</button>
                    <button onClick={() => toggleFeatured(r)} className="ml-3 text-gold hover:underline">
                      {r.is_featured ? "Unfeature" : "Feature"}
                    </button>
                    <button onClick={() => del(r)} className="ml-3 text-red-400 hover:underline">Delete</button>
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4"
          onClick={closeModal}
        >
          <form
            onSubmit={save}
            className="admin-card my-8 w-full max-w-2xl space-y-3 rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl font-bold text-white">
              {editing.id ? "Edit" : "Add"} Property
            </h2>

            <input required placeholder="Title *" value={editing.title}
              onChange={(e) => setEditing((p) => p && { ...p, title: e.target.value })} className={inp} />

            <div className="grid gap-3 sm:grid-cols-2">
              <select value={editing.type} onChange={(e) => setEditing((p) => p && { ...p, type: e.target.value })} className={inp}>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <select value={editing.category} onChange={(e) => setEditing((p) => p && { ...p, category: e.target.value })} className={inp}>
                {CATEGORIES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            <input required placeholder="Location *" value={editing.location}
              onChange={(e) => setEditing((p) => p && { ...p, location: e.target.value })} className={inp} />

            <div className="grid gap-3 sm:grid-cols-2">
              <input placeholder="Area Buildup" value={editing.area_buildup ?? ""} onChange={(e) => setEditing((p) => p && { ...p, area_buildup: e.target.value })} className={inp} />
              <input placeholder="Area Carpet" value={editing.area_carpet ?? ""} onChange={(e) => setEditing((p) => p && { ...p, area_carpet: e.target.value })} className={inp} />
              <input placeholder="Floor" value={editing.floor ?? ""} onChange={(e) => setEditing((p) => p && { ...p, floor: e.target.value })} className={inp} />
              <input placeholder="Total Floors" value={editing.total_floors ?? ""} onChange={(e) => setEditing((p) => p && { ...p, total_floors: e.target.value })} className={inp} />
              <input placeholder="Construction Age" value={editing.construction_age ?? ""} onChange={(e) => setEditing((p) => p && { ...p, construction_age: e.target.value })} className={inp} />
              <input required placeholder="Price *" value={editing.price} onChange={(e) => setEditing((p) => p && { ...p, price: e.target.value })} className={inp} />
            </div>

            <textarea placeholder="Description" rows={3} value={editing.description ?? ""}
              onChange={(e) => setEditing((p) => p && { ...p, description: e.target.value })} className={inp} />
            <textarea placeholder="Features (comma separated)" rows={2} value={editing.features ?? ""}
              onChange={(e) => setEditing((p) => p && { ...p, features: e.target.value })} className={inp} />

            <div className="grid gap-3 sm:grid-cols-3">
              <input placeholder="Contact Name" value={editing.contact_name ?? ""} onChange={(e) => setEditing((p) => p && { ...p, contact_name: e.target.value })} className={inp} />
              <input placeholder="Contact Phone" value={editing.contact_phone ?? ""} onChange={(e) => setEditing((p) => p && { ...p, contact_phone: e.target.value })} className={inp} />
              <input placeholder="Office Phone" value={editing.office_phone ?? ""} onChange={(e) => setEditing((p) => p && { ...p, office_phone: e.target.value })} className={inp} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <select value={editing.status} onChange={(e) => setEditing((p) => p && { ...p, status: e.target.value })} className={inp}>
                {STATUSES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <div className="flex items-center gap-4 text-sm text-white">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={!!editing.price_negotiable}
                    onChange={(e) => setEditing((p) => p && { ...p, price_negotiable: e.target.checked })} />
                  Negotiable
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={!!editing.is_featured}
                    onChange={(e) => setEditing((p) => p && { ...p, is_featured: e.target.checked })} />
                  Featured
                </label>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-grey-light">Listed By</p>
              <div className="flex flex-wrap gap-4 rounded-lg border border-border bg-navy px-4 py-3 text-sm text-white">
                {AGENCIES.map((a) => (
                  <label key={a.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="agency"
                      checked={(editing.agency ?? "kushal") === a.value}
                      onChange={() => setEditing((p) => p && { ...p, agency: a.value })}
                    />
                    {a.label}
                  </label>
                ))}
              </div>
            </div>

            {/* ── Media upload ── */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                multiple
                disabled={uploading}
                onChange={handleFileChange}
                className="w-full text-sm text-grey-light disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-grey-light">
                Max 20 MB per file · Images over 1 MB are compressed automatically · Uploads start when you save
              </p>

              {/* Per-file upload progress — only visible during save */}
              {uploading && progress.length > 0 && (
                <div className="mt-2 space-y-1">
                  {progress.map((pct, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-emerald">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                        <div className="h-full bg-emerald transition-all duration-150" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right">{pct}%</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Photo slots — existing (R2 URLs) and pending (blob previews) */}
              {slots.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {slots.map((slot, i) => {
                    const src = slot.kind === "url" ? slot.url : slot.previewUrl;
                    return (
                      <div key={src} className="relative">
                        {i === 0 && (
                          <span className="absolute -top-1 left-0 rounded bg-gold px-1 text-[10px] font-bold text-navy">
                            Cover
                          </span>
                        )}
                        {slot.kind === "file" && (
                          <span className="absolute -top-1 right-5 rounded bg-navy/80 px-1 text-[10px] text-grey-light">
                            pending
                          </span>
                        )}
                        <img src={src} alt="" className="h-16 w-16 rounded object-cover" />
                        <button
                          type="button"
                          onClick={() => removeSlot(i)}
                          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                        >×</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={uploading}
                className="flex-1 rounded-lg bg-emerald py-2.5 font-semibold text-white disabled:opacity-50">
                Save Property
              </button>
              <button type="button" onClick={closeModal}
                className="flex-1 rounded-lg border border-border py-2.5 text-grey-light font-medium">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const inp =
  "w-full rounded-lg border border-border bg-navy px-4 py-2.5 text-sm text-white placeholder:text-grey-light placeholder:font-medium focus:border-gold focus:outline-none";