import { useEffect } from "react";

export function PhotoLightbox({
  title,
  photos,
  index,
  setIndex,
  onClose,
}: {
  title: string;
  photos: string[];
  index: number;
  setIndex: (i: number) => void;
  onClose: () => void;
}) {
  const prev = () => setIndex((index - 1 + photos.length) % photos.length);
  const next = () => setIndex((index + 1) % photos.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-navy/97 backdrop-blur-sm animate-fade-in">
      <div className="flex items-center justify-between p-4">
        <h3 className="font-display text-lg text-white">{title}</h3>
        <button onClick={onClose} className="text-3xl text-white hover:text-gold" aria-label="Close">×</button>
      </div>
      <div className="relative flex flex-1 items-center justify-center px-4 pb-8">
        {photos.length > 1 && (
          <button onClick={prev} className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-card/80 text-2xl text-white hover:bg-gold hover:text-navy" aria-label="Previous">‹</button>
        )}
        <img
          key={index}
          src={photos[index]}
          alt={`${title} photo ${index + 1}`}
          className="max-h-[75vh] max-w-[90vw] rounded-xl object-contain animate-fade-in"
        />
        {photos.length > 1 && (
          <button onClick={next} className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-card/80 text-2xl text-white hover:bg-gold hover:text-navy" aria-label="Next">›</button>
        )}
      </div>
      <div className="pb-6 text-center text-sm text-grey">
        {index + 1} / {photos.length}
      </div>
    </div>
  );
}
