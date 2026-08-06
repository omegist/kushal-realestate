import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero, SectionLabel } from "../components/SiteLayout";
import { supabase } from "../lib/supabaseClient";
import { CONTACT, WHATSAPP_LINK, WHATSAPP_NUMBER } from "../lib/data";
import storefront from "../assets/storefront.png.asset.json";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | Kushal Enterprises" },
      { name: "description", content: "Contact Kushal Enterprises in Kharigaon Kalwa, Thane. Call, WhatsApp or visit our office." },
      { property: "og:title", content: "Contact — Kushal Enterprises" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      setErr("Name, phone and message are required.");
      return;
    }
    setErr("");
    setStatus("sending");
    try {
      await supabase.from("inquiries").insert({
        name: form.name,
        email: form.email || null,
        phone: form.phone,
        subject: form.subject || "Contact Form",
        message: form.message,
      });
    } catch {
      /* proceed */
    }
    setStatus("done");
    const text = encodeURIComponent(
      `New enquiry from website:\nName: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\nSubject: ${form.subject}\nMessage: ${form.message}`,
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  };

  return (
    <SiteLayout>
      <PageHero label="Get In Touch" title="Contact Us" subtitle="We're Here to Help You Find Your Property" />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Office photo */}
          <div className="glass overflow-hidden rounded-2xl">
            <img src={storefront.url} alt="Kushal Enterprises office" className="h-56 w-full object-cover" />
            <div className="p-6">
              <h3 className="font-display text-lg font-bold text-primary">Kushal Enterprises</h3>
              <p className="mt-1 text-sm text-grey-dark">Shop No. 5, Kharigaon Kalwa</p>
              <div className="mt-3 inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">RERA No. {CONTACT.rera}</div>
            </div>
          </div>

          {/* Info */}
          <div>
            <SectionLabel>Let's Talk</SectionLabel>
            <h2 className="mt-2 font-display text-2xl font-bold text-primary">Let's Discuss Your Property Needs!</h2>
            <p className="mt-3 text-grey-dark">Whether you're buying, selling, or renting — we're here to guide you every step of the way.</p>
            <ul className="mt-5 space-y-3 text-sm text-text">
              {["Free Consultation", `RERA Registered — ${CONTACT.rera}`, "Home Loan Assistance", "Online Rent Agreement"].map((t) => (
                <li key={t} className="flex items-center gap-2"><span className="text-emerald">✅</span> {t}</li>
              ))}
            </ul>
          </div>

          {/* Form */}
          <div className="glass rounded-2xl p-6 glow-border">
            {status === "done" ? (
              <div className="rounded-lg bg-emerald/15 p-6 text-center text-emerald">Thank you! We'll contact you within 24 hours.</div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                {[["name", "Name *"], ["email", "Email"], ["phone", "Phone *"], ["subject", "Subject"]].map(([k, ph]) => (
                  <input key={k} placeholder={ph} value={(form as any)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="w-full rounded-lg border border-grey-light bg-white px-4 py-2.5 text-sm text-text placeholder:text-grey-mid focus:border-gold focus:outline-none" />
                ))}
                <textarea placeholder="Message *" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-lg border border-grey-light bg-white px-4 py-2.5 text-sm text-text placeholder:text-grey-mid focus:border-gold focus:outline-none" />
                {err && <p className="text-sm text-red-400">{err}</p>}
                <button type="submit" disabled={status === "sending"} className="w-full rounded-lg bg-gold py-2.5 font-semibold text-navy transition-opacity hover:opacity-90 disabled:opacity-60">
                  {status === "sending" ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* CONTACT DETAILS */}
      <section className="bg-primary-pale py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center font-display text-3xl font-bold text-primary">Contact Details</h2>
          <div className="mt-8 flex justify-center gap-4 text-2xl">
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold hover:bg-gold/25">💬</a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold hover:bg-gold/25">📘</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold hover:bg-gold/25">📸</a>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="glass rounded-xl p-6">
              <div className="text-xl">📍</div>
              <h3 className="mt-2 font-semibold text-accent">Address</h3>
              <p className="mt-1 text-sm text-grey-dark">{CONTACT.address}</p>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="text-xl">✉️</div>
              <h3 className="mt-2 font-semibold text-accent">Email</h3>
              {CONTACT.emails.map((e) => <p key={e} className="mt-1 text-sm text-grey-dark">{e}</p>)}
            </div>
            <div className="glass rounded-xl p-6">
              <div className="text-xl">📞</div>
              <h3 className="mt-2 font-semibold text-accent">Call</h3>
              <p className="mt-1 text-sm text-grey-dark">{CONTACT.phones.join(" / ")}</p>
            </div>
          </div>

          <div className="glass mt-6 rounded-xl p-6">
            <h3 className="font-display text-lg font-bold text-primary">Working Hours</h3>
            <p className="mt-2 text-sm text-grey-dark">Morning: {CONTACT.hoursMorning}</p>
            <p className="text-sm text-grey-dark">Evening: {CONTACT.hoursEvening}</p>
            <p className="mt-3 text-sm text-grey-dark">Payment modes: Cash | Cheque | Credit Card | UPI | BHIM | Paytm</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <iframe
          title="Office location"
          src="https://maps.google.com/maps?q=Kharigaon+Kalwa+Thane+Maharashtra&output=embed"
          className="w-full rounded-xl"
          style={{ height: 450, border: "none" }}
          loading="lazy"
        />
      </section>
    </SiteLayout>
  );
}
