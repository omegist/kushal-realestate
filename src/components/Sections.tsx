export function ServicesSection() {
  const services = [
    { icon: "🏠", title: "Residential Sales", desc: "Affordable and premium flats, apartments, and villas tailored to your family's needs." },
    { icon: "🏢", title: "Commercial Spaces", desc: "Ideally located shops, offices, and spaces to grow your business." },
    { icon: "🌿", title: "Open Plots & Land", desc: "Clear-title investment plots with high future returns." },
    { icon: "📋", title: "Legal Documentation", desc: "Comprehensive support for legal documentation and property verification." },
    { icon: "🏦", title: "Home Loan Assistance", desc: "Tie-ups with SBI, HDFC, ICICI, LIC for hassle-free home loans." },
    { icon: "📝", title: "Online Rent Agreement", desc: "Quick and legal online rent agreements done within a day." },
  ];

  return (
    <section className="py-20" style={{ background: "#FFFFFF" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: "#F59E0B" }}>
            What We Offer
          </span>
          <h2 className="mt-2 text-3xl font-bold" style={{ color: "#1B3A6B", fontFamily: "Poppins, sans-serif" }}>
            Our Services
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.title}
              className="rounded-xl p-6 transition-all hover:shadow-lg hover:-translate-y-1"
              style={{ background: "#F8FAFC", border: "1px solid rgba(27,58,107,0.1)" }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl mb-4"
                style={{ background: "#EBF0F8" }}>
                {s.icon}
              </div>
              <h3 className="font-bold mb-2" style={{ color: "#1B3A6B", fontFamily: "Poppins, sans-serif" }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyChooseSection() {
  const reasons = [
    { icon: "✅", title: "100% Verified Properties", desc: "We only deal in legally clear and RERA-approved properties." },
    { icon: "🎯", title: "Customer-Centric Approach", desc: "Your budget and preferences are our top priorities." },
    { icon: "💡", title: "Expert Guidance", desc: "Honest advice based on deep market analysis to maximize your investment value." },
  ];

  return (
    <section className="py-20" style={{ background: "#EBF0F8" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold" style={{ color: "#1B3A6B", fontFamily: "Poppins, sans-serif" }}>
            Why Choose Kushal Enterprises?
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {reasons.map((r) => (
            <div key={r.title}
              className="rounded-xl p-8 text-center transition-all hover:shadow-lg"
              style={{ background: "#FFFFFF", border: "1px solid rgba(27,58,107,0.1)" }}>
              <div className="text-4xl mb-4">{r.icon}</div>
              <h3 className="font-bold mb-2" style={{ color: "#1B3A6B", fontFamily: "Poppins, sans-serif" }}>{r.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
