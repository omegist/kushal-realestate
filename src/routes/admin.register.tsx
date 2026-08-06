import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "../lib/supabaseClient";
import { Logo } from "../components/Logo";

export const Route = createFileRoute("/admin/register")({
  component: AdminRegister,
});

function AdminRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { count } = await supabase.from("admin_users").select("*", { count: "exact", head: true });
      if ((count ?? 0) >= 5) {
        setErr("Admin registration is closed. Maximum 5 admins allowed. Contact existing admin for access.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password });
      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }
      const userId = data.user?.id;
      if (userId) {
        await supabase.from("admin_users").insert({ id: userId, email: form.email, name: form.name, role: "admin" });
      }
      if (!data.session) {
        await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      }
      navigate({ to: "/admin/dashboard" });
    } catch (e: any) {
      setErr(e?.message ?? "Registration failed.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="glass w-full max-w-md rounded-2xl p-8 glow-border">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-6 text-center font-display text-2xl font-bold text-white">Admin Registration</h1>
        <p className="mt-1 text-center text-xs text-grey">Only the first 5 users can become admins.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full rounded-lg border border-border bg-navy px-4 py-2.5 text-sm text-white placeholder:text-grey focus:border-gold focus:outline-none" />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full rounded-lg border border-border bg-navy px-4 py-2.5 text-sm text-white placeholder:text-grey focus:border-gold focus:outline-none" />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="w-full rounded-lg border border-border bg-navy px-4 py-2.5 text-sm text-white placeholder:text-grey focus:border-gold focus:outline-none" />
          {err && <p className="text-sm text-red-400">{err}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-gold py-2.5 font-semibold text-navy transition-opacity hover:opacity-90 disabled:opacity-60">
            {loading ? "Creating…" : "Create Admin Account"}
          </button>
        </form>
        <Link to="/admin/login" className="mt-5 block text-center text-sm text-emerald hover:underline">Already have an account? Login →</Link>
      </div>
    </div>
  );
}
