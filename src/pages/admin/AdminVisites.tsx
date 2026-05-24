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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarCheck, Phone, Mail, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
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

export default function AdminVisites() {
  const [visits, setVisits] = useState<(VisitRequest & { properties_v2?: { titre: string, reference: string }, properties?: any })[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    setLoading(true);
    // On requête la nouvelle table properties_v2
    const { data } = await supabase
      .from("visit_requests")
      .select("*, properties_v2(titre, reference)")
      .order("created_at", { ascending: false });
    
    if (data) setVisits(data as any);
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
    switch (status) {
      case 'confirmee':
        return <Badge variant="outline" className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">Confirmée</Badge>;
      case 'annulee':
        return <Badge variant="outline" className="bg-rose-500/15 text-rose-600 border-rose-500/30">Annulée</Badge>;
      default:
        return <Badge variant="outline" className="bg-amber-500/15 text-amber-600 border-amber-500/30">En attente</Badge>;
    }
  };

  return (
    <main className="container mx-auto px-6 md:px-12 py-8 space-y-6 flex-1 overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarCheck className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
          <div>
            <h2 className="font-serif text-2xl">Demandes de visite</h2>
            <p className="text-sm text-muted-foreground">
              {loading ? "..." : `${visits.length} demande${visits.length !== 1 ? 's' : ''} au total`}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="text-xs tracking-widest uppercase">Client</TableHead>
              <TableHead className="text-xs tracking-widest uppercase">Contact</TableHead>
              <TableHead className="text-xs tracking-widest uppercase">Bien concerné</TableHead>
              <TableHead className="text-xs tracking-widest uppercase">Date souhaitée</TableHead>
              <TableHead className="text-xs tracking-widest uppercase">Statut</TableHead>
              <TableHead className="text-xs tracking-widest uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Chargement des demandes...
                </TableCell>
              </TableRow>
            )}

            {!loading && visits.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Aucune demande de visite pour le moment.
                </TableCell>
              </TableRow>
            )}

            {!loading && visits.map((visit) => (
              <TableRow key={visit.id} className="group">
                <TableCell className="font-medium">
                  {visit.client_name}
                  <div className="text-xs text-muted-foreground font-normal">
                    Reçu le {format(new Date(visit.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-col gap-1 text-sm">
                    <a href={`tel:${visit.client_phone}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                      <Phone size={12} className="text-muted-foreground" />
                      {visit.client_phone}
                    </a>
                    {/* Add email if you have it in schema, assuming not for now */}
                  </div>
                </TableCell>

                <TableCell className="max-w-[200px]">
                  <p className="truncate font-medium text-sm">
                    {visit.properties_v2?.titre || 'Bien supprimé'}
                  </p>
                  {visit.properties_v2?.reference && (
                    <p className="text-xs text-muted-foreground">Réf: {visit.properties_v2.reference}</p>
                  )}
                </TableCell>

                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Clock size={14} className="text-muted-foreground" />
                    {visit.requested_date ? format(new Date(visit.requested_date), 'dd MMMM yyyy', { locale: fr }) : 'Non précisé'}
                  </div>
                </TableCell>

                <TableCell>
                  {getStatusBadge(visit.status)}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {visit.status !== 'confirmee' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
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
                        className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
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
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-1"
                          title="Supprimer"
                        >
                          <Trash2 size={14} strokeWidth={1.5} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer cette demande ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible et supprimera la trace de la demande de visite pour {visit.client_name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteVisit(visit.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
