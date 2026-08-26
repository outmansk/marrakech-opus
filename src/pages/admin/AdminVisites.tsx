import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { VisitRequest } from "@/types/property";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarCheck, Phone, Trash2, CheckCircle, XCircle, Clock, Inbox } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

type VisitWithProperty = VisitRequest & {
  properties_v2: { titre: string; reference: string | null } | null;
};

export default function AdminVisites() {
  const [visits, setVisits] = useState<VisitWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("visit_requests")
      .select("*, properties_v2(titre, reference)")
      .order("created_at", { ascending: false });
    
    if (data) setVisits(data as VisitWithProperty[]);
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("visit_requests")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut.", variant: "destructive" });
    } else {
      toast({ title: "Statut mis à jour", description: "Le statut de la visite a bien été modifié." });
      setVisits(visits.map(v => v.id === id ? { ...v, status: newStatus } : v));
    }
  };

  const deleteVisit = async (id: string) => {
    const { error } = await supabase
      .from("visit_requests")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer la demande.", variant: "destructive" });
    } else {
      toast({ title: "Demande supprimée", description: "La demande de visite a bien été supprimée." });
      setVisits(visits.filter(v => v.id !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; dot: string; label: string; pulse?: boolean }> = {
      'en-attente': { bg: 'bg-amber-500/10', text: 'text-amber-600', dot: 'bg-amber-500', label: 'En attente', pulse: true },
      confirmee: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', dot: 'bg-emerald-500', label: 'Confirmée' },
      annulee: { bg: 'bg-rose-500/10', text: 'text-rose-600', dot: 'bg-rose-500', label: 'Annulée' },
    };
    const c = config[status] ?? config['en-attente'];
    return (
      <span className={cn(
        "text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 font-medium",
        c.bg, c.text
      )}>
        <span className={cn("w-1.5 h-1.5 rounded-full", c.dot, c.pulse && "admin-pulse")} />
        {c.label}
      </span>
    );
  };

  const pendingCount = visits.filter(v => v.status === 'en-attente').length;

  return (
    <main className="container mx-auto px-6 md:px-10 py-8 space-y-6 flex-1 overflow-y-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-bronze/8 flex items-center justify-center">
              <CalendarCheck className="h-4 w-4 text-[hsl(30_30%_45%)]" strokeWidth={1.5} />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl">Demandes de visite</h2>
          </div>
          <div className="flex items-center gap-3 ml-[42px]">
            <p className="text-sm text-muted-foreground font-light">
              {loading ? "..." : `${visits.length} demande${visits.length !== 1 ? 's' : ''} au total`}
            </p>
            {pendingCount > 0 && !loading && (
              <span className="text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 font-medium bg-amber-500/10 text-amber-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 admin-pulse" />
                {pendingCount} en attente
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="admin-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/40">
              <TableHead className="text-[10px] tracking-[0.2em] uppercase font-sans py-3.5">Client</TableHead>
              <TableHead className="text-[10px] tracking-[0.2em] uppercase font-sans">Contact</TableHead>
              <TableHead className="text-[10px] tracking-[0.2em] uppercase font-sans">Bien concerné</TableHead>
              <TableHead className="text-[10px] tracking-[0.2em] uppercase font-sans">Date souhaitée</TableHead>
              <TableHead className="text-[10px] tracking-[0.2em] uppercase font-sans">Statut</TableHead>
              <TableHead className="text-[10px] tracking-[0.2em] uppercase font-sans text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <span className="text-sm text-muted-foreground">Chargement des demandes...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading && visits.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                      <Inbox className="h-5 w-5 text-muted-foreground/40" strokeWidth={1.5} />
                    </div>
                    <p className="text-muted-foreground font-light text-sm">Aucune demande de visite pour le moment.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading && visits.map((visit) => (
              <TableRow key={visit.id} className="group hover:bg-muted/20 transition-colors border-b border-border/30">
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{visit.client_name}</p>
                    <p className="text-[11px] text-muted-foreground font-light mt-0.5">
                      Reçu le {format(new Date(visit.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                </TableCell>
                
                <TableCell>
                  <a href={`tel:${visit.client_phone}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors group/phone">
                    <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center group-hover/phone:bg-primary/10 transition-colors">
                      <Phone size={12} className="text-primary/60" />
                    </div>
                    <span className="tabular-nums">{visit.client_phone}</span>
                  </a>
                </TableCell>

                <TableCell className="max-w-[200px]">
                  <p className="truncate font-medium text-sm">
                    {visit.properties_v2?.titre || 'Bien supprimé'}
                  </p>
                  {visit.properties_v2?.reference && (
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">Réf: {visit.properties_v2.reference}</p>
                  )}
                </TableCell>

                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center">
                      <Clock size={12} className="text-muted-foreground" />
                    </div>
                    <span>{visit.requested_date ? format(new Date(visit.requested_date), 'dd MMMM yyyy', { locale: fr }) : 'Non précisé'}</span>
                  </div>
                </TableCell>

                <TableCell>
                  {getStatusBadge(visit.status)}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-0.5">
                    {visit.status !== 'confirmee' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/8 rounded-lg"
                        title="Confirmer la visite"
                        onClick={() => updateStatus(visit.id, 'confirmee')}
                      >
                        <CheckCircle size={16} strokeWidth={1.5} />
                      </Button>
                    )}
                    
                    {visit.status !== 'annulee' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-500/8 rounded-lg"
                        title="Annuler la visite"
                        onClick={() => updateStatus(visit.id, 'annulee')}
                      >
                        <XCircle size={16} strokeWidth={1.5} />
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/8 ml-0.5 rounded-lg"
                          title="Supprimer"
                        >
                          <Trash2 size={14} strokeWidth={1.5} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer cette demande ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible et supprimera la trace de la demande de visite pour {visit.client_name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-lg">Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteVisit(visit.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
