export async function deleteFiles(keys: string[]): Promise<void> {
  if (!keys.length) return;
  const res = await fetch("/api/delete-files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keys }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as any).error ?? "Failed to delete files.");
  }
}
