import { useState } from "react";
import { PhotoLightbox } from "./PhotoLightbox";
import { InquiryModal } from "./InquiryModal";
import { getAgency, type Property } from "../lib/data";

export function PropertyCard({ property }: { property: Property }) {
  const [lightbox, setLightbox] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);
  const [inquiry, setInquiry] = useState(false);
  const photos = property.photos ?? [];
  const features = (property.features ?? "").split(",").map((f) => f.trim()).filter(Boolean);
  const agency = getAgency(property.agency);

  return (
    <>
      <div className="glass group flex flex-col overflow-hidden rounded-2xl transition-all hover:-translate-y-1 hover:accent-border">
        <div className="relative h-52 overflow-hidden">
          {photos.length > 0 ? (
            <img src={photos[0]} alt={property.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary-pale text-4xl text-grey-mid">🏢</div>
          )}
          <span className="absolute left-3 top-3 rounded-md bg-accent px-2.5 py-1 text-xs font-bold text-white">{property.category}</span>
          <span className="absolute right-3 top-3 rounded-md px-2.5 py-1 text-xs font-bold text-white" style={{ background: "#10B981" }}>{property.status ?? "Active"}</span>
          {photos.length > 0 && (
            <span className="absolute bottom-3 right-3 rounded-md bg-primary/80 px-2 py-1 text-xs text-white">📷 {photos.length} photos</span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
            🏷️ {agency.label}
          </span>
          <h3 className="font-display text-lg font-bold leading-snug text-primary">{property.title}</h3>
          <p className="mt-1 text-sm" style={{ color: "#10B981" }}>📍 {property.location}</p>

          <div className="mt-3 space-y-1 text-xs text-grey-dark">
            {(property.area_buildup || property.area_carpet) && (
              <p>📐 {property.area_buildup ? `Buildup ${property.area_buildup}` : ""}{property.area_buildup && property.area_carpet ? " · " : ""}{property.area_carpet ? `Carpet ${property.area_carpet}` : ""}</p>
            )}
            {property.floor && <p>🏢 Floor {property.floor}{property.total_floors ? ` of ${property.total_floors}` : ""}</p>}
            {property.construction_age && <p>🕒 {property.construction_age}</p>}
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-xl font-bold text-accent">{property.price}</span>
            {property.price_negotiable && <span className="rounded px-2 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}>Negotiable</span>}
          </div>

          {features.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {features.slice(0, 3).map((f) => (
                <span key={f} className="rounded-full border border-grey-light px-2 py-0.5 text-[11px] text-grey-dark">{f}</span>
              ))}
              {features.length > 3 && <span className="rounded-full border border-grey-light px-2 py-0.5 text-[11px] text-accent">+{features.length - 3} more</span>}
            </div>
          )}

          <div className="mt-5 flex gap-2 pt-1">
            <button
              onClick={() => { setLbIndex(0); setLightbox(true); }}
              disabled={photos.length === 0}
              className="flex-1 rounded-lg border border-accent/40 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/10 disabled:opacity-40"
            >
              View Photos
            </button>
            <button onClick={() => setInquiry(true)} className="flex-1 rounded-lg py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "#10B981" }}>
              Enquire Now
            </button>
          </div>
        </div>
      </div>

      {lightbox && photos.length > 0 && (
        <PhotoLightbox title={property.title} photos={photos} index={lbIndex} setIndex={setLbIndex} onClose={() => setLightbox(false)} />
      )}
      {inquiry && <InquiryModal property={property} onClose={() => setInquiry(false)} />}
    </>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="glass animate-pulse overflow-hidden rounded-2xl">
      <div className="h-52 bg-primary-pale" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 rounded bg-primary-pale" />
        <div className="h-3 w-1/2 rounded bg-primary-pale" />
        <div className="h-6 w-1/3 rounded bg-primary-pale" />
      </div>
    </div>
  );
}
