import { useState, useRef, useCallback, useId } from 'react';
import { cn } from '@/lib/utils';
import { uploadToCloudinary, type UploadResult } from '@/lib/cloudinary';
import { Upload, X, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, GripVertical } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface UploadedImage {
  /** Cloudinary public_id — store this in the database */
  public_id: string;
  /** Full Cloudinary HTTPS URL (for immediate display) */
  secure_url: string;
  /** Original filename */
  name: string;
}

type FileStatus = 'pending' | 'uploading' | 'done' | 'error';

interface FileEntry {
  id: string;
  file: File;
  preview: string;
  status: FileStatus;
  progress: number;
  result?: UploadResult;
  error?: string;
}

interface ImageUploaderProps {
  /** Called when all uploads complete successfully */
  onUploadComplete?: (images: UploadedImage[]) => void;
  /** Called for each individual image after it finishes uploading */
  onImageUploaded?: (image: UploadedImage) => void;
  /** Max number of files allowed (default: unlimited) */
  maxFiles?: number;
  /** Custom class for the root element */
  className?: string;
  /** Whether the uploader is disabled */
  disabled?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── FileRow ──────────────────────────────────────────────────────────────────

function FileRow({
  entry,
  onRemove,
}: {
  entry: FileEntry;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        'group relative flex items-center gap-3 rounded-lg border p-3 transition-colors',
        entry.status === 'done'    && 'border-emerald-500/40 bg-emerald-500/5',
        entry.status === 'error'   && 'border-destructive/40 bg-destructive/5',
        entry.status === 'pending' && 'border-border bg-muted/20',
        entry.status === 'uploading' && 'border-primary/40 bg-primary/5',
      )}
    >
      {/* Drag handle */}
      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40" aria-hidden />

      {/* Thumbnail */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
        <img
          src={entry.preview}
          alt={entry.file.name}
          className="h-full w-full object-cover"
        />
        {/* Overlay status */}
        {entry.status === 'uploading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          </div>
        )}
        {entry.status === 'done' && (
          <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/60">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
        )}
        {entry.status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/60">
            <AlertCircle className="h-4 w-4 text-red-400" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-foreground">{entry.file.name}</p>
        <p className="text-[10px] text-muted-foreground">{formatBytes(entry.file.size)}</p>

        {entry.status === 'uploading' && (
          <div className="mt-1.5 space-y-1">
            <Progress value={entry.progress} className="h-1" />
            <p className="text-[10px] text-muted-foreground">{entry.progress}%</p>
          </div>
        )}

        {entry.status === 'done' && (
          <p className="text-[10px] text-emerald-500 font-medium">✓ Importé avec succès</p>
        )}

        {entry.status === 'error' && (
          <p className="truncate text-[10px] text-destructive">{entry.error}</p>
        )}
      </div>

      {/* Remove button */}
      {entry.status !== 'uploading' && (
        <button
          type="button"
          onClick={() => onRemove(entry.id)}
          className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label={`Supprimer ${entry.file.name}`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// ─── ImageUploader ─────────────────────────────────────────────────────────────

/**
 * ImageUploader — premium drag-and-drop multi-image uploader.
 *
 * Features:
 * - Drag & Drop or click-to-browse
 * - Per-file preview, status badge, and progress bar
 * - Parallel upload to Cloudinary
 * - Returns public_ids (not URLs) so they can be stored and transformed later
 * - Fully accessible with keyboard and screen reader support
 */
export function ImageUploader({
  onUploadComplete,
  onImageUploaded,
  maxFiles,
  className,
  disabled = false,
}: ImageUploaderProps) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  // ── File addition ─────────────────────────────────────────────────────────

  const addFiles = useCallback((incoming: File[]) => {
    const imageFiles = incoming.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    const remaining = maxFiles ? maxFiles - files.length : Infinity;
    const toAdd = imageFiles.slice(0, remaining);

    const entries: FileEntry[] = toAdd.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...entries]);
  }, [files.length, maxFiles]);

  // ── Drag & Drop handlers ──────────────────────────────────────────────────

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only leave if exiting the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;
    const dropped = Array.from(e.dataTransfer.files);
    addFiles(dropped);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
      // Reset input so same file can be re-selected
      e.target.value = '';
    }
  };

