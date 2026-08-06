import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout, SectionLabel } from "../components/SiteLayout";
import { ServicesSection, WhyChooseSection } from "../components/Sections";
import { PropertyCard } from "../components/PropertyCard";
import { useProperties } from "../lib/hooks";
import { TESTIMONIALS, WHATSAPP_LINK, CONTACT } from "../lib/data";
import storefront from "../assets/storefront.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kushal Enterprises | Real Estate in Kalwa, Thane" },
      { name: "description", content: "Find your dream property in Thane. RERA registered consultancy for buying, selling & renting in Kalwa, Thane." },
    ],
    links: [
      { rel: "canonical", href: "/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" },
    ],
  }),
  component: Home,
});

const STATS = [
  { n: "500+", l: "Properties" },
  { n: "300+", l: "Happy Clients" },
  { n: "10+", l: "Years" },
  { n: "RERA", l: "Certified" },
];

type TabType = "Buy" | "Sell" | "Rent";

function Home() {
  const { data } = useProperties();
  const [activeTab, setActiveTab] = useState<TabType>("Buy");
  const marqueeItems = data.length > 0 ? [...data, ...data] : [];

  const filteredProperties = data.filter((p) => {
    if (activeTab === "Buy") return p.category === "Sale";
    if (activeTab === "Rent") return p.category === "Rent";
    return true;
  });

  return (
    <SiteLayout>
      {/* HERO */}
      <section
        className="relative flex min-h-screen items-center justify-center pt-20"
        style={{
          backgroundImage: `linear-gradient(rgba(27,58,107,0.75), rgba(27,58,107,0.88)), url(${storefront.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto max-w-5xl px-4 py-16 text-center animate-fade-in">
          <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold mb-4"
            style={{ borderColor: "rgba(245,158,11,0.4)", background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>
            ✓ RERA Registered — A51700014818
          </span>

          <h1 className="font-bold leading-tight text-white mb-4"
            style={{ fontFamily: "Poppins, sans-serif", fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)" }}>
            Find Your Dream
            <br />
            <span style={{ color: "#F59E0B" }}>Property in Thane</span>
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-base text-blue-100">
            Trusted real estate consultancy helping families buy, sell &amp; rent in Kalwa, Thane
          </p>

          {/* BUY / SELL / RENT TABS — Kushal's main request */}
          <div className="mx-auto max-w-2xl">
            <div className="flex rounded-t-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
              {(["Buy", "Sell", "Rent"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 py-3 text-sm font-bold transition-all"
                  style={{
                    background: activeTab === tab ? "#F59E0B" : "transparent",
                    color: activeTab === tab ? "#1B3A6B" : "white",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-b-xl p-3" style={{ background: "rgba(255,255,255,0.95)" }}>
              <input
                type="text"
                placeholder={`Search ${activeTab} properties in Kalwa, Thane...`}
                className="flex-1 text-sm outline-none px-2"
                style={{ color: "#1B3A6B", background: "transparent" }}
              />
              <Link
                to="/properties"
                className="rounded-lg px-5 py-2 text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: "#1B3A6B", fontFamily: "Poppins, sans-serif" }}
              >
                Search
              </Link>
            </div>
          </div>

          {/* Quick action buttons */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer"
              className="rounded-full border px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
              style={{ borderColor: "#F59E0B", color: "#F59E0B", fontFamily: "Poppins, sans-serif" }}>
              💬 WhatsApp Us
            </a>
            <a href={`tel:${CONTACT.phones[0]}`}
              className="rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "rgba(255,255,255,0.15)", fontFamily: "Poppins, sans-serif" }}>
              📞 {CONTACT.phones[0]}
            </a>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.l} className="rounded-2xl p-4 text-center"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <div className="font-bold text-2xl" style={{ color: "#F59E0B", fontFamily: "Poppins, sans-serif" }}>{s.n}</div>
                <div className="mt-1 text-xs text-blue-100">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-px w-full"
          style={{ background: "linear-gradient(to right, transparent, #F59E0B, transparent)" }} />
      </section>

      {/* PROPERTY TABS SECTION */}
      <section className="py-16" style={{ background: "#F8FAFC" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-8">
            <SectionLabel>Browse Properties</SectionLabel>
            <h2 className="mt-2 text-3xl font-bold" style={{ color: "#1B3A6B", fontFamily: "Poppins, sans-serif" }}>
              Find What You're Looking For
            </h2>
          </div>

          {/* Tab filters */}
          <div className="flex justify-center gap-2 mb-8">
            {(["Buy", "Sell", "Rent"] as TabType[]).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="rounded-full px-6 py-2 text-sm font-semibold transition-all"
                style={{
                  background: activeTab === tab ? "#1B3A6B" : "#EBF0F8",
                  color: activeTab === tab ? "white" : "#1B3A6B",
                  fontFamily: "Poppins, sans-serif",
                }}>
                {tab === "Buy" ? "🏠 Buy" : tab === "Sell" ? "💰 Sell" : "🔑 Rent"}
              </button>
            ))}
          </div>

          {filteredProperties.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProperties.slice(0, 3).map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>No {activeTab} properties available right now.</p>
              <p className="mt-2 text-sm">Contact us directly for more options.</p>
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/properties"
              className="inline-block rounded-full px-8 py-3 font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "#F59E0B", color: "#1B3A6B", fontFamily: "Poppins, sans-serif" }}>
              View All Properties →
            </Link>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      {marqueeItems.length > 0 && (
        <section className="py-16" style={{ background: "#EBF0F8" }}>
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 mb-10">
            <SectionLabel>Featured Listings</SectionLabel>
            <h2 className="mt-2 text-3xl font-bold" style={{ color: "#1B3A6B", fontFamily: "Poppins, sans-serif" }}>
              Latest Properties
            </h2>
          </div>
          <div className="marquee-wrap overflow-hidden">
            <div
              className="marquee-track"
              style={{ gap: "1.5rem", "--marquee-duration": `${Math.max(data.length, 1) * 7}s` } as React.CSSProperties}
            >
              {marqueeItems.map((p, i) => (
                <div key={`${p.id}-${i}`} className="w-[330px] shrink-0">
                  <PropertyCard property={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ABOUT PREVIEW */}
      <section className="py-20" style={{ background: "#FFFFFF" }}>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <SectionLabel>About Us</SectionLabel>
            <h2 className="mt-2 text-3xl font-bold" style={{ color: "#1B3A6B", fontFamily: "Poppins, sans-serif" }}>
              Welcome to Kushal Enterprises – Your Trusted Real Estate Partner
            </h2>
            <p className="mt-4 leading-relaxed" style={{ color: "#475569" }}>
              Welcome to Kushal Enterprises, a premier and fast-growing real estate consultancy
              dedicated to helping you find your dream property. Built on the pillars of trust,
              transparency, and deep market expertise, we ensure a hassle-free property buying experience.
            </p>
            <Link to="/about"
              className="mt-6 inline-block rounded-full px-6 py-2.5 font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "#1B3A6B", fontFamily: "Poppins, sans-serif" }}>
              Read More About Us →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:col-span-2">
            {STATS.map((s) => (
              <div key={s.l} className="flex flex-col items-center justify-center rounded-xl p-6 text-center"
                style={{ background: "#EBF0F8", border: "1px solid rgba(27,58,107,0.1)" }}>
                <div className="text-2xl font-bold" style={{ color: "#F59E0B", fontFamily: "Poppins, sans-serif" }}>{s.n}</div>
                <div className="mt-1 text-xs font-medium" style={{ color: "#475569" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServicesSection />
      <WhyChooseSection />

      {/* TESTIMONIALS */}
      <section className="py-20" style={{ background: "#F8FAFC" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <SectionLabel>Client Stories</SectionLabel>
            <h2 className="mt-2 text-3xl font-bold" style={{ color: "#1B3A6B", fontFamily: "Poppins, sans-serif" }}>
              What Our Clients Say
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {TESTIMONIALS.slice(0, 2).map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16" style={{ background: "#1B3A6B" }}>
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl" style={{ fontFamily: "Poppins, sans-serif" }}>
            Ready to Find Your Perfect Property?
          </h2>
          <p className="mt-3 text-blue-200">Call us today for a free consultation</p>
          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <a href={`tel:${CONTACT.phones[0]}`}
              className="rounded-full px-6 py-3 font-semibold transition-all hover:opacity-90"
              style={{ background: "#F59E0B", color: "#1B3A6B", fontFamily: "Poppins, sans-serif" }}>
              📞 Call Now: {CONTACT.phones[0]}
            </a>
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer"
              className="rounded-full border px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
              style={{ borderColor: "#F59E0B", color: "#F59E0B", fontFamily: "Poppins, sans-serif" }}>
              💬 WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="py-14" style={{ background: "#EBF0F8" }}>
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h3 className="text-xl font-bold mb-8" style={{ color: "#1B3A6B", fontFamily: "Poppins, sans-serif" }}>
            Home Loan Partners
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {["SBI", "HDFC", "ICICI", "LIC", "AXIS BANK"].map((b) => (
              <span key={b} className="rounded-full px-6 py-2.5 text-sm font-semibold"
                style={{ background: "#FFFFFF", color: "#1B3A6B", border: "1px solid rgba(27,58,107,0.2)" }}>
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

export function TestimonialCard({ text, name }: { text: string; name: string }) {
  return (
    <div className="rounded-2xl p-7 transition-all hover:shadow-lg"
      style={{ background: "#FFFFFF", border: "1px solid rgba(27,58,107,0.1)", boxShadow: "0 2px 16px rgba(27,58,107,0.08)" }}>
      <div className="text-5xl leading-none" style={{ color: "#F59E0B", fontFamily: "Poppins, sans-serif" }}>"</div>
      <p className="mt-2 italic leading-relaxed" style={{ color: "#475569" }}>{text}</p>
      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full font-bold text-white"
          style={{ background: "#1B3A6B", fontFamily: "Poppins, sans-serif" }}>
          {name[0]}
        </div>
        <div>
          <div className="font-semibold" style={{ color: "#1B3A6B" }}>{name}</div>
          <div className="text-xs" style={{ color: "#94A3B8" }}>Verified Client</div>
        </div>
      </div>
    </div>
  );
}
