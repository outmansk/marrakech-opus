import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Plus, SlidersHorizontal, LayoutGrid, Search, X, Pencil, Eye, EyeOff, Trash2, ExternalLink } from 'lucide-react';

import { useProperties } from '@/hooks/useBiens';
import { BienCard } from '@/components/admin/BienCard';
import { useDeleteProperty, useToggleStatus } from '@/hooks/useBiens';
import { BienForm } from '@/components/admin/BienForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Bien, BienType, BienService, BienStatut } from '@/types/property';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

function MobilePropertyCard({ bien, onEdit }: { bien: Bien; onEdit: (bien: Bien) => void }) {
  const deleteMutation = useDeleteProperty();
  const toggleMutation = useToggleStatus();
  const price = bien.prix_location_longue ?? bien.prix_vente ?? bien.prix_location_courte ?? bien.prix;
  const priceSuffix = bien.prix_location_longue != null ? "/mois" : bien.prix_location_courte != null ? "/nuit" : "";
  const status = bien.statut === 'publie' ? 'Publié' : bien.statut === 'vendu-loue' ? 'Vendu / Loué' : 'Brouillon';
  const statusTone = bien.statut === 'publie' ? 'bg-emerald-500/10 text-emerald-700' : bien.statut === 'vendu-loue' ? 'bg-rose-500/10 text-rose-700' : 'bg-amber-500/10 text-amber-700';

  return <article className="admin-card min-w-0 rounded-xl p-3.5">
    <div className="flex min-w-0 items-start gap-3">
      <div className="h-[76px] w-[88px] shrink-0 overflow-hidden rounded-lg bg-muted/50">{(bien.photo_principale || bien.photos?.[0]) ? <img src={bien.photo_principale || bien.photos[0]} alt={bien.titre} className="h-full w-full object-cover" loading="lazy" /> : <div className="grid h-full place-items-center text-xs text-muted-foreground">Photo</div>}</div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5"><span className="font-mono text-[10px] text-muted-foreground">{bien.reference || "Sans réf."}</span><span className={cn("rounded-full px-2 py-0.5 text-[9px] font-medium", statusTone)}>{status}</span></div>
        <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-5">{bien.titre}</h3>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{bien.type} · {bien.quartier || "Marrakech"}</p>
        <p className="mt-1 text-xs font-semibold tabular-nums">{price == null ? "Prix à préciser" : `${price.toLocaleString('fr-MA')} ${bien.devise}${priceSuffix}`}</p>
      </div>
    </div>
    <div className="mt-3 flex gap-2 border-t border-border/40 pt-3">
      <Button type="button" variant="outline" className="min-h-11 flex-1 gap-1.5 px-2 text-xs" onClick={() => onEdit(bien)}><Pencil size={14} />Modifier</Button>
      <Button type="button" variant="outline" className="min-h-11 flex-1 gap-1.5 px-2 text-xs" disabled={toggleMutation.isPending} onClick={() => toggleMutation.mutate({ id: bien.id, statut: bien.statut })}>{bien.statut === 'publie' ? <><EyeOff size={14} />Dépublier</> : <><Eye size={14} />Publier</>}</Button>
      <Button type="button" variant="outline" size="icon" className="h-11 w-11 shrink-0" asChild><a aria-label="Voir le bien sur le site" href={`/bien/${bien.id}`} target="_blank" rel="noreferrer"><ExternalLink size={15} /></a></Button>
      <AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="outline" size="icon" className="h-11 w-11 shrink-0 text-destructive" aria-label="Supprimer ce bien"><Trash2 size={15} /></Button></AlertDialogTrigger><AlertDialogContent className="w-[calc(100vw-1.5rem)] max-w-lg rounded-xl"><AlertDialogHeader><AlertDialogTitle>Supprimer ce bien ?</AlertDialogTitle><AlertDialogDescription>Cette action supprimera « {bien.titre} ».</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="min-h-11">Annuler</AlertDialogCancel><AlertDialogAction className="min-h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteMutation.mutate(bien.id)}>Supprimer</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  </article>;
}

