import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { SiteLayout, PageHero } from "../components/SiteLayout";
import { PropertyCard, PropertyCardSkeleton } from "../components/PropertyCard";
import { useProperties } from "../lib/hooks";
import { CONTACT, isCommercialProperty, isNewProjectProperty, isRentalProperty, isResaleProperty } from "../lib/data";
import office from "../assets/office-interior.png.asset.json";

const propertiesSearchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  id: z.string().optional(),
});

export const Route = createFileRoute("/properties")({
  validateSearch: propertiesSearchSchema,
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
  { key: "New Construction", label: "New Project" },
  { key: "Resale", label: "Resale" },
  { key: "Rent", label: "Rental" },
  { key: "Commercial", label: "Commercial" },
] as const;

function Properties() {
    const { data, loading } = useProperties();
  const { q, category, id } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [active, setActive] = useState(category ?? "all");
  const [search, setSearch] = useState(q ?? "");

  useEffect(() => {
    setSearch(q ?? "");
    setActive(category ?? "all");
  }, [q, category]);

  // Shared-link view: only this one property, nothing else.
  const sharedProperty = useMemo(() => (id ? data.find((p) => p.id === id) : undefined), [data, id]);

  const filtered = useMemo(() => {
    let rows: typeof data;
    if (active === "all") rows = data;
    // Commercial/Resale/New Construction/Rent are matched against the stored field first,
    // then cross-checked against the title — this way listings that were saved with the
    // wrong dropdown value (e.g. a commercial shop saved as "Residential") still land in
    // the right tab, for both older and newly added properties.
    else if (active === "Commercial") rows = data.filter(isCommercialProperty);
    else if (active === "Resale") rows = data.filter(isResaleProperty);
    else if (active === "New Construction") rows = data.filter(isNewProjectProperty);
    else if (active === "Rent") rows = data.filter(isRentalProperty);
    else rows = data.filter((p) => p.category === active || p.type === active);

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
      <PageHero
        label="Our Listings"
        title={id ? "Shared Property" : "Properties"}
        subtitle={id ? "You've been sent a direct link to this listing" : "Buy, Sell & Rent in Kalwa, Thane"}
        bg={office.url}
      />

      {!id && (
        <div className="sticky top-16 z-30 border-b border-border" style={{ background: "rgba(13,21,38,0.92)", backdropFilter: "blur(10px)" }}>
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                navigate({ search: (prev) => ({ ...prev, q: e.target.value || undefined }) });
              }}
              placeholder="Search properties by name or location..."
              className="mb-3 w-full max-w-md rounded-full border border-grey-light bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/60 focus:border-accent focus:outline-none"
            />
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => {
                    setActive(f.key);
                    navigate({ search: (prev) => ({ ...prev, category: f.key === "all" ? undefined : f.key }) });
                  }}
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
      )}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {id ? (
          loading ? (
            <div className="mx-auto max-w-sm">
              <PropertyCardSkeleton />
            </div>
          ) : sharedProperty ? (
            <>
              <div className="mx-auto max-w-sm">
                <PropertyCard property={sharedProperty} />
              </div>
              <div className="mt-8 text-center">
                <button
                  onClick={() => navigate({ search: {} })}
                  className="rounded-full border border-grey-light px-5 py-2 text-sm font-medium text-white/80 hover:text-white"
                >
                  ← View all properties
                </button>
              </div>
            </>
          ) : (
            <div className="glass mx-auto max-w-lg rounded-2xl p-10 text-center">
              <div className="text-4xl">🔍</div>
              <p className="mt-4 text-white">This property link is no longer available.</p>
              <button
                onClick={() => navigate({ search: {} })}
                className="mt-6 rounded-full bg-emerald px-5 py-2 text-sm font-semibold text-white"
              >
                Browse all properties
              </button>
            </div>
          )
        ) : loading ? (
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