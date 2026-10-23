import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Camera, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLocalizedText } from "@/hooks/useLocalizedText";

/**
 * Property photos. Mobile: full-width carousel swiped with the finger (CSS scroll snap, works
 * without JavaScript), badges on top, photo counter and "see the gallery" button.
 * Arrows on both sides show the previous / next photo.
 * Desktop: mosaic (large photo + 4), with arrows on the large photo. Both open a full-screen viewer.
 */
export default function PhotoGallery({ images, alt, badges }: { images: string[]; alt: string; badges?: ReactNode }) {
  const tL = useLocalizedText();
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const [main, setMain] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const count = images.length;

  const onScroll = () => {
    const track = trackRef.current;
    if (track) setIndex(Math.round(track.scrollLeft / track.clientWidth));
  };
  // Mobile: scroll the carousel one photo left or right (loops at both ends).
  const slide = (step: number) => {
    const track = trackRef.current;
    if (!track) return;
    const next = (index + step + count) % count;
    track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
  };
  const arrow = "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-primary shadow-md backdrop-blur-md transition-colors hover:bg-background";
  const prevLabel = tL("Photo précédente", "Previous photo", "Foto anterior");
  const nextLabel = tL("Photo suivante", "Next photo", "Foto siguiente");
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
        {count > 1 && (
          <>
            <button type="button" onClick={() => slide(-1)} className={`${arrow} left-3`} aria-label={prevLabel}>
              <ChevronLeft size={22} strokeWidth={1.75} />
            </button>
            <button type="button" onClick={() => slide(1)} className={`${arrow} right-3`} aria-label={nextLabel}>
              <ChevronRight size={22} strokeWidth={1.75} />
            </button>
          </>
        )}
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
          {[images[main], ...images.slice(1, shown)].map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setViewer(i === 0 ? main : i)}
              className={`group relative overflow-hidden bg-muted ${i === 0 && shown > 1 ? "row-span-2" : ""}`}
              aria-label={tL(`Agrandir la photo ${i + 1}`, `Enlarge photo ${i + 1}`, `Ampliar la foto ${i + 1}`)}
            >
              <OptimizedImage
                src={src}
                alt={photoAlt(i === 0 ? main : i)}
                eager={i === 0}
                size={i === 0 ? "hero" : "card"}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                wrapperClassName="h-full w-full"
              />
            </button>
          ))}
          {badges && <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">{badges}</div>}
          {count > 1 && (
            // Arrows on the large photo (left column of the mosaic).
            <div className={`pointer-events-none absolute inset-y-0 left-0 ${shown === 5 ? "w-1/2" : shown === 3 ? "w-2/3" : "w-full"}`}>
              <button type="button" onClick={() => setMain((main - 1 + count) % count)} className={`${arrow} pointer-events-auto left-4`} aria-label={prevLabel}>
                <ChevronLeft size={22} strokeWidth={1.75} />
              </button>
              <button type="button" onClick={() => setMain((main + 1) % count)} className={`${arrow} pointer-events-auto right-4`} aria-label={nextLabel}>
                <ChevronRight size={22} strokeWidth={1.75} />
              </button>
              <span className="absolute bottom-4 left-4 rounded-md bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">{main + 1} / {count}</span>
            </div>
          )}
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

  // Le bouton « retour » du téléphone ferme la galerie au lieu de quitter la page :
  // une entrée d'historique est ajoutée à l'ouverture et retirée à la fermeture.
  const open = start !== null;
  const closedByBack = useRef(false);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    closedByBack.current = false;
    window.history.pushState({ ...(window.history.state ?? {}), photoViewer: true }, "");
    const onPop = () => {
      closedByBack.current = true;
      closeRef.current();
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      if (!closedByBack.current && (window.history.state as { photoViewer?: boolean } | null)?.photoViewer) window.history.back();
    };
  }, [open]);

  const go = useCallback((step: number) => setCurrent((value) => (value + step + count) % count), [count]);

  // Garde la miniature active visible dans la bande du bas.
  const stripRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    stripRef.current?.querySelector<HTMLElement>(`[data-thumb="${current}"]`)?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [current]);

  const glass = "flex items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-xl transition hover:bg-white/20 active:scale-95";

  return (
    <Dialog open={start !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="z-[100] flex h-[100dvh] w-screen max-w-none flex-col gap-0 border-0 bg-[#0d0c0b] p-0 sm:rounded-none [&>button]:hidden"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") go(1);
          if (event.key === "ArrowLeft") go(-1);
        }}
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>

        {/* Fond : la photo floutée, pour une ambiance immersive */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <OptimizedImage key={`bg-${images[current]}`} src={images[current]} alt="" size="thumb" className="h-full w-full scale-110 object-cover opacity-40 blur-3xl" wrapperClassName="h-full w-full bg-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
        </div>

        {/* Barre du haut */}
        <div className="relative z-10 flex items-center justify-between gap-3 px-3 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
          <button type="button" onClick={onClose} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-[14px] font-semibold text-[#211f1b] shadow-lg transition hover:bg-white/90 active:scale-95">
            <ArrowLeft size={18} strokeWidth={2} aria-hidden="true" />
            {tL("Retour à l’annonce", "Back to listing", "Volver al anuncio")}
          </button>
          <span className="rounded-full bg-white/10 px-3.5 py-2 text-[13px] font-semibold tabular-nums text-white ring-1 ring-white/15 backdrop-blur-xl">{current + 1} / {count}</span>
        </div>

        {/* Photo */}
        <div
          className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-2 md:px-20"
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
            className="max-h-full max-w-full rounded-xl object-contain shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] animate-in fade-in-0 zoom-in-[0.98] duration-300"
            wrapperClassName="flex h-full w-full items-center justify-center bg-transparent"
          />
          {count > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} className={`${glass} absolute left-3 top-1/2 h-11 w-11 -translate-y-1/2 md:left-6 md:h-12 md:w-12`} aria-label={tL("Photo précédente", "Previous photo", "Foto anterior")}>
                <ChevronLeft size={24} strokeWidth={1.75} />
              </button>
              <button type="button" onClick={() => go(1)} className={`${glass} absolute right-3 top-1/2 h-11 w-11 -translate-y-1/2 md:right-6 md:h-12 md:w-12`} aria-label={tL("Photo suivante", "Next photo", "Foto siguiente")}>
                <ChevronRight size={24} strokeWidth={1.75} />
              </button>
            </>
          )}
        </div>

        {/* Miniatures */}
        {count > 1 && (
          <div ref={stripRef} className="relative z-10 flex gap-2 overflow-x-auto px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 [scrollbar-width:none] md:justify-center [&::-webkit-scrollbar]:hidden">
            {images.map((image, i) => (
              <button
                key={image + i}
                type="button"
                data-thumb={i}
                onClick={() => setCurrent(i)}
                aria-label={`${tL("Photo", "Photo", "Foto")} ${i + 1}`}
                aria-current={i === current}
                className={`h-14 w-20 flex-none overflow-hidden rounded-lg transition-all duration-200 ${i === current ? "opacity-100 ring-2 ring-white" : "opacity-50 hover:opacity-80"}`}
              >
                <OptimizedImage src={image} alt="" size="thumb" className="h-full w-full object-cover" wrapperClassName="h-full w-full" />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
