import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { useDeleteProperty, useToggleStatus } from '@/hooks/useBiens';
import type { Bien, BienStatut, BienType, BienService } from '@/types/property';
import { cn } from '@/lib/utils';

// ─── Badge helpers ────────────────────────────────────────────────────────────

const STATUT_CONFIG: Record<BienStatut, { label: string; className: string }> = {
  publie: {
    label: 'Publié',
    className: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20',
  },
  brouillon: {
    label: 'Brouillon',
    className: 'bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/20',
  },
  'vendu-loue': {
    label: 'Vendu / Loué',
    className: 'bg-rose-500/15 text-rose-600 border-rose-500/30 hover:bg-rose-500/20',
  },
};

const TYPE_CONFIG: Record<BienType, { label: string; className: string }> = {
  villa: { label: 'Villa', className: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
  appartement: { label: 'Appartement', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  riad: { label: 'Riad', className: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  maison: { label: 'Maison', className: 'bg-teal-500/10 text-teal-600 border-teal-500/20' },
  terrain: { label: 'Terrain', className: 'bg-stone-500/10 text-stone-600 border-stone-500/20' },
};

const SERVICE_LABELS: Record<BienService, string> = {
  vente: 'Vente',
  'location-longue-duree': 'Loc. longue durée',
  'location-courte-duree': 'Loc. courte durée',
  'sous-location': 'Sous-location',
};

// ─── Component ─────────────────────────────────────────────────────────────

interface BienCardProps {
  bien: Bien;
  onEdit: (bien: Bien) => void;
}

export function BienCard({ bien, onEdit }: BienCardProps) {
  const deleteMutation = useDeleteProperty();
  const toggleMutation = useToggleStatus();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const statutConfig = STATUT_CONFIG[bien.statut] ?? STATUT_CONFIG.brouillon;
  const typeConfig = TYPE_CONFIG[bien.type] ?? { label: bien.type, className: '' };
  const serviceLabel = (bien.services && bien.services.length > 0)
    ? bien.services.map(s => SERVICE_LABELS[s] || s).join(', ')
    : (SERVICE_LABELS[bien.service] || bien.service);

  const formatPrix = () => {
    const prices: string[] = [];
    
    if (bien.services?.includes('vente') && bien.prix_vente) {
      prices.push(`${new Intl.NumberFormat('fr-MA').format(bien.prix_vente)} ${bien.devise} (Vente)`);
    }
    
    if (bien.services?.includes('location-longue-duree') && bien.prix_location_longue) {
      prices.push(`${new Intl.NumberFormat('fr-MA').format(bien.prix_location_longue)} ${bien.devise}/m (Long)`);
    }
    
    if (bien.services?.includes('location-courte-duree') && bien.prix_location_courte) {
      prices.push(`${new Intl.NumberFormat('fr-MA').format(bien.prix_location_courte)} ${bien.devise}/n (Court)`);
    }

    if (prices.length > 0) return prices.join(' • ');
    
    if (!bien.prix) return '—';
    return new Intl.NumberFormat('fr-MA').format(bien.prix) + ' ' + bien.devise;
  };

  return (
    <TableRow className="group">
      {/* Photo */}
      <TableCell className="w-16 py-2">
        <div className="w-14 h-10 rounded overflow-hidden bg-muted border border-border">
          {bien.photo_principale || bien.photos?.[0] ? (
            <img
              src={bien.photo_principale || bien.photos[0]}
              alt={bien.titre}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">
              —
            </div>
          )}
        </div>
      </TableCell>

      {/* Référence */}
      <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
        {bien.reference ?? '—'}
      </TableCell>

      {/* Titre */}
      <TableCell className="font-medium max-w-xs">
        <p className="truncate">{bien.titre}</p>
        {bien.quartier && (
          <p className="text-xs text-muted-foreground font-normal">{bien.quartier}</p>
        )}
      </TableCell>

      {/* Type */}
      <TableCell>
        <Badge variant="outline" className={cn('text-xs', typeConfig.className)}>
          {typeConfig.label}
        </Badge>
      </TableCell>

      {/* Service */}
      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
        {serviceLabel}
      </TableCell>

      {/* Prix */}
      <TableCell className="font-medium text-sm whitespace-nowrap">
        {formatPrix()}
      </TableCell>

      {/* Statut */}
      <TableCell>
        <Badge variant="outline" className={cn('text-xs', statutConfig.className)}>
          {statutConfig.label}
        </Badge>
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          {/* Modifier */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-60 hover:opacity-100"
            onClick={() => onEdit(bien)}
            title="Modifier"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          {/* Publier / Dépublier */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8',
              bien.statut === 'publie'
                ? 'text-emerald-600 opacity-60 hover:opacity-100'
                : 'opacity-60 hover:opacity-100'
            )}
            onClick={() => toggleMutation.mutate({ id: bien.id, statut: bien.statut })}
            disabled={toggleMutation.isPending}
            title={bien.statut === 'publie' ? 'Dépublier' : 'Publier'}
          >
            {bien.statut === 'publie' ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </Button>

          {/* Supprimer */}
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive/60 hover:text-destructive opacity-60 hover:opacity-100"
                title="Supprimer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer ce bien ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Le bien{' '}
                  <span className="font-semibold text-foreground">"{bien.titre}"</span>{' '}
                  sera définitivement supprimé.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => deleteMutation.mutate(bien.id)}
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default BienCard;
