import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "../components/AdminShell";
import { supabase } from "../lib/supabaseClient";

export const Route = createFileRoute("/admin/inquiries")({
  component: () => (
    <AdminShell>
      <Inquiries />
    </AdminShell>
  ),
});

function Inquiries() {
  const [rows, setRows] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const load = async () => {
    const { data } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const markRead = async (id: string, val: boolean) => {
    await supabase.from("inquiries").update({ is_read: val }).eq("id", id);
    load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    await supabase.from("inquiries").delete().eq("id", id);
    load();
  };

  const filtered = rows.filter((r) => filter === "all" || (filter === "unread" ? !r.is_read : r.is_read));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Inquiries</h1>
      <div className="mt-4 flex gap-2">
        {(["all", "unread", "read"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${filter === f ? "bg-emerald text-white" : "border border-border text-grey-light"}`}>{f}</button>
        ))}
      </div>
      <div className="admin-card mt-5 overflow-x-auto rounded-xl">
        <table className="w-full text-left text-sm">
          <thead className="text-grey-light font-semibold">
            <tr className="border-b border-border">
              <th className="p-3">Name</th><th className="p-3">Phone</th><th className="p-3">Email</th><th className="p-3">Property</th><th className="p-3">Message</th><th className="p-3">Date</th><th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-5 text-center text-grey-light">No inquiries.</td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id} className={`border-b border-border ${r.is_read ? "text-grey-light" : "text-white"}`}>
                <td className="p-3">{!r.is_read && <span className="mr-1 text-emerald">●</span>}{r.name}</td>
                <td className="p-3">{r.phone}</td>
                <td className="p-3">{r.email ?? "—"}</td>
                <td className="p-3">{r.property_title ?? r.subject ?? "—"}</td>
                <td className="p-3 max-w-[200px] truncate">{r.message ?? "—"}</td>
                <td className="p-3">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="p-3 whitespace-nowrap">
                  <button onClick={() => markRead(r.id, !r.is_read)} className="text-emerald hover:underline">{r.is_read ? "Unread" : "Read"}</button>
                  <button onClick={() => del(r.id)} className="ml-3 text-red-400 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}