import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "../components/AdminShell";
import { supabase } from "../lib/supabaseClient";

export const Route = createFileRoute("/admin/dashboard")({
  component: () => (
    <AdminShell>
      <Dashboard />
    </AdminShell>
  ),
});

function Dashboard() {
  const [stats, setStats] = useState({ properties: 0, inquiries: 0, unread: 0, team: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [p, i, u, t, r] = await Promise.all([
        supabase.from("properties").select("*", { count: "exact", head: true }),
        supabase.from("inquiries").select("*", { count: "exact", head: true }),
        supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("is_read", false),
        supabase.from("team_members").select("*", { count: "exact", head: true }),
        supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      setStats({ properties: p.count ?? 0, inquiries: i.count ?? 0, unread: u.count ?? 0, team: t.count ?? 0 });
      setRecent(r.data ?? []);
    })();
  }, []);

  const cards = [
    { label: "Total Properties", value: stats.properties, icon: "🏢" },
    { label: "Total Inquiries", value: stats.inquiries, icon: "📋" },
    { label: "Unread Inquiries", value: stats.unread, icon: "🔔" },
    { label: "Team Members", value: stats.team, icon: "👥" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="admin-card rounded-xl p-5">
            <div className="text-2xl">{c.icon}</div>
            <div className="mt-2 font-display text-3xl font-bold text-gold">{c.value}</div>
            <div className="text-sm text-grey">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/admin/properties" className="rounded-lg bg-emerald px-5 py-2.5 text-sm font-semibold text-white">+ Manage Properties</Link>
        <Link to="/admin/inquiries" className="rounded-lg border border-gold/40 px-5 py-2.5 text-sm font-semibold text-gold">View Inquiries</Link>
      </div>

      <h2 className="mt-10 font-display text-xl font-bold text-white">Recent Inquiries</h2>
      <div className="admin-card mt-4 overflow-x-auto rounded-xl">
        <table className="w-full text-left text-sm">
          <thead className="text-grey">
            <tr className="border-b border-border">
              <th className="p-3">Name</th><th className="p-3">Phone</th><th className="p-3">Property</th><th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr><td colSpan={4} className="p-5 text-center text-grey">No inquiries yet.</td></tr>
            ) : recent.map((r) => (
              <tr key={r.id} className="border-b border-border text-white">
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.phone}</td>
                <td className="p-3">{r.property_title ?? r.subject ?? "—"}</td>
                <td className="p-3 text-grey">{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}