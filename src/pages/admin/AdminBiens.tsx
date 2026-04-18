import { useState } from 'react';
import { Plus, SlidersHorizontal, LayoutGrid } from 'lucide-react';

import { useProperties } from '@/hooks/useBiens';
import { BienCard } from '@/components/admin/BienCard';
import { BienForm } from '@/components/admin/BienForm';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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

// ─── Skeleton Rows ────────────────────────────────────────────────────────────
function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 8 }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <Skeleton className="h-5 w-full rounded" />
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
    <main className="container mx-auto px-6 md:px-12 py-8 space-y-6 flex-1 overflow-y-auto">
      <BienForm open={sheetOpen} onOpenChange={setSheetOpen} bien={selectedBien} />


        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
            <div>
              <h2 className="font-serif text-2xl">Gestion des biens</h2>
              <p className="text-sm text-muted-foreground">
                {isLoading ? '...' : `${biens.length} bien${biens.length !== 1 ? 's' : ''} trouvé${biens.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          <Button onClick={handleAddNew} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Ajouter un bien
          </Button>
        </div>

        {/* ── Filtres ── */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg border border-border bg-card">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />

          <Select value={filterType} onValueChange={(v) => setFilterType(v as BienType | 'all')}>
            <SelectTrigger className="w-44 h-9 text-sm">
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
            <SelectTrigger className="w-52 h-9 text-sm">
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
            <SelectTrigger className="w-44 h-9 text-sm">
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
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 text-xs text-muted-foreground">
              Réinitialiser
            </Button>
          )}

          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-auto h-9 px-3 flex items-center gap-1 text-xs">
              Filtres actifs
            </Badge>
          )}
        </div>

        {/* ── Table ── */}
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-16 text-xs tracking-widest uppercase">Photo</TableHead>
                <TableHead className="text-xs tracking-widest uppercase">Référence</TableHead>
                <TableHead className="text-xs tracking-widest uppercase">Titre</TableHead>
                <TableHead className="text-xs tracking-widest uppercase">Type</TableHead>
                <TableHead className="text-xs tracking-widest uppercase">Service</TableHead>
                <TableHead className="text-xs tracking-widest uppercase">Prix</TableHead>
                <TableHead className="text-xs tracking-widest uppercase">Statut</TableHead>
                <TableHead className="text-xs tracking-widest uppercase text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <SkeletonRows />}

              {!isLoading && error && (
                <TableRow>
                  <td colSpan={8} className="py-16 text-center text-muted-foreground text-sm">
                    Erreur lors du chargement des biens. Vérifiez votre connexion Supabase.
                  </td>
                </TableRow>
              )}

              {!isLoading && !error && biens.length === 0 && (
                <TableRow>
                  <td colSpan={8} className="py-16 text-center">
                    <p className="text-muted-foreground font-light mb-3">Aucun bien trouvé.</p>
                    <Button variant="outline" size="sm" onClick={handleAddNew} className="gap-2">
                      <Plus className="h-3.5 w-3.5" />
                      Ajouter le premier bien
                    </Button>
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
