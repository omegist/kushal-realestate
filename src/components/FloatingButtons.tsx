import { useEffect, useState } from "react";
import { WHATSAPP_LINK } from "../lib/data";

export function FloatingButtons() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* WhatsApp */}
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-lg pulse-ring transition-transform hover:scale-110"
        style={{ background: "#F59E0B" }}
        aria-label="WhatsApp"
      >
        💬
      </a>

      {/* Scroll to top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-all hover:scale-110"
          style={{ background: "#1B3A6B" }}
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
    </>
  );
}
