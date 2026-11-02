import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Download, FileSignature, MessageCircle, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { isMissingTable } from "@/lib/agenda";
import { whatsappHref } from "@/lib/contact";
import { useProperties } from "@/hooks/useBiens";
import { ActionMenu, Chips, ConfirmDialog, EmptyState, ErrorState, PageHeader } from "@/components/admin/ui";
import StatusBadge from "@/components/admin/StatusBadge";
import { btn, field } from "@/components/admin/styles";
import {
  BON_ADMIN_COLUMNS,
  SQL_FILE,
  TYPE_BIEN_LABELS,
  bonLink,
  bonReference,
  bonWhatsappText,
  downloadBonPdf,
  formatBonDate,
  formatBonPrix,
  formatBonSigneLe,
  type BonPrixUnite,
  type BonTypeBien,
  type BonVisiteAdmin,
  type BonVisitePublic,
} from "@/lib/bonsVisite";

const KEY = ["admin-bons-visite"];
type Filtre = "a-signer" | "signes" | "tous";
type Prep = { bienId: string; type_bien: BonTypeBien; bien: string; quartier: string; date_visite: string; prix: string; prix_unite: BonPrixUnite };

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const emptyPrep = (): Prep => ({ bienId: "", type_bien: "villa", bien: "", quartier: "", date_visite: today(), prix: "", prix_unite: "mois" });

function useBons() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await supabase.from("bons_visite").select(BON_ADMIN_COLUMNS).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as BonVisiteAdmin[];
    },
    retry: (count, error) => !isMissingTable(error as never) && count < 2,
  });
}

function linkOf(bon: Pick<BonVisiteAdmin, "jeton">) {
  return bonLink(window.location.origin, bon.jeton);
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Lien copié. Collez-le dans WhatsApp.");
  } catch {
    window.prompt("Copiez le lien :", text);
  }
}

function shareHref(bon: Pick<BonVisiteAdmin, "jeton">) {
  return `https://wa.me/?text=${encodeURIComponent(bonWhatsappText(linkOf(bon)))}`;
}

function LinkBox({ bon, onClose }: { bon: BonVisiteAdmin; onClose: () => void }) {
  const link = linkOf(bon);
  return (
    <section className="flex flex-col gap-3 rounded-[10px] border border-[hsl(92_25%_80%)] bg-success p-4 lg:p-5" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-2 text-base font-semibold text-success-foreground"><Check size={18} aria-hidden="true" />Bon {bonReference(bon.numero)} prêt</span>
          <span className="text-sm text-success-foreground">Envoyez ce lien à la cliente : elle remplit ses coordonnées, lit le bon et signe.</span>
        </div>
        <button type="button" onClick={onClose} aria-label="Fermer" className="grid h-11 w-11 shrink-0 place-items-center rounded-md text-success-foreground hover:bg-white/50"><X size={18} aria-hidden="true" /></button>
      </div>
      <code className="block break-all rounded-md border border-border bg-white px-3 py-2.5 text-[13px]">{link}</code>
      <div className="grid grid-cols-1 gap-2 sm:flex">
        <a href={shareHref(bon)} target="_blank" rel="noopener noreferrer" className={btn.whatsapp}><MessageCircle size={18} aria-hidden="true" />Envoyer sur WhatsApp</a>
        <button type="button" onClick={() => void copy(link)} className={btn.outline}><Copy size={18} aria-hidden="true" />Copier le lien</button>
      </div>
    </section>
  );
}

