import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Home, Pencil, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useDeleteProperty, useProperties, useSetStatut } from "@/hooks/useBiens";
import { BienForm } from "@/components/admin/BienForm";
import OptimizedImage from "@/components/ui/OptimizedImage";
import StatusBadge from "@/components/admin/StatusBadge";
import { ActionMenu, Chips, ConfirmDialog, EmptyState, ErrorState, PageHeader, SelectField } from "@/components/admin/ui";
import { btn } from "@/components/admin/styles";
import { BIEN_SERVICES, BIEN_TYPES, type Bien, type BienStatut } from "@/types/property";
import { SERVICE_LABELS, SERVICE_SHORT_LABELS, STATUT_LABELS, STATUT_TONE, TYPE_LABELS, mainPrice } from "@/lib/labels";
import { cn } from "@/lib/utils";

type StatutFilter = BienStatut | "all";

function shareText(bien: Bien) {
  return `${bien.titre} — ${mainPrice(bien)}\n${window.location.origin}/bien/${bien.id}`;
}

function Thumb({ bien, className }: { bien: Bien; className: string }) {
  const src = bien.photo_principale || bien.photos?.[0];
  return (
    <span className={cn("block shrink-0 overflow-hidden bg-[hsl(38_30%_91%)]", className)}>
      {src ? <OptimizedImage src={src} alt="" size="thumb" className="h-full w-full object-cover" wrapperClassName="h-full w-full" /> : <Home size={18} className="m-auto mt-[35%] text-muted-foreground" aria-hidden="true" />}
    </span>
  );
}

function useBienActions(onEdit: (bien: Bien) => void) {
  const setStatut = useSetStatut();
  const remove = useDeleteProperty();
  const [toDelete, setToDelete] = useState<Bien | null>(null);

  const toggleLabel = (bien: Bien) => (bien.statut === "publie" ? "Dépublier" : bien.statut === "vendu-loue" ? "Republier" : "Publier");
  const toggle = (bien: Bien) => setStatut.mutate({ id: bien.id, statut: bien.statut === "publie" ? "brouillon" : "publie" });
  const menu = (bien: Bien) => [
    bien.statut === "vendu-loue"
      ? { label: "Remettre en brouillon", onSelect: () => setStatut.mutate({ id: bien.id, statut: "brouillon" }) }
      : { label: "Marquer « Déjà loué / vendu »", onSelect: () => setStatut.mutate({ id: bien.id, statut: "vendu-loue" }) },
    { label: "Voir sur le site", onSelect: () => undefined, href: `/bien/${bien.id}` },
    { label: "Envoyer sur WhatsApp", onSelect: () => undefined, href: `https://wa.me/?text=${encodeURIComponent(shareText(bien))}` },
    { label: "Supprimer…", danger: true, onSelect: () => setToDelete(bien) },
  ];
  const dialog = (
    <ConfirmDialog
      open={!!toDelete}
      onOpenChange={(open) => !open && setToDelete(null)}
      title="Supprimer ce bien ?"
      description={toDelete ? `« ${toDelete.titre} » et ses photos seront supprimés définitivement. Cette action est irréversible.` : ""}
      onConfirm={() => toDelete && remove.mutate(toDelete.id)}
    />
  );
  return { toggleLabel, toggle, menu, dialog, onEdit, busy: setStatut.isPending };
}

