import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SelectField } from "@/components/admin/ui";
import { btn, field } from "@/components/admin/styles";
import { useConcludeProperty } from "@/hooks/useBiens";
import { CLIENT_TYPES, NATIONALITES, isClientType, isNationalite, nationaliteLabel, profileText, type ClientType, type Nationalite } from "@/lib/dealProfile";
import { dealLine } from "@/lib/propertyDeals";
import { isSoldOnly } from "@/lib/propertyServices";
import type { Bien } from "@/types/property";
import { cn } from "@/lib/utils";

/** Mois en cours au format AAAA-MM (fuseau de Casablanca). */
function currentMonth() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Casablanca", year: "numeric", month: "2-digit" }).formatToParts(new Date());
  return `${parts.find((p) => p.type === "year")?.value}-${parts.find((p) => p.type === "month")?.value}`;
}

/** Prix affiché de l'annonce, proposé comme montant conclu. */
function listedAmount(bien: Bien) {
  return isSoldOnly(bien) ? bien.prix_vente : bien.prix_location_longue ?? bien.prix ?? bien.prix_location_courte;
}

/**
 * Fiche « Déjà loué / vendu » : le bien passe au statut vendu-loue et le site public affiche aussitôt
 * « Louée à un couple français en novembre 2026 · 12 000 MAD / mois » (badge, fiche, accueil).
 * Profil choisi dans des listes : aucun nom de client ne peut être saisi (loi 09-08).
 */
export function DealDialog({ bien, onClose }: { bien: Bien | null; onClose: () => void }) {
  const conclude = useConcludeProperty();
  const [client, setClient] = useState<ClientType | "">("");
  const [nationalite, setNationalite] = useState<Nationalite | "">("");
  const [montant, setMontant] = useState("");
  const [mois, setMois] = useState("");

  useEffect(() => {
    if (!bien) return;
    setClient(isClientType(bien.conclusion_client) ? bien.conclusion_client : "");
    setNationalite(isNationalite(bien.conclusion_nationalite) ? bien.conclusion_nationalite : "");
    setMontant(String(bien.conclusion_montant ?? listedAmount(bien) ?? ""));
    setMois(bien.conclusion_mois ?? currentMonth());
  }, [bien]);

  if (!bien) return null;
  const sold = isSoldOnly(bien);
  const amount = Number(montant.replace(/\s/g, "")) || null;
  const preview = dealLine(
    { ...bien, statut: "vendu-loue", conclusion_client: client || null, conclusion_nationalite: nationalite || null, conclusion_montant: amount, conclusion_mois: mois || null },
    "fr",
  ) ?? (sold ? "Vendu" : "Loué");

  const save = () => conclude.mutate(
    { id: bien.id, conclusion_client: client || null, conclusion_nationalite: client ? nationalite || null : null, conclusion_montant: amount, conclusion_mois: mois || null },
    { onSuccess: onClose },
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[480px] rounded-[10px] border-border bg-card">
        <DialogHeader className="text-left">
          <DialogTitle className="font-serif text-[22px] font-semibold">{sold ? "Bien vendu" : "Bien loué"}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            « {bien.titre} » passe en « Déjà loué / vendu » sur le site, avec ces informations. Jamais de nom de client : seulement le profil.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Client" value={client} onChange={(v) => setClient(v as ClientType | "")}>
              <option value="">Non précisé</option>
              {Object.entries(CLIENT_TYPES).map(([value, t]) => <option key={value} value={value}>{t.label}</option>)}
            </SelectField>
            <SelectField label="Nationalité" value={nationalite} onChange={(v) => setNationalite(v as Nationalite | "")}>
              <option value="">Non précisée</option>
              {(Object.keys(NATIONALITES) as Nationalite[]).map((code) => <option key={code} value={code}>{nationaliteLabel(code)}</option>)}
            </SelectField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5">
              <span className={field.label}>{sold ? "Prix de vente (MAD)" : "Loyer conclu (MAD / mois)"}</span>
              <input className={field.input} inputMode="numeric" value={montant} onChange={(e) => setMontant(e.target.value.replace(/[^\d\s]/g, ""))} />
            </label>
            <label className="grid gap-1.5">
              <span className={field.label}>Mois</span>
              <input type="month" className={field.input} value={mois} onChange={(e) => setMois(e.target.value)} />
            </label>
          </div>
          <p className={cn("flex items-start gap-2 rounded-md bg-primary-soft px-3 py-2.5 text-sm text-[hsl(72_19%_23%)]")}>
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span><span className="font-semibold">Sur le site :</span> {preview}{client ? ` (EN : ${profileText(client, nationalite || null, "en")})` : ""}</span>
          </p>
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <button type="button" className={btn.outline} onClick={onClose}>Annuler</button>
          <button type="button" className={btn.primary} onClick={save} disabled={conclude.isPending}>
            {conclude.isPending ? "Enregistrement…" : bien.statut === "vendu-loue" ? "Enregistrer" : sold ? "Marquer vendu" : "Marquer loué"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
