import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Camera, ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLocalizedText } from "@/hooks/useLocalizedText";

/**
 * Property photos. Mobile: full-width carousel swiped with the finger (CSS scroll snap, works
 * without JavaScript), badges on top, photo counter and "see the gallery" button.
 * Desktop: mosaic (large photo + 4). Both open a full-screen viewer.
 */
export default function PhotoGallery({ images, alt, badges }: { images: string[]; alt: string; badges?: ReactNode }) {
  const tL = useLocalizedText();
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const count = images.length;

  const onScroll = () => {
    const track = trackRef.current;
    if (track) setIndex(Math.round(track.scrollLeft / track.clientWidth));
  };
  const photoAlt = (i: number) => (i === 0 ? alt : `${alt} — ${tL("photo", "photo", "foto")} ${i + 1}`);
  // Mosaic: large photo + 4 (or + 2 when there are fewer photos).
  const shown = count >= 5 ? 5 : count >= 3 ? 3 : 1;
  const mosaic = shown === 5 ? "grid-cols-[2fr_1fr_1fr] grid-rows-2" : shown === 3 ? "grid-cols-[2fr_1fr] grid-rows-2" : "grid-cols-1";
  const seeAll = tL(`Voir les ${count} photos`, `See all ${count} photos`, `Ver las ${count} fotos`);

  return (
    <>
      {/* Mobile carousel */}
      <div className="relative md:hidden">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto bg-muted scrollbar-hide"
          aria-label={tL("Photos du bien", "Property photos", "Fotos del inmueble")}
        >
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setViewer(i)}
              className="h-full w-full shrink-0 snap-center"
              aria-label={tL(`Agrandir la photo ${i + 1}`, `Enlarge photo ${i + 1}`, `Ampliar la foto ${i + 1}`)}
            >
              <OptimizedImage src={src} alt={photoAlt(i)} eager={i === 0} size="hero" className="h-full w-full object-cover" wrapperClassName="h-full w-full" />
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
        {badges && <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">{badges}</div>}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 rounded-md bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            <Camera size={14} strokeWidth={1.75} aria-hidden="true" />
            {index + 1} / {count} {tL("photos", "photos", "fotos")}
          </span>
          {count > 1 && (
            <button
              type="button"
              onClick={() => setViewer(index)}
              className="flex min-h-9 items-center gap-1.5 rounded-md bg-background/90 px-3 text-[11px] font-semibold text-primary shadow-sm backdrop-blur-md"
            >
              {tL("Voir la galerie", "View gallery", "Ver la galería")}
              <Expand size={14} strokeWidth={1.75} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Desktop mosaic */}
      <div className="container mx-auto hidden px-6 md:block md:px-12">
        <div className={`relative grid h-[460px] gap-2 overflow-hidden rounded-xl ${mosaic}`}>
          {images.slice(0, shown).map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setViewer(i)}
              className={`group relative overflow-hidden bg-muted ${i === 0 && shown > 1 ? "row-span-2" : ""}`}
              aria-label={tL(`Agrandir la photo ${i + 1}`, `Enlarge photo ${i + 1}`, `Ampliar la foto ${i + 1}`)}
            >
              <OptimizedImage
                src={src}
                alt={photoAlt(i)}
                eager={i === 0}
                size={i === 0 ? "hero" : "card"}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                wrapperClassName="h-full w-full"
              />
            </button>
          ))}
          {badges && <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">{badges}</div>}
          {count > 1 && (
            <button
              type="button"
              onClick={() => setViewer(0)}
              className="absolute bottom-4 right-4 flex min-h-10 items-center gap-2 rounded-md border border-border bg-background/95 px-4 text-xs font-semibold text-primary shadow-sm hover:bg-background"
            >
              <Expand size={15} strokeWidth={1.75} aria-hidden="true" />
              {seeAll}
            </button>
          )}
        </div>
      </div>

      <PhotoViewer images={images} alt={alt} start={viewer} onClose={() => setViewer(null)} />
    </>
  );
}

/** Full-screen viewer: arrows, keyboard and swipe. */
function PhotoViewer({ images, alt, start, onClose }: { images: string[]; alt: string; start: number | null; onClose: () => void }) {
  const tL = useLocalizedText();
  const [current, setCurrent] = useState(0);
  const touchX = useRef<number | null>(null);
  const count = images.length;

  useEffect(() => {
    if (start !== null) setCurrent(start);
  }, [start]);

  const go = useCallback((step: number) => setCurrent((value) => (value + step + count) % count), [count]);

  return (
    <Dialog open={start !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex h-[100dvh] w-screen max-w-none flex-col gap-0 border-0 bg-black p-0 sm:rounded-none [&>button]:hidden"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") go(1);
          if (event.key === "ArrowLeft") go(-1);
        }}
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <div className="flex items-center justify-between px-4 py-3 text-sm text-white/80">
          <span>{current + 1} / {count}</span>
          <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10" aria-label={tL("Fermer", "Close", "Cerrar")}>
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>
        <div
          className="relative flex flex-1 items-center justify-center overflow-hidden"
          onTouchStart={(event) => { touchX.current = event.touches[0].clientX; }}
          onTouchEnd={(event) => {
            if (touchX.current === null) return;
            const delta = event.changedTouches[0].clientX - touchX.current;
            if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          <OptimizedImage
            key={images[current]}
            src={images[current]}
            alt={`${alt} — ${tL("photo", "photo", "foto")} ${current + 1}`}
            eager
            size="full"
            className="max-h-full max-w-full object-contain"
            wrapperClassName="flex h-full w-full items-center justify-center"
          />
          {count > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:left-6" aria-label={tL("Photo précédente", "Previous photo", "Foto anterior")}>
                <ChevronLeft size={24} strokeWidth={1.5} />
              </button>
              <button type="button" onClick={() => go(1)} className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:right-6" aria-label={tL("Photo suivante", "Next photo", "Foto siguiente")}>
                <ChevronRight size={24} strokeWidth={1.5} />
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
