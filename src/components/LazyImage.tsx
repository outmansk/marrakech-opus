import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** Force eager loading (above the fold, e.g., hero image) */
  eager?: boolean;
  wrapperClassName?: string;
}

/**
 * LazyImage — optimised image component.
 * - Uses IntersectionObserver to load only when near the viewport.
 * - Shows a skeleton placeholder while loading.
 * - Fades in once loaded.
 * - Passes `decoding="async"` to avoid blocking the main thread.
 */
const LazyImage = ({
  src,
  alt,
  eager = false,
  className,
  wrapperClassName,
  ...props
}: LazyImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(eager);
  const imgRef = useRef<HTMLImageElement>(null);

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
      { rootMargin: '200px' } // Start loading 200px before entering viewport
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [eager]);

  return (
    <div className={cn('relative overflow-hidden bg-muted', wrapperClassName)}>
      {/* Skeleton shimmer shown while not loaded */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}

      <img
        ref={imgRef}
        src={inView ? src : undefined}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          'transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        {...props}
      />
    </div>
  );
};

export default LazyImage;
