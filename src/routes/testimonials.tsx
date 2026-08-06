import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "../components/SiteLayout";
import { TestimonialCard } from "./index";
import { TESTIMONIALS } from "../lib/data";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Testimonials | Kushal Enterprises" },
      { name: "description", content: "Read what our happy clients say about Kushal Enterprises real estate services in Thane." },
      { property: "og:title", content: "Testimonials — Kushal Enterprises" },
      { property: "og:url", content: "/testimonials" },
    ],
    links: [{ rel: "canonical", href: "/testimonials" }],
  }),
  component: Testimonials,
});

function Testimonials() {
  return (
    <SiteLayout>
      <PageHero label="Happy Clients" title="Testimonials" subtitle="Don't Take Our Words! Hear What They Say." />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </div>
      </section>

      <section className="py-16" style={{ background: "linear-gradient(135deg, #10b981, #f59e0b)" }}>
        <div className="mx-auto max-w-3xl px-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">Join Them</span>
          <h2 className="mt-2 font-display text-3xl font-bold text-white">Let us help you with your next property move.</h2>
          <Link to="/contact" className="mt-7 inline-block rounded-full px-7 py-3 font-semibold text-white transition-transform hover:scale-105" style={{ background: "#1B3A6B" }}>
            Get Free Consultation
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
