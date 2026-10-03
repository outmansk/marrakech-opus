import { useState, useRef, useEffect, useCallback, CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { getImageUrl, getSrcSet, type ImageSize } from '@/lib/cloudinary';

// ─── Props ────────────────────────────────────────────────────────────────────

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  /**
   * Either a Cloudinary public_id ("properties/villa-001")
   * OR a legacy full URL ("https://xxx.supabase.co/..." or any https URL).
   */
  src: string;
  alt: string;
  /** Preset size — controls Cloudinary transformation applied */
  size?: ImageSize;
  /** Force eager loading (above-the-fold images, e.g. hero) */
  eager?: boolean;
  /** Wrapper element class name */
  wrapperClassName?: string;
  /** Wrapper inline style */
  wrapperStyle?: CSSProperties;
  /** Aspect ratio wrapper — e.g. "4/3", "16/9". Wraps in a fixed-ratio div. */
  aspectRatio?: string;
}

// ─── Shimmer Skeleton ─────────────────────────────────────────────────────────

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn('absolute inset-0 overflow-hidden bg-muted', className)}
      aria-hidden
    >
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%)',
        }}
      />
    </div>
  );
}

// ─── OptimizedImage ───────────────────────────────────────────────────────────
/**
 * Drop-in replacement for <img> with:
 * - Cloudinary URL generation (public_id → optimised CDN URL)
 * - Backward-compatible with legacy Supabase full URLs
 * - Responsive srcSet (300w / 600w / 900w / 1200w) for Cloudinary assets
 * - IntersectionObserver-based lazy loading
 * - Shimmer skeleton placeholder while loading
 * - Smooth fade-in transition on load
 */
export function OptimizedImage({
  src,
  alt,
  size = 'card',
  eager = false,
  className,
  wrapperClassName,
  wrapperStyle,
  aspectRatio,
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [inView, setInView] = useState(eager);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset error state when src changes
  useEffect(() => {
    setErrored(false);
    setLoaded(false);
  }, [src]);

  // ── Intersection Observer for lazy loading ──────────────────────────────────
  useEffect(() => {
    if (eager) return;
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [eager]);

  // ── Error handler — fallback to placeholder ─────────────────────────────────
  const handleError = useCallback(() => {
    if (!errored) {
      setErrored(true);
      setLoaded(true); // Stop the shimmer
      if (import.meta.env.DEV) {
        console.warn(`[OptimizedImage] Failed to load: "${src}" → resolved to "${getImageUrl(src, size)}"`);
      }
    }
  }, [errored, src, size]);

  // ── Derived URLs ────────────────────────────────────────────────────────────
  const resolvedSrc = errored
    ? '/placeholder.svg'
    : inView ? getImageUrl(src, size) : undefined;
  const srcSet = errored
    ? undefined
    : inView ? (getSrcSet(src, { crop: 'fill', gravity: 'auto' }) ?? undefined) : undefined;

  // Default sizes attribute for responsive images
  const defaultSizes =
    size === 'thumb' ? '200px' :
    size === 'card'  ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw' :
    size === 'hero'  ? '100vw' :
                       '100vw';

  // ── Render ──────────────────────────────────────────────────────────────────
  const inner = (
    <div
      className={cn('relative overflow-hidden bg-muted', wrapperClassName)}
      style={wrapperStyle}
    >
      {/* Shimmer skeleton */}
      {!loaded && <Shimmer />}

      {/* Error placeholder overlay */}
      {errored && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground/40">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      )}

      <img
        ref={imgRef}
        src={resolvedSrc}
        srcSet={srcSet}
        sizes={props.sizes ?? defaultSizes}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={handleError}
        className={cn(
          'transition-opacity duration-500 ease-in-out',
          loaded ? 'opacity-100' : 'opacity-0',
          errored && 'hidden',
          className
        )}
        {...props}
      />
    </div>
  );

  if (aspectRatio) {
    return (
      <div style={{ aspectRatio }} className="relative w-full overflow-hidden">
        <div className="absolute inset-0">{inner}</div>
      </div>
    );
  }

  return inner;
}

export default OptimizedImage;