function PrepForm({ onCreated, onCancel }: { onCreated: (bon: BonVisiteAdmin) => void; onCancel: () => void }) {
  const queryClient = useQueryClient();
  const { data: biens = [] } = useProperties();
  const [prep, setPrep] = useState<Prep>(emptyPrep);
  const [error, setError] = useState("");
  const set = <K extends keyof Prep>(k: K, v: Prep[K]) => setPrep((p) => ({ ...p, [k]: v }));

  const pickBien = (id: string) => {
    const b = biens.find((x) => x.id === id);
    if (!b) { set("bienId", ""); return; }
    const unite: BonPrixUnite = prep.prix_unite;
    const prix = unite === "nuit" ? b.prix_location_courte : b.prix_location_longue;
    setPrep((p) => ({
      ...p,
      bienId: id,
      type_bien: b.type === "appartement" ? "appartement" : "villa",
      bien: [b.titre, b.reference ? `(${b.reference})` : ""].filter(Boolean).join(" "),
      quartier: b.quartier ?? p.quartier,
      prix: prix ? String(prix) : p.prix,
    }));
  };

  const create = useMutation({
    mutationFn: async () => {
      const prix = Number(prep.prix.replace(/\s/g, "").replace(",", "."));
      if (prep.bien.trim().length < 2) throw new Error("Indiquez la référence ou la description du bien.");
      if (prep.quartier.trim().length < 2) throw new Error("Indiquez la résidence ou le quartier.");
      if (!prep.date_visite) throw new Error("Indiquez la date de la visite virtuelle.");
      if (!Number.isFinite(prix) || prix <= 0) throw new Error("Indiquez un prix en MAD supérieur à 0.");
      const { data, error: dbError } = await supabase.from("bons_visite").insert({
        type_bien: prep.type_bien,
        bien: prep.bien.trim(),
        quartier: prep.quartier.trim(),
        date_visite: prep.date_visite,
        prix,
        prix_unite: prep.prix_unite,
      }).select(BON_ADMIN_COLUMNS).single();
      if (dbError) throw dbError;
      return data as unknown as BonVisiteAdmin;
    },
    onSuccess: (bon) => {
      void queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(`Bon ${bonReference(bon.numero)} créé.`);
      onCreated(bon);
    },
    onError: (e: Error & { code?: string }) => {
      setError(isMissingTable(e) ? `La table n’existe pas encore : lancez ${SQL_FILE} dans Supabase.` : e.code ? "Le bon n’a pas pu être créé. Réessayez." : e.message);
    },
  });

  const selectableBiens = biens.filter((b) => b.type === "villa" || b.type === "appartement");

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setError(""); create.mutate(); }}
      className="flex flex-col gap-4 rounded-[10px] border border-border bg-card p-4 shadow-[0_1px_2px_rgba(33,31,27,0.05)] lg:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="m-0 font-serif text-[24px] font-semibold">Préparer un bon</h2>
        <button type="button" onClick={onCancel} aria-label="Fermer" className={btn.icon}><X size={18} aria-hidden="true" /></button>
      </div>
      <p className={cn(field.help, "-mt-2")}>Ces informations seront visibles par la cliente, sans qu’elle puisse les modifier.</p>

      {selectableBiens.length > 0 && (
        <label className="flex flex-col gap-1.5">
          <span className={field.label}>Remplir depuis un bien du catalogue (facultatif)</span>
          <select value={prep.bienId} onChange={(e) => pickBien(e.target.value)} className={field.select}>
            <option value="">— Aucun —</option>
            {selectableBiens.map((b) => <option key={b.id} value={b.id}>{b.titre}{b.reference ? ` · ${b.reference}` : ""}</option>)}
          </select>
        </label>
      )}

      <div className="flex flex-col gap-1.5">
        <span className={field.label} id="bv-type">Type de bien</span>
        <div role="radiogroup" aria-labelledby="bv-type" className="grid grid-cols-2 gap-2">
          {(["villa", "appartement"] as BonTypeBien[]).map((t) => (
            <button key={t} type="button" role="radio" aria-checked={prep.type_bien === t} onClick={() => set("type_bien", t)}
              className={cn("h-11 rounded-md border text-sm font-semibold transition-colors", prep.type_bien === t ? "border-primary bg-primary-soft text-[hsl(72_19%_23%)]" : "border-input bg-white text-foreground hover:bg-muted")}>
              {TYPE_BIEN_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={field.label}>Référence ou description du bien</span>
        <input required maxLength={300} value={prep.bien} onChange={(e) => set("bien", e.target.value)} placeholder="Ex. Villa 3 chambres avec piscine (DP-26-XXXXX)" className={field.input} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={field.label}>Résidence / quartier</span>
        <input required maxLength={120} value={prep.quartier} onChange={(e) => set("quartier", e.target.value)} placeholder="Ex. Route de Fès, Prestigia, Guéliz…" className={field.input} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={field.label}>Date de la visite virtuelle</span>
          <input required type="date" value={prep.date_visite} onChange={(e) => set("date_visite", e.target.value)} className={field.input} />
        </label>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="bv-prix" className={field.label}>Prix proposé (MAD)</label>
          <div className="flex gap-2">
            <input id="bv-prix" required inputMode="decimal" value={prep.prix} onChange={(e) => set("prix", e.target.value)} placeholder="18000" className={cn(field.input, "min-w-0 flex-1")} />
            <select aria-label="Unité du prix" value={prep.prix_unite} onChange={(e) => set("prix_unite", e.target.value as BonPrixUnite)} className={cn(field.select, "w-[130px] shrink-0")}>
              <option value="mois">par mois</option>
              <option value="nuit">par nuit</option>
            </select>
          </div>
        </div>
      </div>

      {error && <p role="alert" className="m-0 rounded-md bg-[hsl(0_70%_97%)] p-3 text-sm font-medium text-destructive">{error}</p>}
      <button type="submit" disabled={create.isPending} className={cn(btn.primary, "sm:self-start")}>
        <FileSignature size={18} aria-hidden="true" />{create.isPending ? "Création…" : "Créer le bon et obtenir le lien"}
      </button>
    </form>
  );
}

export default function AdminBonsVisite() {
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const { data: bons = [], isLoading, isError, error, refetch } = useBons();
  const [filtre, setFiltre] = useState<Filtre>("tous");
  const [created, setCreated] = useState<BonVisiteAdmin | null>(null);
  const [toDelete, setToDelete] = useState<BonVisiteAdmin | null>(null);
  const [pdfBusy, setPdfBusy] = useState<string | null>(null);
  const showForm = params.get("new") === "1";
  const missing = isError && isMissingTable(error as never);

  const openForm = (open: boolean) => {
    const next = new URLSearchParams(params);
    if (open) next.set("new", "1"); else next.delete("new");
    setParams(next, { replace: true });
  };

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error: dbError } = await supabase.from("bons_visite").delete().eq("id", id);
      if (dbError) throw dbError;
    },
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: KEY }); toast.success("Bon de visite supprimé."); },
    onError: () => toast.error("Le bon n’a pas pu être supprimé. Réessayez."),
  });

  const pdf = async (bon: BonVisiteAdmin) => {
    setPdfBusy(bon.id);
    try {
      const { data, error: dbError } = await supabase.from("bons_visite").select("signature").eq("id", bon.id).single();
      if (dbError || !data?.signature) throw dbError ?? new Error("signature absente");
      await downloadBonPdf({ ...bon, signature: data.signature } as BonVisitePublic);
    } catch {
      toast.error("Le PDF n’a pas pu être créé. Réessayez.");
    } finally {
      setPdfBusy(null);
    }
  };

  const counts = useMemo(() => ({
    "a-signer": bons.filter((b) => b.statut === "a-signer").length,
    signes: bons.filter((b) => b.statut === "signe").length,
    tous: bons.length,
  }), [bons]);
  const visible = bons.filter((b) => filtre === "tous" || (filtre === "signes" ? b.statut === "signe" : b.statut === "a-signer"));

  return (
    <div className="mx-auto flex max-w-[980px] flex-col gap-4 px-4 py-4 lg:gap-5 lg:px-10 lg:py-8">
      <PageHeader title="Bons de visite" count={isLoading || missing ? undefined : `${counts["a-signer"]} à signer`}>
        {!showForm && !missing && <button type="button" onClick={() => openForm(true)} className={btn.primary}><Plus size={18} aria-hidden="true" />Nouveau bon</button>}
      </PageHeader>

      {missing ? (
        <EmptyState title="Bons de visite à activer" text={`La table n’existe pas encore. Dans Supabase → SQL Editor, collez et lancez le fichier ${SQL_FILE}, puis rechargez cette page.`} />
      ) : (
        <>
          {created && <LinkBox bon={created} onClose={() => setCreated(null)} />}
          {showForm && <PrepForm onCancel={() => openForm(false)} onCreated={(bon) => { setCreated(bon); openForm(false); }} />}

          <Chips label="Filtre" value={filtre} onChange={(v) => setFiltre(v as Filtre)} options={[
            { value: "tous", label: "Tous", count: counts.tous },
            { value: "a-signer", label: "À signer", count: counts["a-signer"] },
            { value: "signes", label: "Signés", count: counts.signes },
          ]} />

          {isLoading ? (
            <div className="flex flex-col gap-2.5" aria-busy="true" aria-label="Chargement des bons de visite">
              {Array.from({ length: 3 }, (_, i) => <div key={i} className="h-[132px] rounded-[10px] border border-border bg-card" />)}
            </div>
          ) : isError ? (
            <ErrorState title="Impossible de charger les bons de visite" onRetry={() => refetch()} />
          ) : visible.length === 0 ? (
            <EmptyState title={bons.length ? "Aucun bon dans ce filtre" : "Aucun bon de visite"} text="Créez un bon, puis envoyez son lien à la cliente sur WhatsApp. Il apparaîtra ici avec son statut." />
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {visible.map((b) => {
                const signed = b.statut === "signe";
                const clientWa = signed ? whatsappHref(b.client_telephone, `Bonjour ${(b.client_nom ?? "").split(" ")[0]}, merci d’avoir signé votre bon de visite Live In Marrakech.`) : undefined;
                return (
                  <li key={b.id} className="flex flex-col gap-3 rounded-[10px] border border-border bg-card p-3.5 shadow-[0_1px_2px_rgba(33,31,27,0.05)] lg:p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground">{bonReference(b.numero)}</span>
                          <StatusBadge tone={signed ? "success" : "warning"}>{signed ? "Signé" : "À signer"}</StatusBadge>
                        </span>
                        <span className="text-base font-semibold leading-snug">{TYPE_BIEN_LABELS[b.type_bien]} · {b.bien}</span>
                        <span className="text-[13px] text-muted-foreground">{b.quartier} · visite du {formatBonDate(b.date_visite)} · {formatBonPrix(b.prix, b.prix_unite)}</span>
                        {signed && b.signe_le && (
                          <span className="text-[13px]"><span className="font-semibold">{b.client_nom}</span> · {b.client_telephone}{b.client_email ? ` · ${b.client_email}` : ""} · signé le {formatBonSigneLe(b.signe_le)}</span>
                        )}
                      </div>
                      <ActionMenu label={`Actions pour le bon ${bonReference(b.numero)}`} items={[
                        ...(!signed ? [{ label: "Copier le lien", onSelect: () => void copy(linkOf(b)) }] : []),
                        { label: "Supprimer", danger: true, onSelect: () => setToDelete(b) },
                      ]} />
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                      {signed ? (
                        <>
                          <button type="button" onClick={() => void pdf(b)} disabled={pdfBusy === b.id} className={btn.primary}>
                            <Download size={18} aria-hidden="true" />{pdfBusy === b.id ? "Préparation…" : "Télécharger le PDF"}
                          </button>
                          {clientWa && <a href={clientWa} target="_blank" rel="noopener noreferrer" className={btn.whatsapp}><MessageCircle size={18} aria-hidden="true" />WhatsApp</a>}
                        </>
                      ) : (
                        <>
                          <a href={shareHref(b)} target="_blank" rel="noopener noreferrer" className={btn.whatsapp}><MessageCircle size={18} aria-hidden="true" />Envoyer sur WhatsApp</a>
                          <button type="button" onClick={() => void copy(linkOf(b))} className={btn.outline}><Copy size={18} aria-hidden="true" />Copier le lien</button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <ConfirmDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)} title="Supprimer ce bon de visite ?"
        description={toDelete ? (toDelete.statut === "signe"
          ? `Le bon ${bonReference(toDelete.numero)} signé par ${toDelete.client_nom} sera supprimé définitivement. Téléchargez d’abord le PDF si vous devez le conserver.`
          : `Le bon ${bonReference(toDelete.numero)} sera supprimé et son lien ne fonctionnera plus.`) : ""}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)} />
    </div>
  );
}
