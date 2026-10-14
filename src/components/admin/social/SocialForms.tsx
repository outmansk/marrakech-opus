import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { btn, field } from "@/components/admin/styles";
import { SelectField } from "@/components/admin/ui";
import {
  ALERTE_TYPES, GROUPE_STATUTS, GROUPE_TYPES, LANGUES, PUBLIE_PAR, PUB_STATUTS, RESEAUX,
  type AlerteType, type Groupe, type Publication, type Reseau,
} from "@/lib/social/model";
import { useSaveAlerte, useSaveGroupe, useSavePublication, type BienRef, type GroupeInput, type PublicationInput } from "@/hooks/useSocial";
import { duplicates } from "@/lib/social/stats";
import { Checkbox, CopyLinkButton, Field, FormSheet } from "./SocialUI";
import { fromLocalInput, pubTrackedUrl, toLocalInput } from "@/lib/social/format";

const HORS_SITE = "__hors_site__";

const PUB_FIELDS = ["bien_id", "bien_hors_site", "groupe_id", "reseau", "publie_le", "langue", "texte_debut", "nb_photos", "lien", "publie_par", "statut", "remarque"] as const;
const GROUPE_FIELDS = ["nom", "lien", "reseau", "membres", "type", "langue", "regles", "agences_interdites", "immobilier_interdit", "approbation_obligatoire", "statut", "statut_raison"] as const;
/** Ne garde que les champs modifiables (pas l'identifiant, le code ni les dates techniques). */
const pick = <T extends object, K extends keyof T>(obj: T, keys: readonly K[]) => Object.fromEntries(keys.map((k) => [k, obj[k]])) as Pick<T, K>;

function Footer({ saving, onCancel, label }: { saving: boolean; onCancel: () => void; label: string }) {
  return (
    <div className="absolute inset-x-0 bottom-0 flex gap-2.5 border-t border-border bg-card px-4 py-3 lg:px-6">
      <button type="button" onClick={onCancel} className={cn(btn.outline, "flex-1 lg:flex-none")}>Annuler</button>
      <button type="submit" disabled={saving} className={cn(btn.primary, "flex-1 lg:flex-none")}>{saving ? "Enregistrement…" : label}</button>
    </div>
  );
}

// ─── Publication ───────────────────────────────────────────────────────────

const emptyPublication = (bienId?: string | null): PublicationInput => ({
  bien_id: bienId ?? null, bien_hors_site: null, groupe_id: null, reseau: "facebook", publie_le: new Date().toISOString(),
  langue: "fr", texte_debut: "", nb_photos: null, lien: "", publie_par: "moi", statut: "en-attente", remarque: "",
});

