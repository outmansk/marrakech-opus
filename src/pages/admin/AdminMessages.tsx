import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Mail, MessageCircle, Phone, RotateCcw, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { telHref, whatsappHref } from "@/lib/contact";
import { ActionMenu, Chips, ConfirmDialog, EmptyState, ErrorState, PageHeader } from "@/components/admin/ui";
import { btn } from "@/components/admin/styles";

const BASE = "/manage-xk92p";

type Message = { id: string; name: string; email: string; phone: string | null; message: string; traite?: boolean; created_at: string };
type Filtre = "a-traiter" | "traites" | "tous";

function useMessages() {
  return useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Message[];
    },
  });
}

function received(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function AdminMessages() {
  const { data: messages = [], isLoading, isError, refetch } = useMessages();
  const queryClient = useQueryClient();
  const [filtre, setFiltre] = useState<Filtre>("a-traiter");
  const [toDelete, setToDelete] = useState<Message | null>(null);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-counts"] });
  };

  const setTraite = useMutation({
    mutationFn: async ({ id, traite }: { id: string; traite: boolean }) => {
      const { error } = await supabase.from("contact_messages").update({ traite }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { refresh(); toast.success("Message supprimé."); },
    onError: () => toast.error("Le message n’a pas pu être supprimé. Réessayez."),
  });

  const toggle = async (m: Message) => {
    const traite = !m.traite;
    try {
      await setTraite.mutateAsync({ id: m.id, traite });
      toast.success(traite ? "Message marqué comme traité." : "Message remis à traiter.", {
        action: { label: "Annuler", onClick: () => setTraite.mutate({ id: m.id, traite: !traite }) },
      });
    } catch {
      toast.error("Le message n’a pas pu être mis à jour. Lancez le fichier SQL « 7-tout-en-attente.sql » si ce n’est pas fait.");
    }
  };

  const counts = useMemo(() => ({
    "a-traiter": messages.filter((m) => !m.traite).length,
    traites: messages.filter((m) => m.traite).length,
    tous: messages.length,
  }), [messages]);
  const visible = messages.filter((m) => filtre === "tous" || (filtre === "traites" ? m.traite : !m.traite));

  const clientLink = (m: Message) => {
    const params = new URLSearchParams({ new: "1", name: m.name, email: m.email, source: "Site web", notes: `Message du site (${received(m.created_at)}) :\n${m.message}` });
    if (m.phone) params.set("phone", m.phone);
    return `${BASE}/clients?${params.toString()}`;
  };

  return (
    <div className="mx-auto flex max-w-[980px] flex-col gap-4 px-4 py-4 lg:gap-5 lg:px-10 lg:py-8">
      <PageHeader title="Messages du site" count={isLoading ? undefined : `${counts["a-traiter"]} à traiter`} />

      <Chips label="Filtre" value={filtre} onChange={(v) => setFiltre(v as Filtre)} options={[
        { value: "a-traiter", label: "À traiter", count: counts["a-traiter"] },
        { value: "traites", label: "Traités", count: counts.traites },
        { value: "tous", label: "Tous", count: counts.tous },
      ]} />

      {isLoading ? (
        <div className="flex flex-col gap-2.5" aria-busy="true" aria-label="Chargement des messages">
          {Array.from({ length: 3 }, (_, i) => <div key={i} className="h-[150px] rounded-[10px] border border-border bg-card" />)}
        </div>
      ) : isError ? (
        <ErrorState title="Impossible de charger les messages" onRetry={() => refetch()} />
      ) : visible.length === 0 ? (
        <EmptyState title={filtre === "a-traiter" ? "Tout est traité" : "Aucun message"} text="Les messages envoyés depuis la page Contact du site apparaîtront ici." />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {visible.map((m) => (
            <li key={m.id} className={cn("flex flex-col gap-3 rounded-[10px] border bg-card p-3.5 shadow-[0_1px_2px_rgba(33,31,27,0.05)] lg:p-4", m.traite ? "border-border opacity-80" : "border-[hsl(20_47%_85%)]")}>
              <div className="flex items-start gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold">{m.name}</span>
                    {!m.traite && <span className="inline-flex h-6 items-center rounded-full bg-[hsl(20_70%_93%)] px-2 text-xs font-semibold text-accent">Nouveau</span>}
                  </span>
                  <span className="text-[13px] text-muted-foreground">{[m.email, m.phone].filter(Boolean).join(" · ")}</span>
                  <span className="text-xs text-muted-foreground first-letter:uppercase">Reçu {received(m.created_at)}</span>
                </div>
                <ActionMenu label={`Actions pour le message de ${m.name}`} items={[
                  { label: m.traite ? "Remettre à traiter" : "Marquer comme traité", onSelect: () => void toggle(m) },
                  { label: "Supprimer", danger: true, onSelect: () => setToDelete(m) },
                ]} />
              </div>
              <p className="m-0 whitespace-pre-line rounded-md bg-background p-3 text-[15px] leading-relaxed">{m.message}</p>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <a href={`mailto:${m.email}?subject=${encodeURIComponent("Votre message à Live In Marrakech")}`} className={cn(btn.outline, "px-3")}><Mail size={18} aria-hidden="true" />Répondre</a>
                {m.phone && <a href={whatsappHref(m.phone, `Bonjour ${m.name.split(" ")[0]}, merci pour votre message sur Live In Marrakech.`)} target="_blank" rel="noopener noreferrer" className={cn(btn.whatsapp, "px-3")}><MessageCircle size={18} aria-hidden="true" />WhatsApp</a>}
                {m.phone && <a href={telHref(m.phone)} className={cn(btn.soft, "px-3")}><Phone size={18} aria-hidden="true" />Appeler</a>}
                <Link to={clientLink(m)} className={cn(btn.soft, "px-3")}><UserPlus size={18} aria-hidden="true" />Créer un client</Link>
                <button type="button" onClick={() => void toggle(m)} className={cn(m.traite ? btn.outline : btn.primary, "col-span-2 px-3 sm:ml-auto")}>
                  {m.traite ? <RotateCcw size={18} aria-hidden="true" /> : <Check size={18} aria-hidden="true" />}{m.traite ? "Remettre à traiter" : "Traité"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)} title="Supprimer ce message ?"
        description={toDelete ? `Le message de ${toDelete.name} sera supprimé définitivement.` : ""}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)} />
    </div>
  );
}