export default function AdminBiens() {
  const { data: biens = [], isLoading, error, refetch } = useProperties();
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState<StatutFilter>("all");
  const [type, setType] = useState("all");
  const [service, setService] = useState("all");
  const [quartier, setQuartier] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedBien, setSelectedBien] = useState<Bien | null>(null);
  const handleAddNew = () => { setSelectedBien(null); setSheetOpen(true); };
  const handleEdit = (bien: Bien) => { setSelectedBien(bien); setSheetOpen(true); };
  const actions = useBienActions(handleEdit);

  // Liens directs depuis le tableau de bord ou le bouton « + » : ?new=1 ou ?edit=<id>
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (searchParams.get("new") === "1") {
      handleAddNew();
      setSearchParams({}, { replace: true });
    } else if (editId) {
      void supabase.from("properties_v2").select("*").eq("id", editId).single().then(({ data }) => {
        if (data) handleEdit(data as Bien);
        setSearchParams({}, { replace: true });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const quartiers = useMemo(() => [...new Set(biens.map((b) => b.quartier).filter(Boolean) as string[])].sort(), [biens]);
  const counts = useMemo(() => ({
    all: biens.length,
    publie: biens.filter((b) => b.statut === "publie").length,
    brouillon: biens.filter((b) => b.statut === "brouillon").length,
    "vendu-loue": biens.filter((b) => b.statut === "vendu-loue").length,
  }), [biens]);

  const visible = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase("fr");
    return biens.filter((b) =>
      (statut === "all" || b.statut === statut) &&
      (type === "all" || b.type === type) &&
      (service === "all" || (b.services ?? []).includes(service as Bien["services"][number])) &&
      (quartier === "all" || b.quartier === quartier) &&
      (!needle || [b.titre, b.reference, b.quartier].filter(Boolean).join(" ").toLocaleLowerCase("fr").includes(needle)));
  }, [biens, search, statut, type, service, quartier]);

  const extraFilters = [type, service, quartier].filter((v) => v !== "all").length;
  const clearAll = () => { setSearch(""); setStatut("all"); setType("all"); setService("all"); setQuartier("all"); };

  return (
    <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-4 py-4 lg:gap-5 lg:px-10 lg:py-8">
      <BienForm open={sheetOpen} onOpenChange={setSheetOpen} bien={selectedBien} />
      {actions.dialog}

      <PageHeader title="Biens" count={isLoading ? undefined : `${visible.length} sur ${biens.length}`}>
        <button type="button" onClick={handleAddNew} className={btn.primary}><Plus size={18} aria-hidden="true" />Ajouter un bien</button>
      </PageHeader>

      {/* Recherche et filtres */}
      <div className="flex flex-col gap-2.5">
        <div className="flex gap-2">
          <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25">
            <Search size={18} className="shrink-0 text-muted-foreground" aria-hidden="true" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Titre, référence ou quartier…" aria-label="Rechercher un bien" className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[hsl(36_8%_50%)] lg:text-sm" />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Effacer la recherche" className="grid h-8 w-8 place-items-center rounded text-muted-foreground"><X size={16} aria-hidden="true" /></button>}
          </label>
          <button type="button" onClick={() => setShowFilters((v) => !v)} aria-expanded={showFilters} className={cn(btn.outline, "px-3 lg:hidden")}>
            <SlidersHorizontal size={18} aria-hidden="true" />Filtres
            {extraFilters > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] text-white">{extraFilters}</span>}
          </button>
        </div>
        <div className={cn("grid-cols-1 gap-2 sm:grid-cols-3 lg:grid lg:max-w-[720px]", showFilters ? "grid" : "hidden")}>
          <SelectField label="Type de bien" value={type} onChange={setType}>
            <option value="all">Tous les types</option>
            {BIEN_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </SelectField>
          <SelectField label="Service" value={service} onChange={setService}>
            <option value="all">Tous les services</option>
            {BIEN_SERVICES.map((s) => <option key={s} value={s}>{SERVICE_LABELS[s]}</option>)}
          </SelectField>
          <SelectField label="Quartier" value={quartier} onChange={setQuartier}>
            <option value="all">Tous les quartiers</option>
            {quartiers.map((q) => <option key={q} value={q}>{q}</option>)}
          </SelectField>
        </div>
        <Chips<StatutFilter>
          label="Statut"
          value={statut}
          onChange={setStatut}
          options={[
            { value: "all", label: "Tous", count: counts.all },
            { value: "publie", label: "Publiés", count: counts.publie },
            { value: "brouillon", label: "Brouillons", count: counts.brouillon },
            { value: "vendu-loue", label: "Loués / vendus", count: counts["vendu-loue"] },
          ]}
        />
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Chargement des biens">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex gap-3 rounded-[10px] border border-border bg-card p-3">
              <span className="h-20 w-20 rounded-md bg-[hsl(38_30%_91%)]" />
              <span className="flex flex-1 flex-col gap-2 pt-1"><span className="h-2.5 w-1/3 rounded bg-[hsl(38_30%_91%)]" /><span className="h-4 w-4/5 rounded bg-[hsl(38_30%_89%)]" /><span className="h-2.5 w-1/2 rounded bg-[hsl(38_30%_91%)]" /></span>
            </div>
          ))}
        </div>
      )}
      {!isLoading && error && <ErrorState title="Impossible de charger les biens" onRetry={() => refetch()} />}
      {!isLoading && !error && biens.length === 0 && (
        <EmptyState title="Aucun bien pour l’instant" text="Ajoutez votre premier bien : il restera en brouillon tant que vous ne le publiez pas." action={<button type="button" onClick={handleAddNew} className={btn.primary}><Plus size={18} aria-hidden="true" />Ajouter un bien</button>} />
      )}
      {!isLoading && !error && biens.length > 0 && visible.length === 0 && (
        <EmptyState title="Aucun bien ne correspond" text="Essayez un autre mot ou retirez un filtre." action={<button type="button" onClick={clearAll} className={btn.outline}>Effacer la recherche et les filtres</button>} />
      )}

      {!isLoading && !error && visible.length > 0 && (
        <>
          {/* Mobile : cartes */}
          <ul className="m-0 flex list-none flex-col gap-3 p-0 lg:hidden">
            {visible.map((bien) => (
              <li key={bien.id} className="flex flex-col rounded-[10px] border border-border bg-card shadow-[0_1px_2px_rgba(33,31,27,0.05)]">
                <button type="button" onClick={() => handleEdit(bien)} className="flex gap-3 p-3 pb-2.5 text-left">
                  <Thumb bien={bien} className="h-[92px] w-[92px] rounded-md" />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-medium text-muted-foreground">{bien.reference || "Sans référence"}</span>
                      <StatusBadge tone={STATUT_TONE[bien.statut] ?? "warning"}>{bien.statut === "vendu-loue" ? "Loué / vendu" : STATUT_LABELS[bien.statut]}</StatusBadge>
                    </span>
                    <span className="font-serif text-lg font-semibold leading-tight">{bien.titre}</span>
                    <span className="text-[13px] font-medium text-muted-foreground">{TYPE_LABELS[bien.type] ?? bien.type} · {bien.quartier || "Marrakech"}</span>
                    <span className="text-sm font-semibold">{mainPrice(bien)}</span>
                  </span>
                </button>
                <div className="flex gap-2 px-3 pb-3">
                  <button type="button" onClick={() => handleEdit(bien)} className={cn(btn.soft, "flex-1 px-2")}><Pencil size={16} aria-hidden="true" />Modifier</button>
                  <button type="button" onClick={() => actions.toggle(bien)} disabled={actions.busy} className={cn(btn.outline, "flex-1 px-2")}>{actions.toggleLabel(bien)}</button>
                  <ActionMenu label={`Plus d’actions pour ${bien.titre}`} items={actions.menu(bien)} />
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop : tableau */}
          <div className="hidden overflow-hidden rounded-[10px] border border-border bg-card lg:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-muted text-xs font-semibold tracking-[0.04em] text-muted-foreground">
                  <th scope="col" className="w-[92px] px-4 py-3 font-semibold">Photo</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Référence</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Bien</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Type</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Services</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Prix</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Statut</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((bien) => (
                  <tr key={bien.id} className="border-b border-[hsl(37_32%_90%)] last:border-b-0 hover:bg-[hsl(40_60%_98%)]">
                    <td className="px-4 py-3"><Thumb bien={bien} className="h-[54px] w-[72px] rounded" /></td>
                    <td className="whitespace-nowrap px-3 py-3 text-[13px] font-medium text-muted-foreground">{bien.reference || "—"}</td>
                    <td className="max-w-[340px] px-3 py-3">
                      <button type="button" onClick={() => handleEdit(bien)} className="flex flex-col gap-1 text-left">
                        <span className="text-[15px] font-semibold leading-snug hover:text-primary">{bien.titre}</span>
                        <span className="text-[13px] text-muted-foreground">{bien.quartier || "Marrakech"}</span>
                      </button>
                    </td>
                    <td className="px-3 py-3 text-sm font-medium">{TYPE_LABELS[bien.type] ?? bien.type}</td>
                    <td className="px-3 py-3">
                      <span className="flex flex-wrap gap-1">
                        {(bien.services ?? []).map((s) => <span key={s} className="inline-flex h-6 items-center whitespace-nowrap rounded bg-[hsl(38_33%_92%)] px-2 text-xs font-semibold text-[hsl(36_8%_21%)]">{SERVICE_SHORT_LABELS[s] ?? s}</span>)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm font-semibold">{mainPrice(bien)}</td>
                    <td className="px-3 py-3"><StatusBadge tone={STATUT_TONE[bien.statut] ?? "warning"}>{bien.statut === "vendu-loue" ? "Loué / vendu" : STATUT_LABELS[bien.statut]}</StatusBadge></td>
                    <td className="px-4 py-3">
                      <span className="flex justify-end gap-1.5">
                        <button type="button" onClick={() => handleEdit(bien)} className={cn(btn.soft, "h-10 px-3 text-[13px]")}>Modifier</button>
                        <button type="button" onClick={() => actions.toggle(bien)} disabled={actions.busy} className={cn(btn.outline, "h-10 px-3 text-[13px]")}>{actions.toggleLabel(bien)}</button>
                        <ActionMenu label={`Plus d’actions pour ${bien.titre}`} items={actions.menu(bien)} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <p className="sr-only" aria-live="polite">{visible.length} bien{visible.length > 1 ? "s" : ""} affiché{visible.length > 1 ? "s" : ""}</p>
    </div>
  );
}