// ─── Skeleton Rows ────────────────────────────────────────────────────────────
function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 8 }).map((_, j) => (
            <td key={j} className="px-4 py-4">
              <div className="h-5 w-full rounded-md shimmer-admin" />
            </td>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminBiens() {
  // Filters
  const [filterType, setFilterType] = useState<BienType | 'all'>('all');
  const [filterService, setFilterService] = useState<BienService | 'all'>('all');
  const [filterStatut, setFilterStatut] = useState<BienStatut | 'all'>('all');

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedBien, setSelectedBien] = useState<Bien | null>(null);

  const filters = {
    type: filterType !== 'all' ? filterType : undefined,
    service: filterService !== 'all' ? filterService : undefined,
    statut: filterStatut !== 'all' ? filterStatut : undefined,
  };

  const { data: biens = [], isLoading, error } = useProperties(filters);

  const handleAddNew = () => {
    setSelectedBien(null);
    setSheetOpen(true);
  };

  const handleEdit = (bien: Bien) => {
    setSelectedBien(bien);
    setSheetOpen(true);
  };

  // Liens directs depuis le tableau de bord ou le bouton « + » : ?new=1 ou ?edit=<id>
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (searchParams.get('new') === '1') {
      handleAddNew();
      setSearchParams({}, { replace: true });
    } else if (editId) {
      void supabase.from('properties_v2').select('*').eq('id', editId).single().then(({ data }) => {
        if (data) handleEdit(data as Bien);
        setSearchParams({}, { replace: true });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const resetFilters = () => {
    setFilterType('all');
    setFilterService('all');
    setFilterStatut('all');
  };

  const hasActiveFilters = filterType !== 'all' || filterService !== 'all' || filterStatut !== 'all';

  return (
    <main className="container mx-auto w-full min-w-0 px-3 sm:px-6 md:px-10 py-4 sm:py-6 md:py-8 space-y-5 md:space-y-6 flex-1">
      <BienForm open={sheetOpen} onOpenChange={setSheetOpen} bien={selectedBien} />

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
              <LayoutGrid className="h-4 w-4 text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl">Gestion des biens</h2>
          </div>
          <p className="text-sm text-muted-foreground font-light ml-[42px]">
            {isLoading ? '...' : `${biens.length} bien${biens.length !== 1 ? 's' : ''} trouvé${biens.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <Button
          onClick={handleAddNew}
          className="w-full sm:w-auto gap-2 shrink-0 rounded-lg h-11 sm:h-10 px-4 sm:px-5 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm hover:shadow-md transition-all"
        >
          <Plus className="h-4 w-4" />
          <span className="text-[12px] tracking-wide">Ajouter un bien</span>
        </Button>
      </div>

      {/* ── Filtres ── */}
      <div className="admin-card rounded-xl p-3 sm:p-4 flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 mr-1">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-sans hidden sm:inline">Filtres</span>
        </div>

        <Select value={filterType} onValueChange={(v) => setFilterType(v as BienType | 'all')}>
          <SelectTrigger className="w-full sm:w-40 h-11 sm:h-9 text-sm rounded-lg border-border/50 bg-background/50">
            <SelectValue placeholder="Type de bien" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="villa">Villa</SelectItem>
            <SelectItem value="appartement">Appartement</SelectItem>
            <SelectItem value="riad">Riad</SelectItem>
            <SelectItem value="maison">Maison</SelectItem>
            <SelectItem value="terrain">Terrain</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterService} onValueChange={(v) => setFilterService(v as BienService | 'all')}>
          <SelectTrigger className="w-full sm:w-48 h-11 sm:h-9 text-sm rounded-lg border-border/50 bg-background/50">
            <SelectValue placeholder="Service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les services</SelectItem>
            <SelectItem value="vente">Vente</SelectItem>
            <SelectItem value="location-longue-duree">Location longue durée</SelectItem>
            <SelectItem value="location-courte-duree">Location courte durée</SelectItem>
            <SelectItem value="sous-location">Sous-location</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatut} onValueChange={(v) => setFilterStatut(v as BienStatut | 'all')}>
          <SelectTrigger className="w-full sm:w-40 h-11 sm:h-9 text-sm rounded-lg border-border/50 bg-background/50">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="publie">Publié</SelectItem>
            <SelectItem value="brouillon">Brouillon</SelectItem>
            <SelectItem value="vendu-loue">Vendu / Loué</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-9 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-lg"
          >
            <X className="h-3 w-3" />
            Réinitialiser
          </Button>
        )}

        {hasActiveFilters && (
          <Badge variant="secondary" className="ml-auto h-7 px-3 flex items-center gap-1.5 text-[10px] rounded-full bg-primary/8 text-primary border-primary/15">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Filtres actifs
          </Badge>
        )}
      </div>

      {/* ── Table ── */}
      <div className="space-y-3 md:hidden">
        {isLoading && <div className="admin-card rounded-xl p-6 text-center text-sm text-muted-foreground">Chargement des biens...</div>}
        {!isLoading && error && <div className="admin-card rounded-xl p-6 text-center text-sm text-destructive">Erreur lors du chargement des biens. Vérifiez la connexion.</div>}
        {!isLoading && !error && biens.length === 0 && <div className="admin-card rounded-xl p-8 text-center"><p className="text-sm text-muted-foreground">Aucun bien trouvé.</p><Button type="button" variant="outline" className="mt-4 min-h-11 gap-2" onClick={handleAddNew}><Plus size={15} />Ajouter un bien</Button></div>}
        {!isLoading && !error && biens.map((bien) => <MobilePropertyCard key={bien.id} bien={bien} onEdit={handleEdit} />)}
      </div>

      <div className="hidden md:block admin-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/40">
              <TableHead className="w-16 text-[10px] tracking-[0.2em] uppercase font-sans py-3.5">Photo</TableHead>
              <TableHead className="text-[10px] tracking-[0.2em] uppercase font-sans">Référence</TableHead>
              <TableHead className="text-[10px] tracking-[0.2em] uppercase font-sans">Titre</TableHead>
              <TableHead className="text-[10px] tracking-[0.2em] uppercase font-sans">Type</TableHead>
              <TableHead className="text-[10px] tracking-[0.2em] uppercase font-sans">Service</TableHead>
              <TableHead className="text-[10px] tracking-[0.2em] uppercase font-sans">Prix</TableHead>
              <TableHead className="text-[10px] tracking-[0.2em] uppercase font-sans">Statut</TableHead>
              <TableHead className="text-[10px] tracking-[0.2em] uppercase font-sans text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <SkeletonRows />}

            {!isLoading && error && (
              <TableRow>
                <td colSpan={8} className="py-16 text-center text-muted-foreground text-sm">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-destructive/8 flex items-center justify-center">
                      <X className="h-5 w-5 text-destructive/60" />
                    </div>
                    <p>Erreur lors du chargement des biens.</p>
                    <p className="text-xs text-muted-foreground/60">Vérifiez votre connexion Supabase.</p>
                  </div>
                </td>
              </TableRow>
            )}

            {!isLoading && !error && biens.length === 0 && (
              <TableRow>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-muted/50 flex items-center justify-center">
                      <LayoutGrid className="h-6 w-6 text-muted-foreground/40" strokeWidth={1.5} />
                    </div>
                    <p className="text-muted-foreground font-light">Aucun bien trouvé.</p>
                    <Button variant="outline" size="sm" onClick={handleAddNew} className="gap-2 rounded-lg">
                      <Plus className="h-3.5 w-3.5" />
                      Ajouter le premier bien
                    </Button>
                  </div>
                </td>
              </TableRow>
            )}

            {!isLoading && !error && biens.map((bien) => (
              <BienCard key={bien.id} bien={bien} onEdit={handleEdit} />
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
