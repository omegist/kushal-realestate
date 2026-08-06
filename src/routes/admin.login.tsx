import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "../lib/supabaseClient";
import { Logo } from "../components/Logo";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    navigate({ to: "/admin/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="glass w-full max-w-md rounded-2xl p-8 glow-border">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-6 text-center font-display text-2xl font-bold text-white">Admin Login</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-lg border border-border bg-navy px-4 py-2.5 text-sm text-white placeholder:text-grey focus:border-gold focus:outline-none" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-lg border border-border bg-navy px-4 py-2.5 text-sm text-white placeholder:text-grey focus:border-gold focus:outline-none" />
          {err && <p className="text-sm text-red-400">{err}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-gold py-2.5 font-semibold text-navy transition-opacity hover:opacity-90 disabled:opacity-60">
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>
        <Link to="/admin/register" className="mt-5 block text-center text-sm text-emerald hover:underline">First time? Register here →</Link>
      </div>
    </div>
  );
}
