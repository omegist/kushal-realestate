import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getAgency, type Property } from "../lib/data";

export function InquiryModal({
  property,
  onClose,
}: {
  property: Property;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState("");
  const agency = getAgency(property.agency);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setErr("Name and phone are required.");
      return;
    }
    setErr("");
    setStatus("sending");
    try {
      await supabase.from("inquiries").insert({
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        message: form.message || null,
        subject: "Property Enquiry",
        property_id: property.id?.startsWith("sample-") ? null : property.id,
        property_title: property.title,
      });
    } catch {
      /* still proceed to WhatsApp */
    }
    setStatus("done");
    const text = encodeURIComponent(
      `Hello, I'm interested in: ${property.title} (${property.price}).\nName: ${form.name}\nPhone: ${form.phone}\n${form.message}`,
    );
    window.open(`https://wa.me/${agency.whatsapp}?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-primary/80 p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="glass w-full max-w-md rounded-2xl p-6 accent-border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <h3 className="font-display text-xl font-bold text-primary">Enquire About This Property</h3>
          <button onClick={onClose} className="text-2xl text-grey-mid hover:text-primary" aria-label="Close">×</button>
        </div>
        <p className="mt-1 text-sm font-semibold text-accent">{property.title}</p>
        <p className="mt-0.5 text-xs text-grey-mid">Listed by {agency.label}</p>

        {status === "done" ? (
          <div className="mt-6 rounded-lg bg-emerald/15 p-5 text-center text-emerald">
            Thank you! We'll contact you within 24 hours.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3">
            {["name", "phone", "email"].map((f) => (
              <input
                key={f}
                placeholder={f === "name" ? "Your Name *" : f === "phone" ? "Phone Number *" : "Email"}
                value={(form as any)[f]}
                onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                className="w-full rounded-lg border border-grey-light bg-white px-4 py-2.5 text-sm text-text placeholder:text-grey-mid focus:border-accent focus:outline-none"
              />
            ))}
            <textarea
              placeholder="Message"
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-lg border border-grey-light bg-white px-4 py-2.5 text-sm text-text placeholder:text-grey-mid focus:border-accent focus:outline-none"
            />
            {err && <p className="text-sm text-red-400">{err}</p>}
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-lg bg-emerald py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {status === "sending" ? "Sending..." : "Submit Enquiry"}
            </button>
            <a href={"https://wa.me/" + agency.whatsapp} target="_blank" rel="noreferrer" className="block rounded-lg border border-accent/40 py-2.5 text-center text-sm font-semibold text-accent hover:bg-accent/10">
              💬 Quick WhatsApp Contact ({agency.label})
            </a>
          </form>
        )}
      </div>
    </div>
  );
}
