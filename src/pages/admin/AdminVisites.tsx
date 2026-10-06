import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Phone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { VisitRequest } from "@/types/property";
import StatusBadge, { CountBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog, EmptyState, ErrorState, PageHeader } from "@/components/admin/ui";
import { btn } from "@/components/admin/styles";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { VISIT_LABELS, VISIT_TONE, visitStatus, type VisitStatus } from "@/lib/labels";
import { telHref, whatsappHref } from "@/lib/contact";
import { cn } from "@/lib/utils";

type Visit = VisitRequest & {
  properties_v2: { titre: string; reference: string | null; photo_principale: string | null } | null;
};
type Tab = VisitStatus | "all";

const DB_STATUS: Record<VisitStatus, string> = { pending: "en-attente", confirmed: "confirmee", cancelled: "annulee" };

function formatWhen(iso: string, withTime = true) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
  if (!withTime) return date;
  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
  return hasTime ? `${date} · ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", " h ")}` : date;
}

function receivedLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 864e5);
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", " h ");
  if (d.toDateString() === today.toDateString()) return `aujourd’hui à ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `hier à ${time}`;
  return `le ${d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`;
}

function confirmationMessage(v: Visit) {
  return `Bonjour ${v.client_name}, votre visite${v.properties_v2 ? ` du bien « ${v.properties_v2.titre} »` : ""} est confirmée pour ${formatWhen(v.requested_date)}. À bientôt, l’équipe Live In Marrakech.`;
}

export default function AdminVisites() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("pending");
  const [toDelete, setToDelete] = useState<Visit | null>(null);

  const { data: visits = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-visits"],
    queryFn: async () => {
      const { data, error } = await supabase.from("visit_requests").select("*, properties_v2(titre, reference, photo_principale)").order("requested_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Visit[];
    },
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-visits"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-counts"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
  };

  const updateStatus = async (visit: Visit, next: VisitStatus) => {
    const previous = visit.status;
    const { error } = await supabase.from("visit_requests").update({ status: DB_STATUS[next] }).eq("id", visit.id);
    if (error) {
      toast.error("Le statut n’a pas pu être modifié. Réessayez.");
      return;
    }
    refresh();
    toast.success(next === "confirmed" ? `Visite de ${visit.client_name} confirmée.` : next === "cancelled" ? "Visite annulée." : "Demande remise en attente.", {
      action: { label: "Annuler", onClick: () => void supabase.from("visit_requests").update({ status: previous }).eq("id", visit.id).then(refresh) },
      ...(next === "confirmed" && whatsappHref(visit.client_phone) ? { description: "Prévenez le client sur WhatsApp depuis sa carte." } : {}),
    });
  };

  const deleteVisit = async (visit: Visit) => {
    const { error } = await supabase.from("visit_requests").delete().eq("id", visit.id);
    if (error) {
      toast.error("La demande n’a pas pu être supprimée. Réessayez.");
      return;
    }
    refresh();
    toast.success("Demande supprimée.");
  };

  const counts = useMemo(() => {
    const c = { pending: 0, confirmed: 0, cancelled: 0 };
    visits.forEach((v) => c[visitStatus(v.status)]++);
    return c;
  }, [visits]);
  const visible = visits.filter((v) => tab === "all" || visitStatus(v.status) === tab);

  const tabs: { value: Tab; label: string; count?: number }[] = [
    { value: "pending", label: "En attente", count: counts.pending },
    { value: "confirmed", label: "Confirmées" },
    { value: "cancelled", label: "Annulées" },
    { value: "all", label: "Toutes" },
  ];

  const ContactButtons = ({ v, compact }: { v: Visit; compact?: boolean }) => (
    <>
      <a href={telHref(v.client_phone)} aria-label={compact ? `Appeler ${v.client_name}` : undefined} className={cn(btn.soft, compact ? "h-10 w-10 px-0" : "flex-1")}>
        <Phone size={17} strokeWidth={1.7} aria-hidden="true" />{!compact && "Appeler"}
      </a>
      <a href={whatsappHref(v.client_phone, visitStatus(v.status) === "confirmed" ? confirmationMessage(v) : undefined)} target="_blank" rel="noopener noreferrer" aria-label={compact ? `WhatsApp ${v.client_name}` : undefined} className={cn(btn.whatsapp, compact ? "h-10 w-10 px-0" : "flex-1")}>
        <MessageCircle size={17} strokeWidth={1.7} aria-hidden="true" />{!compact && "WhatsApp"}
      </a>
    </>
  );

  const StatusActions = ({ v, compact }: { v: Visit; compact?: boolean }) => {
    const s = visitStatus(v.status);
    const size = compact ? "h-10 px-3 text-[13px]" : "flex-1";
    return s === "pending" ? (
      <>
        <button type="button" onClick={() => void updateStatus(v, "confirmed")} className={cn(btn.primary, size)}>Confirmer</button>
        <button type="button" onClick={() => void updateStatus(v, "cancelled")} className={cn(btn.outline, size)}>Annuler</button>
      </>
    ) : (
      <button type="button" onClick={() => void updateStatus(v, "pending")} className={cn(btn.outline, size)}>Remettre en attente</button>
    );
  };

  return (
    <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-4 py-4 lg:gap-5 lg:px-10 lg:py-8">
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Supprimer cette demande ?"
        description={toDelete ? `La demande de ${toDelete.client_name}${toDelete.properties_v2 ? ` pour « ${toDelete.properties_v2.titre} »` : ""} sera supprimée définitivement.` : ""}
        onConfirm={() => toDelete && void deleteVisit(toDelete)}
      />
      <PageHeader title="Demandes de visite" />

      <div role="tablist" aria-label="Statut des visites" className="-mx-4 flex gap-5 overflow-x-auto border-b border-border px-4 lg:mx-0 lg:gap-7 lg:px-0">
        {tabs.map((t) => (
          <button key={t.value} type="button" role="tab" aria-selected={tab === t.value} onClick={() => setTab(t.value)}
            className={cn("flex min-h-12 shrink-0 items-center gap-1.5 border-b-2 text-sm", tab === t.value ? "border-primary font-semibold text-foreground" : "border-transparent font-medium text-muted-foreground")}>
            {t.label}<CountBadge count={t.count ?? 0} className="h-5 min-w-5 text-[11px]" />
          </button>
        ))}
      </div>

      {isLoading && <div className="flex flex-col gap-3" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-[220px] rounded-[10px] border border-border bg-card lg:h-16" />)}</div>}
      {isError && <ErrorState title="Impossible de charger les demandes de visite" onRetry={() => refetch()} />}
      {!isLoading && !isError && visible.length === 0 && (
        <EmptyState title={tab === "pending" ? "Tout est à jour" : "Aucune demande ici"} text={tab === "pending" ? "Aucune visite en attente. Les nouvelles demandes du site apparaîtront ici." : "Aucune demande dans cette liste."} />
      )}

      {!isLoading && !isError && visible.length > 0 && (
        <>
          {/* Mobile : cartes */}
          <ul className="m-0 flex list-none flex-col gap-3 p-0 lg:hidden">
            {visible.map((v) => {
              const s = visitStatus(v.status);
              return (
                <li key={v.id} className={cn("flex flex-col gap-3 rounded-[10px] border bg-card p-3.5 shadow-[0_1px_2px_rgba(33,31,27,0.05)]", s === "pending" ? "border-[hsl(37_55%_76%)]" : "border-border")}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex flex-col gap-1">
                      <span className="text-base font-semibold leading-tight">{v.client_name}</span>
                      <a href={telHref(v.client_phone)} className="text-sm font-medium text-[hsl(36_8%_21%)]">{v.client_phone}</a>
                    </span>
                    <StatusBadge tone={VISIT_TONE[s]}>{VISIT_LABELS[s]}</StatusBadge>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-lg bg-[hsl(38_45%_95%)] p-2.5">
                    {v.properties_v2?.photo_principale && <span className="h-12 w-12 shrink-0 overflow-hidden rounded-md"><OptimizedImage src={v.properties_v2.photo_principale} alt="" size="thumb" className="h-full w-full object-cover" wrapperClassName="h-full w-full" /></span>}
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="font-serif text-base font-semibold leading-tight">{v.properties_v2?.titre ?? "Bien non précisé"}</span>
                      <span className="text-sm font-semibold first-letter:uppercase">{formatWhen(v.requested_date)}</span>
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">Reçue {receivedLabel(v.created_at)}</span>
                  <div className="grid grid-cols-2 gap-2"><ContactButtons v={v} /></div>
                  <div className="flex gap-2">
                    <StatusActions v={v} />
                    <button type="button" onClick={() => setToDelete(v)} aria-label={`Supprimer la demande de ${v.client_name}`} className={btn.iconDanger}><Trash2 size={18} aria-hidden="true" /></button>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Desktop : tableau */}
          <div className="hidden overflow-hidden rounded-[10px] border border-border bg-card lg:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-muted text-xs font-semibold tracking-[0.04em] text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-semibold">Client</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Contact</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Bien</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Date souhaitée</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Reçue</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Statut</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((v) => {
                  const s = visitStatus(v.status);
                  return (
                    <tr key={v.id} className={cn("border-b border-[hsl(37_32%_90%)] last:border-b-0", s === "pending" && "bg-[hsl(40_80%_97%)]")}>
                      <td className="px-4 py-3"><span className="flex flex-col gap-0.5"><span className="text-[15px] font-semibold">{v.client_name}</span><a href={telHref(v.client_phone)} className="text-[13px] font-medium text-[hsl(36_8%_21%)]">{v.client_phone}</a></span></td>
                      <td className="px-3 py-3"><span className="flex gap-1.5"><ContactButtons v={v} compact /></span></td>
                      <td className="max-w-[260px] px-3 py-3 text-sm font-semibold">{v.properties_v2?.titre ?? "—"}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm font-semibold first-letter:uppercase">{formatWhen(v.requested_date)}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-[13px] text-muted-foreground first-letter:uppercase">{receivedLabel(v.created_at)}</td>
                      <td className="px-3 py-3"><StatusBadge tone={VISIT_TONE[s]}>{VISIT_LABELS[s]}</StatusBadge></td>
                      <td className="px-4 py-3"><span className="flex justify-end gap-1.5"><StatusActions v={v} compact /><button type="button" onClick={() => setToDelete(v)} aria-label={`Supprimer la demande de ${v.client_name}`} className={cn(btn.iconDanger, "h-10 w-10")}><Trash2 size={16} aria-hidden="true" /></button></span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