export function PublicationForm({ open, onClose, publication, defaultBienId, biens, groupes, pubs }: {
  open: boolean; onClose: () => void; publication: Publication | null; defaultBienId?: string | null;
  biens: BienRef[]; groupes: Groupe[]; pubs: Publication[];
}) {
  const save = useSavePublication();
  const [form, setForm] = useState<PublicationInput>(emptyPublication(defaultBienId));
  const [horsSite, setHorsSite] = useState(false);
  const [saved, setSaved] = useState<Publication | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const initial = publication ? pick(publication, PUB_FIELDS) : emptyPublication(defaultBienId);
    setForm(initial);
    setHorsSite(!!publication && !publication.bien_id);
    setSaved(null);
    setError(null);
  }, [open, publication, defaultBienId]);

  const up = <K extends keyof PublicationInput>(k: K, v: PublicationInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const groupesDuReseau = groupes.filter((g) => g.reseau === form.reseau || g.id === form.groupe_id);
  const groupe = groupes.find((g) => g.id === form.groupe_id);
  const maps = useMemo(() => ({ biens: new Map(biens.map((b) => [b.id, b])), groupes: new Map(groupes.map((g) => [g.id, g])) }), [biens, groupes]);

  // Doublon : même bien dans le même groupe il y a moins de 7 jours.
  const duplicate = useMemo(() => {
    if (!form.groupe_id || (!form.bien_id && !form.bien_hors_site)) return false;
    const draft = { ...form, id: publication?.id ?? "draft", code: 0, statut_change_le: form.publie_le } as Publication;
    return duplicates([...pubs.filter((p) => p.id !== draft.id), draft]).some((d) => d.first.id === draft.id || d.second.id === draft.id);
  }, [form, pubs, publication]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!horsSite && !form.bien_id) return setError("Choisissez le bien publié, ou « Bien hors site ».");
    if (horsSite && !form.bien_hors_site?.trim()) return setError("Indiquez le nom du bien hors site.");
    setError(null);
    const values: Partial<PublicationInput> = {
      ...form,
      bien_id: horsSite ? null : form.bien_id,
      bien_hors_site: horsSite ? form.bien_hors_site?.trim() || null : null,
      texte_debut: form.texte_debut?.trim() || null,
      lien: form.lien?.trim() || null,
      remarque: form.remarque?.trim() || null,
    };
    const result = await save.mutateAsync({ id: publication?.id, values }).catch(() => null);
    if (!result) return;
    if (publication) onClose();
    else setSaved(result);
  };

  if (saved) {
    const url = pubTrackedUrl(saved, maps.biens, maps.groupes);
    return (
      <FormSheet open={open} onClose={onClose} title="Publication ajoutée" description="Lien suivi à coller dans la publication.">
        <div className="flex flex-col gap-4 px-4 py-5 lg:px-6">
          <p className="m-0 text-[15px]">La publication est enregistrée sous la référence <strong>{RESEAUX[saved.reseau].prefix}-{saved.code}</strong>.</p>
          {url ? (
            <>
              <p className="m-0 text-sm text-muted-foreground">Collez ce lien dans le texte de la publication : les visites et les demandes envoyées depuis le site seront rattachées à ce groupe.</p>
              <code className="break-all rounded-md border border-border bg-card p-3 text-[13px]">{url}</code>
              <CopyLinkButton url={url} />
            </>
          ) : <p className="m-0 text-sm text-muted-foreground">Ce bien n’est pas encore sur le site : pas de lien suivi pour l’instant.</p>}
          <div className="flex gap-2.5">
            <button type="button" onClick={() => { setForm({ ...emptyPublication(form.bien_id), bien_hors_site: form.bien_hors_site, langue: form.langue }); setSaved(null); }} className={btn.outline}>Ajouter une autre publication</button>
            <button type="button" onClick={onClose} className={btn.primary}>Terminer</button>
          </div>
        </div>
      </FormSheet>
    );
  }

  return (
    <FormSheet open={open} onClose={onClose} title={publication ? "Modifier la publication" : "Nouvelle publication"} description="Bien, groupe, date, langue et statut de la publication.">
      <form onSubmit={submit} noValidate className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto px-4 pb-28 pt-4 lg:px-6">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Bien publié" className="sm:col-span-2">
              <SelectField label="Bien" value={horsSite ? HORS_SITE : form.bien_id ?? ""} onChange={(v) => { setHorsSite(v === HORS_SITE); up("bien_id", v === HORS_SITE || !v ? null : v); }}>
                <option value="">Choisir un bien…</option>
                {biens.map((b) => <option key={b.id} value={b.id}>{b.titre}{b.reference ? ` · ${b.reference.trim()}` : ""}{b.statut === "vendu-loue" ? " (loué / vendu)" : ""}</option>)}
                <option value={HORS_SITE}>Bien hors site (pas encore sur le site)…</option>
              </SelectField>
            </Field>
            {horsSite && (
              <Field label="Nom du bien hors site" className="sm:col-span-2" help="Vous pourrez le rattacher plus tard à un bien du site.">
                <input value={form.bien_hors_site ?? ""} onChange={(e) => up("bien_hors_site", e.target.value)} placeholder="Ex. Maison meublée – Route d’Essaouira" className={field.input} />
              </Field>
            )}
            <Field label="Réseau">
              <SelectField label="Réseau" value={form.reseau} onChange={(v) => setForm((f) => ({ ...f, reseau: v as Reseau, groupe_id: groupes.find((g) => g.id === f.groupe_id)?.reseau === v ? f.groupe_id : null }))}>
                {Object.entries(RESEAUX).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
              </SelectField>
            </Field>
            <Field label="Groupe ou page">
              <SelectField label="Groupe" value={form.groupe_id ?? ""} onChange={(v) => setForm((f) => ({ ...f, groupe_id: v || null, langue: groupes.find((g) => g.id === v)?.langue ?? f.langue }))}>
                <option value="">Aucun (profil, Marketplace…)</option>
                {groupesDuReseau.map((g) => <option key={g.id} value={g.id}>{g.nom}{g.statut === "a-eviter" ? " (à éviter)" : ""}</option>)}
              </SelectField>
            </Field>
            {groupe && (groupe.agences_interdites || groupe.immobilier_interdit || groupe.statut === "a-eviter") && (
              <p className="m-0 rounded-md bg-[hsl(14_60%_95%)] p-3 text-[13px] text-[hsl(9_57%_31%)] sm:col-span-2">
                Attention : {[groupe.agences_interdites && "ce groupe interdit les agences", groupe.immobilier_interdit && "ce groupe interdit l’immobilier", groupe.statut === "a-eviter" && `groupe à éviter${groupe.statut_raison ? ` (${groupe.statut_raison})` : ""}`].filter(Boolean).join(", ")}.
              </p>
            )}
            {duplicate && <p className="m-0 rounded-md bg-warning p-3 text-[13px] text-warning-foreground sm:col-span-2">Ce bien a déjà été publié dans ce groupe il y a moins de 7 jours.</p>}
            <Field label="Date et heure (Casablanca)">
              <input type="datetime-local" value={toLocalInput(form.publie_le)} onChange={(e) => e.target.value && up("publie_le", fromLocalInput(e.target.value))} className={field.input} />
            </Field>
            <Field label="Langue">
              <SelectField label="Langue" value={form.langue} onChange={(v) => up("langue", v as PublicationInput["langue"])}>
                {Object.entries(LANGUES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </SelectField>
            </Field>
            <Field label="Statut">
              <SelectField label="Statut" value={form.statut} onChange={(v) => up("statut", v as PublicationInput["statut"])}>
                {Object.entries(PUB_STATUTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </SelectField>
            </Field>
            <Field label="Publié par">
              <SelectField label="Publié par" value={form.publie_par} onChange={(v) => up("publie_par", v as PublicationInput["publie_par"])}>
                {Object.entries(PUBLIE_PAR).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </SelectField>
            </Field>
            <Field label="Début du texte" className="sm:col-span-2">
              <textarea rows={3} value={form.texte_debut ?? ""} onChange={(e) => up("texte_debut", e.target.value)} className={cn(field.input, "h-auto py-2.5")} />
            </Field>
            <Field label="Nombre de photos">
              <input type="number" min={0} max={100} inputMode="numeric" value={form.nb_photos ?? ""} onChange={(e) => up("nb_photos", e.target.value === "" ? null : Number(e.target.value))} className={field.input} />
            </Field>
            <Field label="Lien de la publication (facultatif)">
              <input type="url" value={form.lien ?? ""} onChange={(e) => up("lien", e.target.value)} placeholder="https://facebook.com/groups/…" className={field.input} />
            </Field>
            <Field label="Remarque" className="sm:col-span-2">
              <textarea rows={2} value={form.remarque ?? ""} onChange={(e) => up("remarque", e.target.value)} className={cn(field.input, "h-auto py-2.5")} />
            </Field>
            {error && <p role="alert" className="m-0 text-sm font-medium text-destructive sm:col-span-2">{error}</p>}
          </div>
        </div>
        <Footer saving={save.isPending} onCancel={onClose} label={publication ? "Enregistrer" : "Ajouter la publication"} />
      </form>
    </FormSheet>
  );
}

// ─── Groupe ────────────────────────────────────────────────────────────────

const emptyGroupe: GroupeInput = {
  nom: "", lien: "", reseau: "facebook", membres: null, type: "immo", langue: "fr", regles: "",
  agences_interdites: false, immobilier_interdit: false, approbation_obligatoire: false, statut: "actif", statut_raison: "",
};

export function GroupeForm({ open, onClose, groupe }: { open: boolean; onClose: () => void; groupe: Groupe | null }) {
  const save = useSaveGroupe();
  const [form, setForm] = useState<GroupeInput>(emptyGroupe);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setForm(groupe ? pick(groupe, GROUPE_FIELDS) : emptyGroupe);
    setError(null);
  }, [open, groupe]);
  const up = <K extends keyof GroupeInput>(k: K, v: GroupeInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) return setError("Indiquez le nom du groupe.");
    const values = { ...form, nom: form.nom.trim(), lien: form.lien?.trim() || null, regles: form.regles?.trim() || null, statut_raison: form.statut_raison?.trim() || null };
    const ok = await save.mutateAsync({ id: groupe?.id, values }).then(() => true, () => false);
    if (ok) onClose();
  };

  return (
    <FormSheet open={open} onClose={onClose} title={groupe ? "Modifier le groupe" : "Nouveau groupe"} description="Nom, lien, membres, règles et statut du groupe.">
      <form onSubmit={submit} noValidate className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto px-4 pb-28 pt-4 lg:px-6">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Nom du groupe ou de la page" className="sm:col-span-2"><input value={form.nom} onChange={(e) => up("nom", e.target.value)} className={field.input} /></Field>
            <Field label="Lien" className="sm:col-span-2"><input type="url" value={form.lien ?? ""} onChange={(e) => up("lien", e.target.value)} placeholder="https://facebook.com/groups/…" className={field.input} /></Field>
            <Field label="Réseau">
              <SelectField label="Réseau" value={form.reseau} onChange={(v) => up("reseau", v as Reseau)}>{Object.entries(RESEAUX).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}</SelectField>
            </Field>
            <Field label="Nombre de membres"><input type="number" min={0} inputMode="numeric" value={form.membres ?? ""} onChange={(e) => up("membres", e.target.value === "" ? null : Number(e.target.value))} className={field.input} /></Field>
            <Field label="Type">
              <SelectField label="Type" value={form.type} onChange={(v) => up("type", v as GroupeInput["type"])}>{Object.entries(GROUPE_TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</SelectField>
            </Field>
            <Field label="Langue principale">
              <SelectField label="Langue" value={form.langue} onChange={(v) => up("langue", v as GroupeInput["langue"])}>{Object.entries(LANGUES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</SelectField>
            </Field>
            <div className="grid gap-2 sm:col-span-2">
              <Checkbox label="Approbation des admins obligatoire" checked={form.approbation_obligatoire} onChange={(v) => up("approbation_obligatoire", v)} />
              <Checkbox label="Agences interdites (« sans courtier »)" checked={form.agences_interdites} onChange={(v) => up("agences_interdites", v)} />
              <Checkbox label="Immobilier interdit" checked={form.immobilier_interdit} onChange={(v) => up("immobilier_interdit", v)} />
            </div>
            <Field label="Règles à retenir" className="sm:col-span-2"><textarea rows={3} value={form.regles ?? ""} onChange={(e) => up("regles", e.target.value)} className={cn(field.input, "h-auto py-2.5")} /></Field>
            <Field label="Statut">
              <SelectField label="Statut" value={form.statut} onChange={(v) => up("statut", v as GroupeInput["statut"])}>{Object.entries(GROUPE_STATUTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</SelectField>
            </Field>
            <Field label="Raison du statut"><input value={form.statut_raison ?? ""} onChange={(e) => up("statut_raison", e.target.value)} className={field.input} /></Field>
            {error && <p role="alert" className="m-0 text-sm font-medium text-destructive sm:col-span-2">{error}</p>}
          </div>
        </div>
        <Footer saving={save.isPending} onCancel={onClose} label={groupe ? "Enregistrer" : "Ajouter le groupe"} />
      </form>
    </FormSheet>
  );
}

// ─── Alerte de compte ──────────────────────────────────────────────────────

export function AlerteForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const save = useSaveAlerte();
  const [form, setForm] = useState({ survenue_le: new Date().toISOString(), reseau: "facebook" as Reseau, type: "avertissement" as AlerteType, compte: "", remarque: "" });
  useEffect(() => { if (open) setForm({ survenue_le: new Date().toISOString(), reseau: "facebook", type: "avertissement", compte: "", remarque: "" }); }, [open]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await save.mutateAsync({ ...form, compte: form.compte.trim() || null, remarque: form.remarque.trim() || null }).then(() => true, () => false);
    if (ok) onClose();
  };
  return (
    <FormSheet open={open} onClose={onClose} title="Nouvelle alerte de compte" description="Avertissement, vérification, blocage ou publication refusée par un réseau.">
      <form onSubmit={submit} noValidate className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto px-4 pb-28 pt-4 lg:px-6">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Date et heure (Casablanca)"><input type="datetime-local" value={toLocalInput(form.survenue_le)} onChange={(e) => e.target.value && setForm((f) => ({ ...f, survenue_le: fromLocalInput(e.target.value) }))} className={field.input} /></Field>
            <Field label="Réseau">
              <SelectField label="Réseau" value={form.reseau} onChange={(v) => setForm((f) => ({ ...f, reseau: v as Reseau }))}>{Object.entries(RESEAUX).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}</SelectField>
            </Field>
            <Field label="Type d’alerte">
              <SelectField label="Type" value={form.type} onChange={(v) => setForm((f) => ({ ...f, type: v as AlerteType }))}>{Object.entries(ALERTE_TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</SelectField>
            </Field>
            <Field label="Compte concerné"><input value={form.compte} onChange={(e) => setForm((f) => ({ ...f, compte: e.target.value }))} className={field.input} /></Field>
            <Field label="Remarque" className="sm:col-span-2"><textarea rows={3} value={form.remarque} onChange={(e) => setForm((f) => ({ ...f, remarque: e.target.value }))} className={cn(field.input, "h-auto py-2.5")} /></Field>
          </div>
        </div>
        <Footer saving={save.isPending} onCancel={onClose} label="Enregistrer l’alerte" />
      </form>
    </FormSheet>
  );
}