  // ── Remove file ───────────────────────────────────────────────────────────

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const entry = prev.find((f) => f.id === id);
      if (entry) URL.revokeObjectURL(entry.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  // ── Upload ────────────────────────────────────────────────────────────────

  const handleUpload = async () => {
    const pending = files.filter((f) => f.status === 'pending');
    if (pending.length === 0) return;

    setIsUploading(true);
    const uploaded: UploadedImage[] = [];

    await Promise.all(
      pending.map(async (entry) => {
        // Mark as uploading
        setFiles((prev) =>
          prev.map((f) => (f.id === entry.id ? { ...f, status: 'uploading' } : f))
        );

        try {
          const result = await uploadToCloudinary(entry.file, (percent) => {
            setFiles((prev) =>
              prev.map((f) => (f.id === entry.id ? { ...f, progress: percent } : f))
            );
          });

          setFiles((prev) =>
            prev.map((f) =>
              f.id === entry.id ? { ...f, status: 'done', progress: 100, result } : f
            )
          );

          const img: UploadedImage = {
            public_id: result.public_id,
            secure_url: result.secure_url,
            name: entry.file.name,
          };

          uploaded.push(img);
          onImageUploaded?.(img);
        } catch (err: any) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === entry.id
                ? { ...f, status: 'error', error: err?.message ?? 'Erreur inconnue' }
                : f
            )
          );
        }
      })
    );

    setIsUploading(false);

    if (uploaded.length > 0) {
      onUploadComplete?.(uploaded);
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────

  const pendingCount   = files.filter((f) => f.status === 'pending').length;
  const doneCount      = files.filter((f) => f.status === 'done').length;
  const errorCount     = files.filter((f) => f.status === 'error').length;
  const totalCount     = files.length;
  const overallProgress = totalCount > 0
    ? Math.round(files.reduce((sum, f) => sum + f.progress, 0) / totalCount)
    : 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={cn('space-y-4', className)}>
      {/* ── Drop Zone ──────────────────────────────────────────────────── */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Zone de dépôt d'images"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        className={cn(
          'relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-all duration-200 select-none',
          isDragOver
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : 'border-border/60 bg-muted/20 hover:border-primary/60 hover:bg-primary/5',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept="image/*"
          className="sr-only"
          onChange={handleInputChange}
          disabled={disabled}
          aria-hidden
        />

        {/* Icon */}
        <div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full transition-colors duration-200',
            isDragOver ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary/70',
          )}
        >
          {isDragOver ? (
            <ImageIcon size={28} strokeWidth={1.5} />
          ) : (
            <Upload size={28} strokeWidth={1.5} />
          )}
        </div>

        {/* Text */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            {isDragOver ? 'Relâchez pour ajouter' : 'Glisser-déposer des photos ici'}
          </p>
          <p className="text-xs text-muted-foreground">
            ou <span className="text-primary underline-offset-2 hover:underline">cliquez pour parcourir</span>
          </p>
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest pt-1">
            JPG · PNG · WEBP · AVIF
            {maxFiles && ` · Max ${maxFiles} fichiers`}
          </p>
        </div>
      </div>

      {/* ── File List ──────────────────────────────────────────────────── */}
      {files.length > 0 && (
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>{totalCount} fichier{totalCount > 1 ? 's' : ''} sélectionné{totalCount > 1 ? 's' : ''}</span>
            <span className="flex gap-3">
              {doneCount > 0  && <span className="text-emerald-500">{doneCount} importé{doneCount > 1 ? 's' : ''}</span>}
              {errorCount > 0 && <span className="text-destructive">{errorCount} erreur{errorCount > 1 ? 's' : ''}</span>}
              {pendingCount > 0 && <span>{pendingCount} en attente</span>}
            </span>
          </div>

          {/* Overall progress when uploading */}
          {isUploading && (
            <div className="space-y-1">
              <Progress value={overallProgress} className="h-1.5" />
              <p className="text-[10px] text-right text-muted-foreground">{overallProgress}% total</p>
            </div>
          )}

          {/* Individual file rows */}
          <div className="space-y-2">
            {files.map((entry) => (
              <FileRow key={entry.id} entry={entry} onRemove={removeFile} />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading || disabled}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5',
                  'bg-primary text-primary-foreground text-sm font-medium',
                  'transition-all duration-150 hover:opacity-90 active:scale-[0.98]',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importation en cours…
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Importer {pendingCount > 1 ? `les ${pendingCount} photos` : 'la photo'}
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setFiles([])}
              disabled={isUploading}
              className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tout effacer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
