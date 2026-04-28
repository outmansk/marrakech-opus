import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CloudUpload, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────

type PhotoStatus = 'pending' | 'uploading' | 'done' | 'error' | 'skipped';

interface PhotoEntry {
  originalUrl: string;
  newPublicId: string | null;
  status: PhotoStatus;
  error?: string;
}

interface BienMigration {
  id: string;
  titre: string;
  photos: PhotoEntry[];
  status: 'pending' | 'migrating' | 'done' | 'error';
  progress: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true if the URL is already a Cloudinary public_id (not a full URL) */
function isAlreadyCloudinary(ref: string): boolean {
  return !ref.startsWith('http://') && !ref.startsWith('https://') && !ref.startsWith('data:');
}

/** Returns true if the URL points to Supabase Storage */
function isSupabaseUrl(url: string): boolean {
  return url.includes('.supabase.co/storage/');
}

/** Fetches a URL as a File blob for re-uploading */
async function fetchAsFile(url: string): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const blob = await response.blob();
  const ext = blob.type.split('/')[1] || 'jpg';
  const fileName = `migrated-${Date.now()}.${ext}`;
  return new File([blob], fileName, { type: blob.type });
}

// ─── MigrateCloudinary ────────────────────────────────────────────────────────

export default function MigrateCloudinary() {
  const [biens, setBiens] = useState<BienMigration[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [step, setStep] = useState<'idle' | 'fetched' | 'done'>('idle');

  // ── Step 1 : Analyse des biens ──────────────────────────────────────────────

  const handleAnalyze = async () => {
    setIsFetching(true);
    const { data, error } = await supabase
      .from('properties_v2')
      .select('id, titre, photos, photo_principale')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Erreur Supabase:', error);
      setIsFetching(false);
      return;
    }

    const entries: BienMigration[] = data.map((bien) => {
      const allPhotos: string[] = [
        ...(bien.photos ?? []),
      ];

      // Deduplicate
      const unique = [...new Set(allPhotos)];

      const photos: PhotoEntry[] = unique.map((url) => ({
        originalUrl: url,
        newPublicId: null,
        status: isAlreadyCloudinary(url) ? 'skipped' : 'pending',
        error: undefined,
      }));

      return {
        id: bien.id,
        titre: bien.titre,
        photos,
        status: 'pending',
        progress: 0,
      };
    });

    setBiens(entries);
    setStep('fetched');
    setIsFetching(false);
  };

  // ── Step 2 : Migration ──────────────────────────────────────────────────────

  const handleMigrate = async () => {
    setIsMigrating(true);
    setGlobalProgress(0);

    const toMigrate = biens.filter((b) =>
      b.photos.some((p) => p.status === 'pending')
    );

    let doneCount = 0;
    const total = toMigrate.length;

    for (const bien of toMigrate) {
      // Mark as migrating
      setBiens((prev) =>
        prev.map((b) => (b.id === bien.id ? { ...b, status: 'migrating' } : b))
      );

      const newPhotos = [...bien.photos];
      let hasError = false;

      for (let i = 0; i < newPhotos.length; i++) {
        const photo = newPhotos[i];
        if (photo.status !== 'pending') continue;

        // Mark as uploading
        newPhotos[i] = { ...photo, status: 'uploading' };
        setBiens((prev) =>
          prev.map((b) =>
            b.id === bien.id ? { ...b, photos: [...newPhotos] } : b
          )
        );

        try {
          const file = await fetchAsFile(photo.originalUrl);
          const result = await uploadToCloudinary(file);

          newPhotos[i] = {
            ...photo,
            status: 'done',
            newPublicId: result.public_id,
          };
        } catch (err: any) {
          newPhotos[i] = {
            ...photo,
            status: 'error',
            error: err?.message ?? 'Erreur inconnue',
          };
          hasError = true;
        }

        // Update UI after each photo
        const done = newPhotos.filter((p) => p.status === 'done' || p.status === 'skipped').length;
        const progressPct = Math.round((done / newPhotos.length) * 100);

        setBiens((prev) =>
          prev.map((b) =>
            b.id === bien.id
              ? { ...b, photos: [...newPhotos], progress: progressPct }
              : b
          )
        );
      }

      // Build updated photos array for Supabase
      const updatedPhotos = newPhotos.map((p) =>
        p.status === 'done' && p.newPublicId ? p.newPublicId : p.originalUrl
      );

      // Determine new photo_principale
      const firstDone = newPhotos.find((p) => p.status === 'done');
      const newPhotoPrincipale = firstDone?.newPublicId ?? updatedPhotos[0] ?? null;

      // Update Supabase record
      try {
        await supabase
          .from('properties_v2')
          .update({
            photos: updatedPhotos,
            photo_principale: newPhotoPrincipale,
          })
          .eq('id', bien.id);

        setBiens((prev) =>
          prev.map((b) =>
            b.id === bien.id
              ? { ...b, status: hasError ? 'error' : 'done', progress: 100, photos: newPhotos }
              : b
          )
        );
      } catch (err: any) {
        setBiens((prev) =>
          prev.map((b) =>
            b.id === bien.id ? { ...b, status: 'error' } : b
          )
        );
      }

      doneCount++;
      setGlobalProgress(Math.round((doneCount / total) * 100));
    }

    setIsMigrating(false);
    setStep('done');
  };

  // ── Stats ───────────────────────────────────────────────────────────────────

  const totalBiens     = biens.length;
  const needsMigration = biens.filter((b) => b.photos.some((p) => p.status === 'pending')).length;
  const alreadyDone    = biens.filter((b) => b.photos.every((p) => p.status === 'skipped' || p.status === 'done')).length;
  const migrated       = biens.filter((b) => b.status === 'done').length;
  const withErrors     = biens.filter((b) => b.status === 'error').length;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <main className="container mx-auto px-6 md:px-12 py-8 space-y-8 flex-1 overflow-y-auto max-w-4xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <CloudUpload className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h2 className="font-serif text-2xl">Migration vers Cloudinary</h2>
          <p className="text-sm text-muted-foreground font-light">
            Re-uploade les photos Supabase Storage vers Cloudinary pour des images ultra-rapides.
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 text-sm space-y-2">
        <p className="font-medium text-foreground">Comment ça marche ?</p>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground font-light">
          <li><strong>Analyser</strong> — scanne tous tes biens pour trouver les photos Supabase</li>
          <li><strong>Migrer</strong> — télécharge chaque image et la re-uploade sur Cloudinary</li>
          <li><strong>Mise à jour automatique</strong> — les public_ids Cloudinary remplacent les URLs Supabase en base</li>
        </ol>
      </div>

      {/* Step 1 — Analyze */}
      {step === 'idle' && (
        <div className="flex flex-col items-center justify-center py-16 gap-6 border border-dashed border-border rounded-xl">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <CloudUpload size={36} strokeWidth={1.25} className="text-primary" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-medium">Prêt à migrer tes biens existants</p>
            <p className="text-sm text-muted-foreground font-light">
              Commence par analyser les biens pour voir lesquels nécessitent une migration.
            </p>
          </div>
          <Button onClick={handleAnalyze} disabled={isFetching} className="gap-2 px-8">
            {isFetching ? (
              <><RefreshCw className="h-4 w-4 animate-spin" /> Analyse en cours…</>
            ) : (
              <><ArrowRight className="h-4 w-4" /> Analyser les biens</>
            )}
          </Button>
        </div>
      )}

      {/* Step 2 — Results + Migrate */}
      {(step === 'fetched' || step === 'done') && (
        <div className="space-y-6">

          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total biens',       value: totalBiens,     color: 'text-foreground' },
              { label: 'À migrer',          value: needsMigration, color: 'text-primary' },
              { label: 'Déjà Cloudinary',   value: alreadyDone,    color: 'text-emerald-600' },
              { label: 'Erreurs',           value: withErrors,     color: 'text-destructive' },
            ].map(({ label, value, color }) => (
              <div key={label} className="border border-border rounded-lg p-4 text-center">
                <p className={cn('font-serif text-3xl', color)}>{value}</p>
                <p className="text-[10px] tracking-widest uppercase text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Global progress */}
          {isMigrating && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground uppercase tracking-widest">
                <span>Migration globale</span>
                <span>{globalProgress}%</span>
              </div>
              <Progress value={globalProgress} className="h-2" />
            </div>
          )}

          {/* Migrate button */}
          {step === 'fetched' && needsMigration > 0 && (
            <Button
              onClick={handleMigrate}
              disabled={isMigrating}
              size="lg"
              className="w-full gap-2 h-12"
            >
              {isMigrating ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Migration en cours…</>
              ) : (
                <><CloudUpload className="h-4 w-4" /> Migrer {needsMigration} bien{needsMigration > 1 ? 's' : ''} vers Cloudinary</>
              )}
            </Button>
          )}

          {step === 'done' && (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-5 py-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <p className="font-medium text-emerald-700">Migration terminée !</p>
                <p className="text-sm text-emerald-600 font-light">
                  {migrated} bien{migrated > 1 ? 's' : ''} migré{migrated > 1 ? 's' : ''} avec succès.
                  {withErrors > 0 && ` ${withErrors} erreur(s) — vérifie les détails ci-dessous.`}
                </p>
              </div>
            </div>
          )}

          {/* Per-bien list */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Détail par bien</p>
            {biens.map((bien) => {
              const pendingCount  = bien.photos.filter((p) => p.status === 'pending').length;
              const doneCount     = bien.photos.filter((p) => p.status === 'done').length;
              const skippedCount  = bien.photos.filter((p) => p.status === 'skipped').length;
              const errorCount    = bien.photos.filter((p) => p.status === 'error').length;
              const totalPhotos   = bien.photos.length;

              return (
                <div
                  key={bien.id}
                  className={cn(
                    'rounded-lg border p-4 transition-colors',
                    bien.status === 'done'      && 'border-emerald-500/30 bg-emerald-500/5',
                    bien.status === 'error'     && 'border-destructive/30 bg-destructive/5',
                    bien.status === 'migrating' && 'border-primary/30 bg-primary/5',
                    bien.status === 'pending'   && 'border-border',
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{bien.titre}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {totalPhotos} photo{totalPhotos > 1 ? 's' : ''} ·{' '}
                          {skippedCount > 0 && <span className="text-emerald-600">{skippedCount} déjà Cloudinary · </span>}
                          {doneCount > 0    && <span className="text-emerald-600">{doneCount} migrée{doneCount > 1 ? 's' : ''} · </span>}
                          {pendingCount > 0 && <span className="text-primary">{pendingCount} en attente · </span>}
                          {errorCount > 0   && <span className="text-destructive">{errorCount} erreur{errorCount > 1 ? 's' : ''}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {bien.status === 'done'      && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                      {bien.status === 'error'     && <AlertCircle  className="h-4 w-4 text-destructive" />}
                      {bien.status === 'migrating' && <RefreshCw    className="h-4 w-4 text-primary animate-spin" />}
                    </div>
                  </div>

                  {/* Progress bar during migration */}
                  {bien.status === 'migrating' && (
                    <Progress value={bien.progress} className="h-1 mt-3" />
                  )}

                  {/* Error details */}
                  {bien.photos.some((p) => p.status === 'error') && (
                    <div className="mt-3 space-y-1">
                      {bien.photos.filter((p) => p.status === 'error').map((p, i) => (
                        <p key={i} className="text-[10px] text-destructive truncate">
                          ✗ {p.originalUrl.split('/').pop()} — {p.error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
