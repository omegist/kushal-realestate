import { Link } from "@tanstack/react-router";
import { CONTACT, WHATSAPP_LINK } from "../lib/data";

export function Footer() {
  return (
    <footer style={{ background: "#1B3A6B" }} className="text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Col 1 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                <img src="/logo.png" alt="Kushal" className="h-full w-full object-contain" style={{ mixBlendMode: "lighten" }} />
              </div>
              <div>
                <div className="font-bold text-amber-400 text-lg" style={{ fontFamily: "Poppins, sans-serif" }}>KUSHAL ENTERPRISES</div>
                <div className="text-blue-200 text-xs">Real Estate Consultant</div>
              </div>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              RERA registered firm helping you buy, sell and rent with confidence.
            </p>
            <div className="mt-4 flex gap-3">
              <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm"
                style={{ background: "rgba(255,255,255,0.1)" }}>💬</a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full text-sm"
                style={{ background: "rgba(255,255,255,0.1)" }}>📘</a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full text-sm"
                style={{ background: "rgba(255,255,255,0.1)" }}>📸</a>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: "Poppins, sans-serif" }}>Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: "/", label: "Home" },
                { to: "/properties", label: "Properties" },
                { to: "/about", label: "About Us" },
                { to: "/testimonials", label: "Testimonials" },
                { to: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-blue-200 text-sm hover:text-amber-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: "Poppins, sans-serif" }}>Our Services</h4>
            <ul className="space-y-2">
              {["Residential Sales", "Commercial Spaces", "Home Loans", "Rent Agreement", "Legal Help"].map((s) => (
                <li key={s}>
                  <span className="text-blue-200 text-sm">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: "Poppins, sans-serif" }}>Contact Info</h4>
            <ul className="space-y-3 text-sm text-blue-200">
              <li className="flex gap-2">
                <span>📍</span>
                <span>{CONTACT.address}</span>
              </li>
              <li className="flex gap-2">
                <span>📞</span>
                <span>{CONTACT.phones.join(" / ")}</span>
              </li>
              <li className="flex gap-2">
                <span>✉️</span>
                <span>{CONTACT.emails[0]}</span>
              </li>
              <li className="flex gap-2">
                <span>🕐</span>
                <span>{CONTACT.hoursMorning} | {CONTACT.hoursEvening}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-300"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <span>© 2025 Kushal Enterprises | RERA No. A51700014818 | All Rights Reserved</span>
          <span>Made with ❤️ for Kalwa, Thane</span>
        </div>
      </div>
    </footer>
  );
}
