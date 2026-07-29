import { useState } from 'react';
import { Plus, SlidersHorizontal, LayoutGrid, Search, X } from 'lucide-react';

import { useProperties } from '@/hooks/useBiens';
import { BienCard } from '@/components/admin/BienCard';
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

  const resetFilters = () => {
    setFilterType('all');
    setFilterService('all');
    setFilterStatut('all');
  };

  const hasActiveFilters = filterType !== 'all' || filterService !== 'all' || filterStatut !== 'all';

  return (
    <main className="container mx-auto px-6 md:px-10 py-8 space-y-6 flex-1 overflow-y-auto">
      <BienForm open={sheetOpen} onOpenChange={setSheetOpen} bien={selectedBien} />

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
              <LayoutGrid className="h-4 w-4 text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl">Gestion des biens</h2>
          </div>
          <p className="text-sm text-muted-foreground font-light ml-[42px]">
            {isLoading ? '...' : `${biens.length} bien${biens.length !== 1 ? 's' : ''} trouvé${biens.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <Button
          onClick={handleAddNew}
          className="gap-2 shrink-0 rounded-lg h-10 px-5 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm hover:shadow-md transition-all"
        >
          <Plus className="h-4 w-4" />
          <span className="text-[12px] tracking-wide">Ajouter un bien</span>
        </Button>
      </div>

      {/* ── Filtres ── */}
      <div className="admin-card rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 mr-1">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-sans hidden sm:inline">Filtres</span>
        </div>

        <Select value={filterType} onValueChange={(v) => setFilterType(v as BienType | 'all')}>
          <SelectTrigger className="w-40 h-9 text-sm rounded-lg border-border/50 bg-background/50">
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
          <SelectTrigger className="w-48 h-9 text-sm rounded-lg border-border/50 bg-background/50">
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
          <SelectTrigger className="w-40 h-9 text-sm rounded-lg border-border/50 bg-background/50">
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
      <div className="admin-card rounded-xl overflow-hidden">
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
