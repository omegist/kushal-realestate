import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "../lib/supabaseClient";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/admin/properties", label: "Properties", icon: "🏢" },
  { to: "/admin/inquiries", label: "Inquiries", icon: "📋" },
  { to: "/admin/team", label: "Team", icon: "👥" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate({ to: "/admin/login" });
        return;
      }
      setReady(true);
    })();
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  };

  const currentLabel = NAV.find((n) => n.to === path)?.label ?? "Admin";

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-grey-mid" style={{ background: "#0F1C2E" }}>
        Loading admin…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#0F1C2E" }}>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden w-60 shrink-0 flex-col border-r p-5 md:flex" style={{ background: "#162032", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="font-display text-lg font-bold">
          <span className="text-gold">KUSHAL</span> <span className="text-white">Admin</span>
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                path === n.to ? "bg-emerald/15 text-emerald" : "text-grey-mid hover:text-white"
              }`}
            >
              <span>{n.icon}</span> {n.label}
            </Link>
          ))}
          <button onClick={logout} className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-grey-mid transition-colors hover:text-red-400">
            🚪 Logout
          </button>
        </nav>
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Mobile top header */}
        <div className="flex items-center justify-between px-4 py-3 md:hidden" style={{ background: "#162032", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="font-bold text-sm">
            <span className="text-gold">KUSHAL</span> <span className="text-white">Admin</span>
          </div>
          <span className="text-sm font-semibold text-white">{currentLabel}</span>
          <button onClick={logout} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-400" style={{ background: "rgba(239,68,68,0.1)" }}>
            Logout
          </button>
        </div>

        {/* Page content — extra bottom padding on mobile so content isn't hidden behind tab bar */}
        <div className="flex-1 p-4 pb-24 sm:p-6 md:p-8 md:pb-8">
          {children}
        </div>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden" style={{ background: "#162032", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {NAV.map((n) => {
          const active = path === n.to;
          return (
            <Link
              key={n.to}
              to={n.to}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors"
              style={{ color: active ? "#10B981" : "#94A3B8" }}
            >
              <span className="text-xl leading-none">{n.icon}</span>
              {n.label}
              {active && (
                <span className="absolute top-0 h-0.5 w-10 rounded-b" style={{ background: "#10B981" }} />
              )}
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
