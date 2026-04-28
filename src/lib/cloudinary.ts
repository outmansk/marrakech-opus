// ─── Cloudinary Utility Library ───────────────────────────────────────────────
// Supports both legacy Supabase Storage URLs and new Cloudinary public_ids
// seamlessly during the migration period.

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

const CLOUDINARY_BASE = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// ─── Types ────────────────────────────────────────────────────────────────────

export type ImageSize = 'thumb' | 'card' | 'hero' | 'full';

export interface CloudinaryOptions {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'jpg' | 'png' | 'avif';
  crop?: 'fill' | 'fit' | 'scale' | 'pad' | 'crop' | 'thumb';
  gravity?: 'auto' | 'face' | 'center';
  dpr?: 'auto' | number;
}

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

// ─── Size presets ─────────────────────────────────────────────────────────────

const SIZE_PRESETS: Record<ImageSize, CloudinaryOptions> = {
  thumb:  { width: 200,  height: 200,  crop: 'fill', gravity: 'auto', quality: 'auto', format: 'auto' },
  card:   { width: 600,  height: 450,  crop: 'fill', gravity: 'auto', quality: 'auto', format: 'auto' },
  hero:   { width: 1200, height: 800,  crop: 'fill', gravity: 'auto', quality: 'auto', format: 'auto' },
  full:   { width: 1920, height: 1280, crop: 'fill', gravity: 'auto', quality: 'auto', format: 'auto' },
};

// ─── buildTransformation ──────────────────────────────────────────────────────
// Converts an options object into a Cloudinary transformation string.
// Example: { width: 600, quality: 'auto', format: 'auto' }
//       => "w_600,q_auto,f_auto"

function buildTransformation(options: CloudinaryOptions): string {
  const parts: string[] = [];

  if (options.width)   parts.push(`w_${options.width}`);
  if (options.height)  parts.push(`h_${options.height}`);
  if (options.crop)    parts.push(`c_${options.crop}`);
  if (options.gravity) parts.push(`g_${options.gravity}`);
  if (options.quality) parts.push(`q_${options.quality}`);
  if (options.format)  parts.push(`f_${options.format}`);
  if (options.dpr)     parts.push(`dpr_${options.dpr}`);

  return parts.join(',');
}

// ─── getCloudinaryUrl ─────────────────────────────────────────────────────────
// Generates an optimised Cloudinary URL for a given public_id.
//
// Usage:
//   getCloudinaryUrl('properties/villa-1', { width: 800, quality: 'auto' })
//   => "https://res.cloudinary.com/<cloud>/image/upload/w_800,q_auto/properties/villa-1"

export function getCloudinaryUrl(publicId: string, options: CloudinaryOptions = {}): string {
  if (!publicId) return '';

  const transformation = buildTransformation(options);
  const transformPart = transformation ? `${transformation}/` : '';

  return `${CLOUDINARY_BASE}/${transformPart}${publicId}`;
}

// ─── getImageUrl ──────────────────────────────────────────────────────────────
// Universal resolver that handles:
//   1. Legacy Supabase full URLs  (https://xxx.supabase.co/storage/v1/object/...)
//   2. Cloudinary public_ids      (properties/villa-palmeraie-001)
//   3. Plain HTTPS URLs           (from JSON import or external sources)
//
// The `size` param maps to a preset (thumb | card | hero | full).
// When the input is already a full URL (Supabase or external), it's returned
// as-is (Cloudinary transformations only work on assets stored in Cloudinary).

export function getImageUrl(imageRef: string, size: ImageSize = 'card'): string {
  if (!imageRef) return '/placeholder.svg';

  // Already a full URL (Supabase, external CDN, data URI, etc.)
  if (imageRef.startsWith('http://') || imageRef.startsWith('https://') || imageRef.startsWith('data:')) {
    return imageRef;
  }

  // Cloudinary public_id — apply size preset transformation
  return getCloudinaryUrl(imageRef, SIZE_PRESETS[size]);
}

// ─── getSrcSet ────────────────────────────────────────────────────────────────
// Generates a responsive srcSet string for a Cloudinary public_id.
// Returns null for legacy full URLs (cannot be transformed server-side).
//
// Usage:
//   getSrcSet('properties/villa-1', { crop: 'fill', gravity: 'auto' })
//   => "https://.../w_300,c_fill,g_auto/... 300w, ...600w, ...900w, ...1200w"

const SRCSET_WIDTHS = [300, 600, 900, 1200] as const;

export function getSrcSet(imageRef: string, baseOptions: Omit<CloudinaryOptions, 'width'> = {}): string | null {
  if (!imageRef) return null;

  // Cannot build srcSet for external URLs
  if (imageRef.startsWith('http://') || imageRef.startsWith('https://') || imageRef.startsWith('data:')) {
    return null;
  }

  return SRCSET_WIDTHS.map(
    (w) => `${getCloudinaryUrl(imageRef, { ...baseOptions, width: w, quality: 'auto', format: 'auto' })} ${w}w`
  ).join(', ');
}

// ─── uploadToCloudinary ───────────────────────────────────────────────────────
// Uploads a File object to Cloudinary using the unsigned upload preset.
// Returns the full UploadResult including public_id and secure_url.
//
// Pass an optional `onProgress` callback to track upload percentage (0–100).

export async function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.'
    );
  }

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'properties'); // Organise uploads in a folder

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result: UploadResult = JSON.parse(xhr.responseText);
          resolve(result);
        } catch {
          reject(new Error('Invalid response from Cloudinary'));
        }
      } else {
        let message = `Upload failed with status ${xhr.status}`;
        try {
          const err = JSON.parse(xhr.responseText);
          message = err?.error?.message ?? message;
        } catch { /* ignore */ }
        reject(new Error(message));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

    xhr.open('POST', CLOUDINARY_UPLOAD_URL);
    xhr.send(formData);
  });
}
