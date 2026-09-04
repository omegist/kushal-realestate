import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero, SectionLabel } from "../components/SiteLayout";
import { ServicesSection, WhyChooseSection } from "../components/Sections";
import { useTeam } from "../lib/hooks";
import { CONTACT, WHATSAPP_LINK } from "../lib/data";
import office from "../assets/office-interior.png.asset.json";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | Kushal Enterprises" },
      { name: "description", content: "RERA registered real estate consultancy in Kalwa, Thane led by Anil Chandrakant Patil." },
      { property: "og:title", content: "About — Kushal Enterprises" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

const STATS = [
  { n: "500+", l: "Properties", i: "🏠" },
  { n: "300+", l: "Clients", i: "😊" },
  { n: "10+", l: "Years", i: "⏰" },
  { n: "RERA", l: "Registered", i: "✅" },
];

function waLink(phone: string) {
  return "https://wa.me/91" + phone;
}

function About() {
  const { data: team } = useTeam();
  const teamMembers = team.filter((m) => !m.name.toLowerCase().includes("anil"));
  const founder = team.find((m) => m.name.toLowerCase().includes("anil"));

  return (
    <SiteLayout>
      <PageHero
        label="A Few Words About"
        title="Our Firm"
        subtitle="RERA Registered Real Estate Consultancy"
        bg={office.url}
        height="h-[50vh]"
      />

      <section className="bg-primary-pale py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="leading-relaxed text-grey-dark">
            Welcome to Kushal Enterprises, a premier and fast-growing real estate consultancy
            dedicated to helping you find your dream property. Whether you are looking for your first
            home, a strategic commercial space, or a profitable land investment, we are here to guide
            you every step of the way.
          </p>
          <p className="mt-4 leading-relaxed text-grey-dark">
            We believe that buying a property is not just a financial transaction, but a lifetime
            milestone. Built on the pillars of trust, transparency, and deep market expertise, Kushal
            Enterprises ensures a hassle-free property buying experience.
          </p>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-2 md:items-start">
          <div>
            {founder?.photo_url ? (
              <img
                src={founder.photo_url}
                alt="Anil Chandrakant Patil"
                className="w-full rounded-2xl border border-accent/20"
                style={{ objectFit: "contain", backgroundColor: "#EBF0F8", maxHeight: "320px" }}
              />
            ) : (
              <div className="glass flex h-72 items-center justify-center rounded-2xl text-grey-dark accent-border">
                [ Anil Chandrakant Patil Photo ]
              </div>
            )}
            <div className="mt-4 inline-block rounded-full bg-accent/15 px-4 py-1.5 text-sm font-semibold text-accent">
              RERA No. {CONTACT.rera}
            </div>

            <blockquote className="mt-6 rounded-2xl border-l-4 border-accent bg-primary-pale p-5 italic leading-relaxed text-grey-dark">
              “Built on the foundation of trust, transparency, and client satisfaction.”
            </blockquote>
          </div>

          <div>
            <SectionLabel>Founder &amp; Real Estate Consultant, Kushal Enterprises</SectionLabel>
            <h2 className="mt-2 font-display text-3xl font-bold text-primary">Anil Chandrakant Patil</h2>
            <p style={{ color: "#10B981" }}>Real Estate Consultant</p>

            <h3 className="mt-6 font-display text-lg font-bold text-primary">About Me</h3>
            <p className="mt-3 leading-relaxed text-grey-dark">
              Born and raised right here in Kalwa, I have a deep-rooted understanding of this
              locality, its community, and its real estate dynamics. After completing my B.Com
              graduation in 2004, I spent 8 to 10 years gaining valuable corporate experience
              working with premier organizations like Reliance Industries and 3i Infotech. This
              corporate background instilled in me a high standard of professionalism, sharp
              negotiation skills, and a customer-first mindset.
            </p>
            <p className="mt-3 leading-relaxed text-grey-dark">
              For the past 15 years, I have been actively practicing as a Real Estate Consultant
              in the Kalwa and Thane regions. Over this decade and a half, I have successfully
              helped hundreds of families find their ideal homes.
            </p>
            <p className="mt-3 leading-relaxed text-grey-dark">
              Through Kushal Enterprises, I combine my extensive local market expertise with
              corporate-level professionalism to ensure a seamless and transparent property
              buying or selling experience for you.
            </p>

            <h3 className="mt-6 font-display text-lg font-bold text-primary">Contact Information</h3>
            <div className="mt-3 space-y-2 text-sm text-grey-dark">
              <p>
                📞 Phone (Primary): <a href="tel:9029847968" className="font-semibold text-accent hover:underline">+91 9029847968</a>
              </p>
              <p>
                📞 Phone (Alternate): <a href="tel:9326313320" className="font-semibold text-accent hover:underline">+91 9326313320</a>
              </p>
              <p>
                ✉️ Email: <a href="mailto:kushalenterprises.4440.ap@gmail.com" className="font-semibold text-accent hover:underline">kushalenterprises.4440.ap@gmail.com</a>
              </p>
              <p>📍 Core Expertise: Kalwa, Thane, and surrounding areas</p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-primary-pale py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 sm:grid-cols-4 sm:px-6">
          {STATS.map((s) => (
            <div key={s.l} className="glass rounded-xl p-6 text-center">
              <div className="text-3xl">{s.i}</div>
              <div className="mt-2 font-display text-xl font-bold text-accent">{s.n}</div>
              <div className="text-xs text-grey-dark">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM — excludes Anil */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center font-display text-3xl font-bold text-primary">Meet Our Team</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((m) => (
              <div
                key={m.id}
                className="glass rounded-2xl p-6 text-center transition-all hover:accent-border"
              >
                {m.photo_url ? (
                  <img
                    src={m.photo_url}
                    alt={m.name}
                    className="mx-auto h-36 w-36 rounded-full object-cover object-top border-2 border-accent/30"
                  />
                ) : (
                  <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-accent/20 font-display text-4xl font-bold text-accent">
                    {m.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
                  </div>
                )}
                <h3 className="mt-4 font-bold text-primary">{m.name}</h3>
                <p className="text-sm" style={{ color: "#10B981" }}>{m.role}</p>
                {m.phone && <p className="mt-1 text-sm text-grey-dark">📞 {m.phone}</p>}
                {m.phone && (
                  <a
                    href={waLink(m.phone)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm text-accent hover:underline"
                  >
                    💬 WhatsApp
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServicesSection />
      <WhyChooseSection />

      <section className="bg-primary-pale py-12 text-center">
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noreferrer"
          className="rounded-full px-7 py-3 font-semibold text-white"
          style={{ background: "#10B981" }}
        >
          Get in Touch →
        </a>
      </section>
    </SiteLayout>
  );
}