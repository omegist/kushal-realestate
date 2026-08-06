import { Link } from "@tanstack/react-router";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-gold text-xl transition-transform group-hover:scale-105">
        🏠
      </div>
      <div className="leading-tight">
        <div className="font-display text-lg font-bold tracking-wide">
          <span className="text-gold">KUSHAL</span>{" "}
          <span className="text-white font-normal">ENTERPRISES</span>
        </div>
        {!compact && (
          <div className="text-[10px] uppercase tracking-[0.2em] text-emerald">
            Real Estate Consultant
          </div>
        )}
      </div>
    </Link>
  );
}
