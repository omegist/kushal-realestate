import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { FloatingButtons } from "./FloatingButtons";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <FloatingButtons />
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: "#F59E0B" }}>
      {children}
    </span>
  );
}

export function PageHero({
  label,
  title,
  subtitle,
  bg,
  height = "h-[45vh]",
}: {
  label: string;
  title: string;
  subtitle?: string;
  bg?: string;
  height?: string;
}) {
  return (
    <section
      className={`relative flex ${height} min-h-[280px] items-center justify-center pt-16`}
      style={{
        backgroundImage: bg
          ? `linear-gradient(rgba(27,58,107,0.82), rgba(27,58,107,0.92)), url(${bg})`
          : "linear-gradient(135deg, #1B3A6B, #2D5AA0)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="px-4 text-center animate-fade-in">
        <SectionLabel>{label}</SectionLabel>
        <h1 className="mt-3 font-bold text-white" style={{ fontFamily: "Poppins, sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
          {title}
        </h1>
        {subtitle && <p className="mt-3 text-blue-100 text-lg max-w-xl mx-auto">{subtitle}</p>}
      </div>
      <div className="absolute bottom-0 left-0 h-px w-full" style={{ background: "linear-gradient(to right, transparent, #F59E0B, transparent)" }} />
    </section>
  );
}
