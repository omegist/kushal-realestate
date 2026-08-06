import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "../components/SiteLayout";
import { PropertyCard, PropertyCardSkeleton } from "../components/PropertyCard";
import { useProperties } from "../lib/hooks";
import { CONTACT } from "../lib/data";
import office from "../assets/office-interior.png.asset.json";

export const Route = createFileRoute("/properties")({
  head: () => ({
    meta: [
      { title: "Properties | Kushal Enterprises" },
      { name: "description", content: "Browse residential, commercial and plot listings for sale and rent in Kalwa, Thane." },
      { property: "og:title", content: "Properties — Kushal Enterprises" },
      { property: "og:url", content: "/properties" },
    ],
    links: [{ rel: "canonical", href: "/properties" }],
  }),
  component: Properties,
});

const FILTERS = [
  { key: "all", label: "All" },
  { key: "Sale", label: "For Sale", field: "category" },
  { key: "Rent", label: "For Rent", field: "category" },
  { key: "Residential", label: "Residential", field: "type" },
  { key: "Commercial", label: "Commercial", field: "type" },
  { key: "New Construction", label: "New Construction", field: "category" },
  { key: "Resale", label: "Resale", field: "category" },
] as const;

function Properties() {
  const { data, loading } = useProperties();
  const [active, setActive] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let rows = active === "all" ? data : data.filter((p) => p.category === active || p.type === active);
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.location ?? "").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [data, active, search]);

  return (
    <SiteLayout>
      <PageHero label="Our Listings" title="Properties" subtitle="Buy, Sell & Rent in Kalwa, Thane" bg={office.url} />

      <div className="sticky top-16 z-30 border-b border-border" style={{ background: "rgba(13,21,38,0.92)", backdropFilter: "blur(10px)" }}>
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties by name or location..."
            className="mb-3 w-full max-w-md rounded-full border border-grey-light bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/60 focus:border-accent focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActive(f.key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  active === f.key ? "bg-emerald text-white" : "border border-grey-light text-white/80 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {loading ? (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass mx-auto max-w-lg rounded-2xl p-10 text-center">
            <div className="text-4xl">🔍</div>
            <p className="mt-4 text-white">No properties found in this category. Contact us directly for more listings.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {CONTACT.phones.map((p) => (
                <a key={p} href={`tel:${p}`} className="rounded-full bg-emerald px-5 py-2 text-sm font-semibold text-white">📞 {p}</a>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
