import { useEffect, useMemo, useRef, useState } from "react";
import { suggestedTranslation } from "@/lib/propertyI18n";
import { propertyPath } from "@/lib/propertyUrl";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DOMPurify from "dompurify";
import { toast } from "sonner";
import { ArrowRight, Camera, Check, ChevronDown, ChevronUp, Code, Eye, GripVertical, ImagePlus, MapPin, Minus, Plus, Star, Trash2, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useCreateProperty, useUpdateProperty } from "@/hooks/useBiens";
import { BIEN_SERVICES, BIEN_TYPES, EQUIPEMENTS_LIST, QUARTIERS, type Bien, type BienInsert, type BienService } from "@/types/property";
import { SERVICE_LABELS, TYPE_LABELS, formatPrix } from "@/lib/labels";
import { btn, field as fieldCls } from "@/components/admin/styles";
import { cn } from "@/lib/utils";

// ─── Schéma ──────────────────────────────────────────────────────────────────
const clean = (v: string) => DOMPurify.sanitize(v);
const num = z.number().nullable().optional();

const bienSchema = z.object({
  titre: z.string().trim().min(1, "Indiquez le titre du bien.").transform(clean),
  reference: z.string().optional().transform((v) => (v ? clean(v) : v)),
  type: z.enum(["villa", "appartement", "riad", "maison", "terrain"]),
  services: z.array(z.enum(["location-longue-duree", "location-courte-duree", "vente", "sous-location"])).min(1, "Choisissez au moins un service."),
  statut: z.enum(["publie", "brouillon", "vendu-loue"]).default("brouillon"),
  prix_vente: num,
  prix_location_longue: num,
  prix_location_courte: num,
  prix: num,
  devise: z.enum(["MAD", "EUR"]).default("MAD"),
  surface_habitable: num,
  surface_terrain: num,
  chambres: z.number().int("Nombre entier uniquement.").nullable().optional(),
  salles_de_bain: z.number().int("Nombre entier uniquement.").nullable().optional(),
  disponible_le: z.string().nullable().optional(),
  quartier: z.string().nullable().optional().transform((v) => (v ? clean(v) : v)),
  latitude: num,
  longitude: num,
  description_courte: z.string().max(200, "200 caractères maximum.").nullable().optional().transform((v) => (v ? clean(v) : v)),
  description_longue: z.string().nullable().optional().transform((v) => (v ? clean(v) : v)),
  equipements: z.array(z.string().transform(clean)).default([]),
  photos: z.array(z.string().transform(clean)).default([]),
  photo_principale: z.string().nullable().optional().transform((v) => (v ? clean(v) : v)),
  proximites: z.array(z.object({
    place: z.string().trim().min(1, "Indiquez le lieu.").transform(clean),
    time: z.string().trim().min(1, "Indiquez le temps ou la distance.").transform(clean),
  })).default([]),
  meuble: z.boolean().nullable().optional(),
  titre_en: z.string().nullable().optional().transform((v) => (v ? clean(v) : v)),
  titre_es: z.string().nullable().optional().transform((v) => (v ? clean(v) : v)),
  description_courte_en: z.string().nullable().optional().transform((v) => (v ? clean(v) : v)),
  description_courte_es: z.string().nullable().optional().transform((v) => (v ? clean(v) : v)),
  description_longue_en: z.string().nullable().optional().transform((v) => (v ? clean(v) : v)),
  description_longue_es: z.string().nullable().optional().transform((v) => (v ? clean(v) : v)),
  traduction_a_relire: z.boolean().default(true),
});

type BienFormValues = z.infer<typeof bienSchema>;

const EMPTY: BienFormValues = {
  titre: "", reference: "", type: "villa", services: ["vente"], statut: "brouillon",
  prix_vente: null, prix_location_longue: null, prix_location_courte: null, prix: null, devise: "MAD",
  surface_habitable: null, surface_terrain: null, chambres: null, salles_de_bain: null, disponible_le: null,
  quartier: null, latitude: null, longitude: null, description_courte: null, description_longue: null,
  equipements: [], photos: [], photo_principale: null, proximites: [],
  meuble: null, titre_en: null, titre_es: null, description_courte_en: null, description_courte_es: null,
  description_longue_en: null, description_longue_es: null, traduction_a_relire: true,
};

/** Saved translation, or the proposed one from the repository (shown pre-filled, to review). */
function translationFields(bien: Bien) {
  const field = (lang: "en" | "es", key: "titre" | "description_courte" | "description_longue") =>
    bien[`${key}_${lang}`] || suggestedTranslation(bien.id, lang)?.[key] || null;
  return {
    titre_en: field("en", "titre"), titre_es: field("es", "titre"),
    description_courte_en: field("en", "description_courte"), description_courte_es: field("es", "description_courte"),
    description_longue_en: field("en", "description_longue"), description_longue_es: field("es", "description_longue"),
  };
}

function fromBien(bien: Bien): BienFormValues {
  return {
    titre: bien.titre ?? "", reference: bien.reference ?? "", type: bien.type ?? "villa", statut: bien.statut ?? "brouillon",
    services: bien.services?.length ? bien.services : bien.service ? [bien.service] : [],
    prix_vente: bien.prix_vente, prix_location_longue: bien.prix_location_longue, prix_location_courte: bien.prix_location_courte, prix: bien.prix,
    devise: bien.devise ?? "MAD", surface_habitable: bien.surface_habitable, surface_terrain: bien.surface_terrain,
    chambres: bien.chambres, salles_de_bain: bien.salles_de_bain, disponible_le: bien.disponible_le, quartier: bien.quartier,
    latitude: bien.latitude, longitude: bien.longitude, description_courte: bien.description_courte, description_longue: bien.description_longue,
    equipements: bien.equipements ?? [], photos: bien.photos ?? [], photo_principale: bien.photo_principale, proximites: bien.proximites ?? [],
    meuble: bien.meuble ?? null, ...translationFields(bien),
    // A proposed (not yet saved) translation is always "to review".
    traduction_a_relire: bien.traduction_a_relire ?? true,
  };
}

const STEPS = ["Infos générales", "Prix", "Caractéristiques", "Localisation", "Descriptions", "Équipements", "Proximités", "Photos"] as const;

/** Étape où se trouve chaque champ, pour y renvoyer en cas d'erreur. */
const FIELD_STEP: Partial<Record<keyof BienFormValues, number>> = {
  titre: 0, reference: 0, type: 0, services: 0, statut: 0,
  prix_vente: 1, prix_location_longue: 1, prix_location_courte: 1, prix: 1, devise: 1,
  surface_habitable: 2, surface_terrain: 2, chambres: 2, salles_de_bain: 2,
  quartier: 3, disponible_le: 3, latitude: 3, longitude: 3,
  description_courte: 4, description_longue: 4, titre_en: 4, titre_es: 4, description_courte_en: 4, description_courte_es: 4,
  description_longue_en: 4, description_longue_es: 4, meuble: 2, equipements: 5, proximites: 6, photos: 7, photo_principale: 7,
};

const PRICE_FIELDS: { service: BienService; name: "prix_vente" | "prix_location_longue" | "prix_location_courte" | "prix"; label: string; unit: string }[] = [
  { service: "vente", name: "prix_vente", label: "Prix de vente", unit: "" },
  { service: "location-longue-duree", name: "prix_location_longue", label: "Loyer mensuel", unit: " / mois" },
  { service: "location-courte-duree", name: "prix_location_courte", label: "Prix par nuit", unit: " / nuit" },
  { service: "sous-location", name: "prix", label: "Loyer de sous-location", unit: " / mois" },
];

const toNumber = (v: unknown) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(String(v).replace(/\s/g, "").replace(",", "."));
  return Number.isNaN(n) ? null : n;
};

// ─── Petits composants ─────────────────────────────────────────────────────────
function Label({ htmlFor, children, hint }: { htmlFor?: string; children: React.ReactNode; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn(fieldCls.label, "flex items-baseline justify-between gap-2")}>
      <span>{children}</span>{hint && <span className="text-xs font-medium text-muted-foreground">{hint}</span>}
    </label>
  );
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="m-0 text-xs font-medium text-destructive">{message}</p>;
}

function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-1 rounded-lg bg-[hsl(38_33%_91%)] p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.value)}
            className={cn("min-h-11 rounded-md px-2 text-[13px] leading-tight transition-colors", on ? "bg-white font-semibold text-foreground shadow-[0_1px_2px_rgba(33,31,27,0.08)]" : "font-medium text-[hsl(36_8%_21%)]")}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function ChipToggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      className={cn("inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors", on ? "border-primary bg-primary-soft text-[hsl(72_19%_23%)]" : "border-input bg-white text-foreground hover:bg-muted")}>
      {on && <Check size={15} strokeWidth={2.2} aria-hidden="true" />}{children}
    </button>
  );
}

function Stepper({ label, value, onChange }: { label: string; value: number | null | undefined; onChange: (v: number | null) => void }) {
  const v = value ?? 0;
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2">
      <span className="text-[15px] font-semibold">{label}</span>
      <span className="flex items-center gap-1.5">
        <button type="button" aria-label={`${label} : retirer un`} onClick={() => onChange(v > 0 ? v - 1 : null)} className={btn.icon}><Minus size={18} aria-hidden="true" /></button>
        <input aria-label={label} inputMode="numeric" value={value ?? ""} onChange={(e) => onChange(toNumber(e.target.value))} className="h-11 w-12 rounded-md border border-input bg-white text-center text-lg font-semibold outline-none focus-visible:border-primary" />
        <button type="button" aria-label={`${label} : ajouter un`} onClick={() => onChange(v + 1)} className={btn.icon}><Plus size={18} aria-hidden="true" /></button>
      </span>
    </div>
  );
}

function UnitInput({ id, value, onChange, unit, placeholder, invalid }: { id: string; value: number | null | undefined; onChange: (v: number | null) => void; unit: string; placeholder?: string; invalid?: boolean }) {
  return (
    <span className={cn("flex h-11 overflow-hidden rounded-md border bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25", invalid ? "border-destructive" : "border-input")}>
      <input id={id} inputMode="decimal" placeholder={placeholder} value={value ?? ""} onChange={(e) => onChange(toNumber(e.target.value))} className="min-w-0 flex-1 bg-transparent px-3 text-base outline-none lg:text-sm" />
      <span className="flex items-center whitespace-nowrap border-l border-border bg-[hsl(38_45%_95%)] px-3 text-[13px] font-semibold text-muted-foreground">{unit}</span>
    </span>
  );
}

// ─── Formulaire ────────────────────────────────────────────────────────────────
interface BienFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bien?: Bien | null;
}

export function BienForm({ open, onOpenChange, bien }: BienFormProps) {
  const isEditing = !!bien;
  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<BienFormValues>({ resolver: zodResolver(bienSchema), defaultValues: EMPTY });
  const { register, setValue, watch, formState: { errors, isDirty } } = form;
  const values = watch();

  const [step, setStep] = useState(0);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    form.reset(bien ? fromBien(bien) : EMPTY);
    setStep(0);
  }, [bien, open, form]);

  const set = <K extends keyof BienFormValues>(name: K, value: BienFormValues[K]) => setValue(name, value as never, { shouldDirty: true, shouldValidate: !!errors[name] });

  const done = useMemo(() => [
    !!values.titre && values.services?.length > 0,
    PRICE_FIELDS.some((p) => values.services?.includes(p.service) && values[p.name]),
    !!(values.surface_habitable || values.chambres || values.surface_terrain),
    !!values.quartier,
    !!values.description_courte,
    (values.equipements?.length ?? 0) > 0,
    (values.proximites?.length ?? 0) > 0,
    (values.photos?.length ?? 0) > 0,
  ], [values]);

  const goTo = (index: number) => {
    setStep(index);
    // Desktop : toutes les sections sont visibles, on fait défiler jusqu'à la bonne.
    if (window.matchMedia("(min-width: 1024px)").matches) sectionRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
    else scrollRef.current?.scrollTo({ top: 0 });
  };

  // ── Import JSON (conservé) ──
  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const current = form.getValues();
      const next = { ...current, ...parsed };
      next.photos = parsed.photos ?? current.photos;
      next.photo_principale = parsed.photo_principale ?? current.photo_principale;
      if (parsed.quartier) {
        const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
        next.quartier = QUARTIERS.find((q) => norm(q) === norm(parsed.quartier)) || parsed.quartier;
      }
      next.statut = (parsed.statut ?? current.statut ?? "brouillon").toLowerCase();
      next.type = (parsed.type ?? current.type ?? "villa").toLowerCase();
      next.devise = (parsed.devise ?? current.devise ?? "MAD").toUpperCase();
      form.reset(next, { keepDefaultValues: true });
      setJsonOpen(false);
      setJsonInput("");
      toast.success("Formulaire rempli à partir du code.");
    } catch {
      toast.error("Ce code n’est pas un JSON valide. Vérifiez les accolades et les guillemets.");
    }
  };

  // ── Photos ──
  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setUploadProgress(0);
    const list = Array.from(files);
    const photos = [...(form.getValues("photos") ?? [])];
    let failed = 0;
    for (const [i, file] of list.entries()) {
      try {
        const result = await uploadToCloudinary(file, (percent) => setUploadProgress(Math.round(((i + percent / 100) / list.length) * 100)));
        photos.push(result.public_id);
      } catch {
        failed++;
      }
    }
    set("photos", photos);
    if (!form.getValues("photo_principale") && photos.length) set("photo_principale", photos[0]);
    setUploading(false);
    if (failed) toast.error(`${failed} photo${failed > 1 ? "s n’ont" : " n’a"} pas pu être envoyée${failed > 1 ? "s" : ""}. Réessayez avec une image plus légère.`);
  };

  const photos = values.photos ?? [];
  const movePhoto = (from: number, to: number) => {
    if (to < 0 || to >= photos.length || from === to) return;
    const next = [...photos];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    set("photos", next);
  };
  const removePhoto = (url: string) => {
    const next = photos.filter((p) => p !== url);
    set("photos", next);
    if (values.photo_principale === url) set("photo_principale", next[0] ?? null);
  };

  // ── Proximités ──
  const proximites = values.proximites ?? [];
  const updateProx = (index: number, key: "place" | "time", value: string) => set("proximites", proximites.map((p, i) => (i === index ? { ...p, [key]: value } : p)));

  // ── Enregistrement ──
  const onSubmit = async (v: BienFormValues) => {
    const payload: BienInsert = {
      titre: v.titre, reference: v.reference || null, type: v.type, services: v.services, service: v.services[0], statut: v.statut,
      prix_vente: v.services.includes("vente") ? v.prix_vente ?? null : null,
      prix_location_longue: v.services.includes("location-longue-duree") ? v.prix_location_longue ?? null : null,
      prix_location_courte: v.services.includes("location-courte-duree") ? v.prix_location_courte ?? null : null,
      prix: v.services.includes("sous-location") ? v.prix ?? null : null,
      devise: v.devise, surface_habitable: v.surface_habitable ?? null, surface_terrain: v.surface_terrain ?? null,
      chambres: v.chambres ?? null, salles_de_bain: v.salles_de_bain ?? null, disponible_le: v.disponible_le || null,
      quartier: v.quartier || null, latitude: v.latitude ?? null, longitude: v.longitude ?? null,
      description_courte: v.description_courte || null, description_longue: v.description_longue || null,
      equipements: v.equipements, photos: v.photos, photo_principale: v.photo_principale ?? v.photos[0] ?? null,
      proximites: v.proximites.map(({ place, time }) => ({ place, time })),
      meuble: v.meuble ?? null,
      titre_en: v.titre_en || null, titre_es: v.titre_es || null,
      description_courte_en: v.description_courte_en || null, description_courte_es: v.description_courte_es || null,
      description_longue_en: v.description_longue_en || null, description_longue_es: v.description_longue_es || null,
      traduction_a_relire: v.traduction_a_relire,
    };
    if (isEditing && bien) await updateMutation.mutateAsync({ id: bien.id, ...payload });
    else await createMutation.mutateAsync(payload);
    onOpenChange(false);
  };
  const onInvalid = (errs: FieldErrors<BienFormValues>) => {
    const first = (Object.keys(errs) as (keyof BienFormValues)[]).map((k) => FIELD_STEP[k] ?? 0).sort((a, b) => a - b)[0] ?? 0;
    goTo(first);
    toast.error("Certains champs sont à compléter.");
  };
  const submit = form.handleSubmit(onSubmit, onInvalid);

  const requestClose = (next: boolean) => {
    if (!next && isDirty && !isPending && !window.confirm("Quitter sans enregistrer vos modifications ?")) return;
    onOpenChange(next);
  };

  const sectionCls = (i: number) => cn("scroll-mt-4 flex-col gap-5 lg:flex lg:rounded-[10px] lg:border lg:border-border lg:bg-card lg:p-5", step === i ? "flex" : "hidden");
  const sectionTitle = (i: number) => (
    <h3 className="m-0 hidden font-serif text-[22px] font-semibold leading-tight lg:block">{i + 1}. {STEPS[i]}</h3>
  );
  const isLast = step === STEPS.length - 1;

  return (
    <Sheet open={open} onOpenChange={requestClose}>
      <SheetContent side="right" onOpenAutoFocus={(e) => e.preventDefault()} className="flex h-[100dvh] w-full max-w-none flex-col gap-0 border-border bg-background p-0 sm:max-w-none lg:w-[800px] [&>button]:hidden">
        {/* En-tête */}
        <header className="flex shrink-0 items-center gap-1 border-b border-border bg-card px-2 py-1.5 lg:gap-3 lg:px-6 lg:py-4">
          <button type="button" onClick={() => requestClose(false)} aria-label="Fermer le formulaire" className="grid h-11 w-11 shrink-0 place-items-center rounded-md hover:bg-muted lg:order-last">
            <X size={22} aria-hidden="true" />
          </button>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <SheetTitle className="truncate font-serif text-[19px] font-semibold leading-tight lg:text-[28px]">{values.titre || (isEditing ? "Modifier le bien" : "Nouveau bien")}</SheetTitle>
            <SheetDescription className={cn("m-0 truncate text-xs font-medium", isDirty ? "text-warning-foreground" : "text-muted-foreground")}>
              {isDirty ? "Modifications non enregistrées" : isEditing ? `Référence ${bien?.reference ?? "—"}` : "La référence sera créée automatiquement"}
            </SheetDescription>
          </div>
          {!isEditing && (
            <button type="button" onClick={() => setJsonOpen(true)} className={cn(btn.outline, "hidden h-10 px-3 text-[13px] lg:inline-flex")}><Code size={16} aria-hidden="true" />Importer un code JSON</button>
          )}
          {isEditing && (
            <a href={propertyPath(bien!)} target="_blank" rel="noopener noreferrer" className={cn("inline-flex h-11 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold text-primary lg:border lg:border-input lg:bg-card lg:px-3.5 lg:text-foreground")}>
              <Eye size={18} aria-hidden="true" /><span className="lg:hidden">Aperçu</span><span className="hidden lg:inline">Aperçu comme sur le site</span>
            </a>
          )}
        </header>

        {/* Progression mobile */}
        <div className="flex shrink-0 flex-col gap-2.5 border-b border-border bg-card px-4 pb-4 pt-3 lg:hidden">
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] font-semibold text-primary">Étape {step + 1} sur {STEPS.length}</span>
            <span className="text-xs text-muted-foreground">{done.filter(Boolean).length} / {STEPS.length} complétées</span>
          </div>
          <div className="grid grid-cols-8 gap-1" aria-hidden="true">
            {STEPS.map((s, i) => <button key={s} type="button" tabIndex={-1} onClick={() => goTo(i)} className={cn("h-1.5 rounded-full", i === step ? "bg-accent" : done[i] ? "bg-primary" : "bg-border")} />)}
          </div>
          <h2 className="m-0 font-serif text-[26px] font-semibold leading-tight">{STEPS[step]}</h2>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Sommaire desktop */}
          <nav aria-label="Sections du formulaire" className="hidden w-[210px] shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-border p-3 lg:flex">
            <span className="px-2.5 pb-2 pt-1 text-xs font-semibold text-muted-foreground">{done.filter(Boolean).length} sections sur 8 complètes</span>
            {STEPS.map((s, i) => (
              <button key={s} type="button" onClick={() => goTo(i)} className={cn("flex min-h-10 items-center gap-2.5 rounded-md px-2.5 text-left text-[13px] leading-tight", step === i ? "bg-[hsl(72_17%_87%)] font-semibold" : "font-medium hover:bg-muted")}>
                <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold", done[i] ? "bg-primary text-white" : "bg-[hsl(38_33%_88%)] text-muted-foreground")}>{done[i] ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : i + 1}</span>
                {s}
              </button>
            ))}
            {!isEditing && <button type="button" onClick={() => setJsonOpen(true)} className="mt-3 flex min-h-10 items-center gap-2 rounded-md px-2.5 text-left text-[13px] font-medium text-muted-foreground hover:bg-muted"><Code size={15} aria-hidden="true" />Importer un code JSON</button>}
          </nav>

          <div ref={scrollRef} className="min-w-0 flex-1 overflow-y-auto overscroll-contain">
            <form id="bien-form" onSubmit={submit} noValidate className="flex flex-col gap-4 px-4 pb-32 pt-5 lg:px-6 lg:pb-28">
              {/* 1. Infos générales */}
              <section ref={(el) => (sectionRefs.current[0] = el)} className={sectionCls(0)} aria-label={STEPS[0]}>
                {sectionTitle(0)}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="titre">Titre du bien</Label>
                  <input id="titre" {...register("titre")} placeholder="Ex. Villa avec piscine à la Palmeraie" className={cn(fieldCls.input, errors.titre && "border-destructive")} />
                  <ErrorText message={errors.titre?.message} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reference" hint="générée automatiquement si vide">Référence</Label>
                  <input id="reference" {...register("reference")} placeholder="DP-26-XXXXX" className={cn(fieldCls.input, "bg-[hsl(38_45%_96%)]")} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Statut</Label>
                  <Segmented label="Statut" value={values.statut} onChange={(v) => set("statut", v)} options={[{ value: "publie", label: "Publié" }, { value: "brouillon", label: "Brouillon" }, { value: "vendu-loue", label: "Loué / vendu" }]} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Type de bien</Label>
                  <div className="flex flex-wrap gap-2">
                    {BIEN_TYPES.map((t) => <ChipToggle key={t} on={values.type === t} onClick={() => set("type", t)}>{TYPE_LABELS[t]}</ChipToggle>)}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label hint="plusieurs choix possibles">Services proposés</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {BIEN_SERVICES.map((s) => {
                      const on = values.services?.includes(s);
                      return (
                        <button key={s} type="button" aria-pressed={on} onClick={() => set("services", on ? values.services.filter((x) => x !== s) : [...(values.services ?? []), s])}
                          className={cn("flex min-h-[52px] items-center gap-3 rounded-lg border px-3.5 text-left text-[15px] font-medium", on ? "border-primary bg-primary-soft" : "border-input bg-white")}>
                          <span className={cn("grid h-[22px] w-[22px] shrink-0 place-items-center rounded border-[1.5px]", on ? "border-primary bg-primary text-white" : "border-input")}>{on && <Check size={14} strokeWidth={3} aria-hidden="true" />}</span>
                          {SERVICE_LABELS[s]}
                        </button>
                      );
                    })}
                  </div>
                  <ErrorText message={errors.services?.message} />
                </div>
              </section>

              {/* 2. Prix */}
              <section ref={(el) => (sectionRefs.current[1] = el)} className={sectionCls(1)} aria-label={STEPS[1]}>
                {sectionTitle(1)}
                <p className="m-0 text-sm leading-relaxed text-muted-foreground">Un prix par service coché. Laissez vide pour afficher « Prix sur demande » sur le site.</p>
                <div className="flex flex-col gap-2">
                  <Label>Devise</Label>
                  <Segmented label="Devise" value={values.devise} onChange={(v) => set("devise", v)} options={[{ value: "MAD", label: "MAD" }, { value: "EUR", label: "EUR" }]} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {PRICE_FIELDS.filter((p) => values.services?.includes(p.service)).map((p) => (
                    <div key={p.name} className="flex flex-col gap-1.5">
                      <Label htmlFor={p.name}>{p.label}</Label>
                      <UnitInput id={p.name} value={values[p.name]} onChange={(v) => set(p.name, v)} unit={`${values.devise}${p.unit}`} placeholder="Ex. 20 000" invalid={!!errors[p.name]} />
                      <span className={fieldCls.help}>Affiché : {formatPrix(values[p.name], values.devise, p.service)}</span>
                    </div>
                  ))}
                </div>
                {!values.services?.length && <p className="m-0 text-sm text-warning-foreground">Choisissez d’abord un service à l’étape 1.</p>}
              </section>

              {/* 3. Caractéristiques */}
              <section ref={(el) => (sectionRefs.current[2] = el)} className={sectionCls(2)} aria-label={STEPS[2]}>
                {sectionTitle(2)}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5"><Label htmlFor="surface_habitable">Surface habitable</Label><UnitInput id="surface_habitable" value={values.surface_habitable} onChange={(v) => set("surface_habitable", v)} unit="m²" placeholder="—" /></div>
                  <div className="flex flex-col gap-1.5"><Label htmlFor="surface_terrain">Terrain</Label><UnitInput id="surface_terrain" value={values.surface_terrain} onChange={(v) => set("surface_terrain", v)} unit="m²" placeholder="—" /></div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Stepper label="Chambres" value={values.chambres} onChange={(v) => set("chambres", v)} />
                  <Stepper label="Salles de bain" value={values.salles_de_bain} onChange={(v) => set("salles_de_bain", v)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Meublé ou vide</Label>
                  <Segmented
                    label="Meublé ou vide"
                    value={values.meuble === true ? "oui" : values.meuble === false ? "non" : "inconnu"}
                    onChange={(v) => set("meuble", v === "oui" ? true : v === "non" ? false : null)}
                    options={[{ value: "inconnu", label: "Non renseigné" }, { value: "oui", label: "Meublé" }, { value: "non", label: "Vide" }]}
                  />
                  <span className={fieldCls.help}>Sur le site : badge « Meublé » + caution 2 mois, ou « Vide » + caution 1 mois. Non renseigné : rien n’est affiché.</span>
                </div>
              </section>

              {/* 4. Localisation */}
              <section ref={(el) => (sectionRefs.current[3] = el)} className={sectionCls(3)} aria-label={STEPS[3]}>
                {sectionTitle(3)}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="quartier">Quartier</Label>
                    <span className="relative flex">
                      <select id="quartier" value={values.quartier ?? ""} onChange={(e) => set("quartier", e.target.value || null)} className={fieldCls.select}>
                        <option value="">Choisir un quartier…</option>
                        {QUARTIERS.map((q) => <option key={q} value={q}>{q === "Route de Fes" ? "Route de Fès" : q}</option>)}
                        {values.quartier && !QUARTIERS.includes(values.quartier) && <option value={values.quartier}>{values.quartier}</option>}
                      </select>
                      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-[14px] text-muted-foreground" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="disponible_le">Disponible le</Label>
                    <input id="disponible_le" type="date" value={values.disponible_le ?? ""} onChange={(e) => set("disponible_le", e.target.value || null)} className={fieldCls.input} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5"><Label htmlFor="latitude">Latitude</Label><input id="latitude" inputMode="decimal" placeholder="31,6287" value={values.latitude ?? ""} onChange={(e) => set("latitude", toNumber(e.target.value))} className={fieldCls.input} /></div>
                  <div className="flex flex-col gap-1.5"><Label htmlFor="longitude">Longitude</Label><input id="longitude" inputMode="decimal" placeholder="-7,9920" value={values.longitude ?? ""} onChange={(e) => set("longitude", toNumber(e.target.value))} className={fieldCls.input} /></div>
                </div>
                {values.latitude && values.longitude ? (
                  <a href={`https://www.google.com/maps?q=${values.latitude},${values.longitude}`} target="_blank" rel="noopener noreferrer" className={cn(btn.outline, "self-start")}><MapPin size={18} aria-hidden="true" />Vérifier sur la carte</a>
                ) : (
                  <p className="m-0 text-xs text-muted-foreground">Astuce : dans Google Maps, appuyez longuement sur le lieu pour copier ses coordonnées.</p>
                )}
              </section>

              {/* 5. Descriptions */}
              <section ref={(el) => (sectionRefs.current[4] = el)} className={sectionCls(4)} aria-label={STEPS[4]}>
                {sectionTitle(4)}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="description_courte" hint={`${(values.description_courte ?? "").length} / 200`}>Description courte</Label>
                  <textarea id="description_courte" rows={3} maxLength={220} {...register("description_courte")} placeholder="Une phrase qui donne envie : surface, atout principal, quartier." className={cn(fieldCls.input, "h-auto py-2.5 leading-relaxed", errors.description_courte && "border-destructive")} />
                  <ErrorText message={errors.description_courte?.message} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="description_longue">Description longue</Label>
                  <textarea id="description_longue" rows={8} {...register("description_longue")} placeholder="Pièces, prestations, environnement, conditions…" className={cn(fieldCls.input, "h-auto py-2.5 leading-relaxed")} />
                </div>

                {/* Traductions affichées sur /en et /es */}
                <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold">Traductions (anglais et espagnol)</span>
                    <span className={fieldCls.help}>Affichées sur les pages /en et /es. Sans titre traduit, la page de cette langue montre le français et n’apparaît pas sur Google.</span>
                  </div>
                  <label className="flex items-center gap-2.5 text-sm">
                    <input type="checkbox" className="h-5 w-5 accent-[hsl(70_19%_34%)]" {...register("traduction_a_relire")} />
                    Traduction à relire
                  </label>
                  {(["en", "es"] as const).map((lang) => (
                    <div key={lang} className="flex flex-col gap-3 border-t border-border pt-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{lang === "en" ? "Anglais" : "Espagnol"}</span>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`titre_${lang}`}>Titre</Label>
                        <input id={`titre_${lang}`} {...register(`titre_${lang}`)} className={fieldCls.input} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`description_courte_${lang}`}>Description courte</Label>
                        <textarea id={`description_courte_${lang}`} rows={3} {...register(`description_courte_${lang}`)} className={cn(fieldCls.input, "h-auto py-2.5 leading-relaxed")} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`description_longue_${lang}`}>Description longue</Label>
                        <textarea id={`description_longue_${lang}`} rows={6} {...register(`description_longue_${lang}`)} className={cn(fieldCls.input, "h-auto py-2.5 leading-relaxed")} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 6. Équipements */}
              <section ref={(el) => (sectionRefs.current[5] = el)} className={sectionCls(5)} aria-label={STEPS[5]}>
                {sectionTitle(5)}
                <div className="flex flex-wrap gap-2">
                  {EQUIPEMENTS_LIST.map((e) => {
                    const on = values.equipements?.includes(e);
                    return <ChipToggle key={e} on={!!on} onClick={() => set("equipements", on ? values.equipements.filter((x) => x !== e) : [...(values.equipements ?? []), e])}>{e}</ChipToggle>;
                  })}
                </div>
              </section>

              {/* 7. Proximités */}
              <section ref={(el) => (sectionRefs.current[6] = el)} className={sectionCls(6)} aria-label={STEPS[6]}>
                {sectionTitle(6)}
                {proximites.length === 0 && <p className="m-0 text-sm text-muted-foreground">Aucun lieu pour l’instant. Exemple : « Aéroport » — « 15 min ».</p>}
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {proximites.map((p, i) => (
                    <li key={i} className="grid grid-cols-[minmax(0,1fr)_110px_44px] gap-2 sm:grid-cols-[minmax(0,1fr)_150px_44px]">
                      <input aria-label={`Lieu ${i + 1}`} value={p.place} onChange={(e) => updateProx(i, "place", e.target.value)} placeholder="Lieu" className={cn(fieldCls.input, errors.proximites?.[i]?.place && "border-destructive")} />
                      <input aria-label={`Temps ou distance ${i + 1}`} value={p.time} onChange={(e) => updateProx(i, "time", e.target.value)} placeholder="15 min" className={cn(fieldCls.input, errors.proximites?.[i]?.time && "border-destructive")} />
                      <button type="button" onClick={() => set("proximites", proximites.filter((_, j) => j !== i))} aria-label={`Supprimer ${p.place || `le lieu ${i + 1}`}`} className={btn.iconDanger}><Trash2 size={17} aria-hidden="true" /></button>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => set("proximites", [...proximites, { place: "", time: "" }])} className={cn(btn.outline, "self-start border-dashed")}><Plus size={18} aria-hidden="true" />Ajouter un lieu</button>
              </section>

              {/* 8. Photos */}
              <section ref={(el) => (sectionRefs.current[7] = el)} className={sectionCls(7)} aria-label={STEPS[7]}>
                {sectionTitle(7)}
                <div className="grid grid-cols-2 gap-2">
                  <label className={cn("flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-dashed border-[hsl(35_20%_66%)] bg-card text-sm font-semibold text-[hsl(72_19%_23%)] lg:hidden", uploading && "pointer-events-none opacity-60")}>
                    <Camera size={24} strokeWidth={1.7} aria-hidden="true" />Prendre une photo
                    <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => { void handleFiles(e.target.files); e.target.value = ""; }} />
                  </label>
                  <label className={cn("col-span-1 flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-dashed border-[hsl(35_20%_66%)] bg-card text-sm font-semibold text-[hsl(72_19%_23%)] lg:col-span-2", uploading && "pointer-events-none opacity-60")}>
                    <ImagePlus size={24} strokeWidth={1.7} aria-hidden="true" /><span className="lg:hidden">Choisir dans la galerie</span><span className="hidden lg:inline">Importer des photos (plusieurs à la fois)</span>
                    <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { void handleFiles(e.target.files); e.target.value = ""; }} />
                  </label>
                </div>
                {uploading && (
                  <div className="flex flex-col gap-1.5" role="status">
                    <span className="flex justify-between text-xs font-semibold text-muted-foreground"><span>Envoi des photos…</span><span>{uploadProgress} %</span></span>
                    <span className="h-1.5 overflow-hidden rounded-full bg-border"><span className="block h-full rounded-full bg-primary transition-[width]" style={{ width: `${uploadProgress}%` }} /></span>
                  </div>
                )}
                {photos.length > 0 && <p className="m-0 text-[13px] text-muted-foreground">{photos.length} photo{photos.length > 1 ? "s" : ""} · la photo principale apparaît sur les cartes du site. Utilisez les flèches pour changer l’ordre{" "}<span className="hidden lg:inline">ou glissez les photos</span>.</p>}
                <ol className="m-0 grid list-none gap-2.5 p-0 lg:grid-cols-2">
                  {photos.map((url, i) => {
                    const main = values.photo_principale === url || (!values.photo_principale && i === 0);
                    return (
                      <li key={url} draggable onDragStart={() => setDragIndex(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragIndex !== null) movePhoto(dragIndex, i); setDragIndex(null); }} onDragEnd={() => setDragIndex(null)}
                        className={cn("flex overflow-hidden rounded-[10px] border bg-card", main ? "border-primary" : "border-border", dragIndex === i && "opacity-50")}>
                        <span className="hidden w-8 shrink-0 cursor-grab items-center justify-center border-r border-border bg-[hsl(38_45%_95%)] text-muted-foreground lg:flex" aria-hidden="true"><GripVertical size={16} /></span>
                        <span className="relative h-[100px] w-[116px] shrink-0">
                          <OptimizedImage src={url} alt={`Photo ${i + 1}`} size="thumb" className="h-full w-full object-cover" wrapperClassName="h-full w-full" />
                          {main && <span className="absolute left-1.5 top-1.5 rounded bg-foreground px-2 py-1 text-[11px] font-semibold text-background">Principale</span>}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-wrap content-center gap-1.5 p-2">
                          <button type="button" onClick={() => movePhoto(i, i - 1)} disabled={i === 0} aria-label={`Monter la photo ${i + 1}`} className={cn(btn.icon, "h-10 w-11 disabled:opacity-40")}><ChevronUp size={18} aria-hidden="true" /></button>
                          <button type="button" onClick={() => movePhoto(i, i + 1)} disabled={i === photos.length - 1} aria-label={`Descendre la photo ${i + 1}`} className={cn(btn.icon, "h-10 w-11 disabled:opacity-40")}><ChevronDown size={18} aria-hidden="true" /></button>
                          <button type="button" onClick={() => removePhoto(url)} aria-label={`Supprimer la photo ${i + 1}`} className={cn(btn.iconDanger, "h-10 w-11")}><Trash2 size={17} aria-hidden="true" /></button>
                          {!main && <button type="button" onClick={() => set("photo_principale", url)} className={cn(btn.soft, "h-10 px-2.5 text-xs")}><Star size={14} aria-hidden="true" />Mettre en principale</button>}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </section>
            </form>
          </div>
        </div>

        {/* Barre d'action collante */}
        <footer className="absolute inset-x-0 bottom-0 flex items-center gap-2 border-t border-border bg-card px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_-18px_rgba(33,31,27,0.3)] lg:left-[210px] lg:px-6 lg:pb-3.5">
          {/* Mobile */}
          <button type="button" onClick={() => goTo(Math.max(0, step - 1))} disabled={step === 0} className={cn(btn.outline, "h-12 px-4 text-[15px] disabled:opacity-40 lg:hidden")}>Précédent</button>
          {isLast ? (
            <button type="submit" form="bien-form" disabled={isPending || uploading} className={cn(btn.primary, "h-12 flex-1 text-[15px] lg:hidden")}>{isPending ? "Enregistrement…" : "Enregistrer"}</button>
          ) : (
            <>
              <button type="submit" form="bien-form" disabled={isPending || uploading} className={cn(btn.outline, "h-12 px-3 text-[15px] lg:hidden")}>{isPending ? "…" : "Enregistrer"}</button>
              <button type="button" onClick={() => goTo(step + 1)} className={cn(btn.primary, "h-12 flex-1 px-3 text-[15px] lg:hidden")}>Suivant<ArrowRight size={18} aria-hidden="true" /></button>
            </>
          )}
          {/* Desktop */}
          <span className={cn("hidden flex-1 items-center gap-2 text-[13px] font-medium lg:flex", isDirty ? "text-warning-foreground" : "text-muted-foreground")}>
            <span className={cn("h-2 w-2 rounded-full", isDirty ? "bg-[hsl(39_68%_45%)]" : "bg-[hsl(100_32%_36%)]")} aria-hidden="true" />
            {isDirty ? "Modifications non enregistrées" : "Tout est enregistré"}
          </span>
          <button type="button" onClick={() => requestClose(false)} disabled={isPending} className={cn(btn.outline, "hidden lg:inline-flex")}>Annuler</button>
          <button type="submit" form="bien-form" disabled={isPending || uploading} className={cn(btn.primary, "hidden px-6 lg:inline-flex")}>{isPending ? "Enregistrement…" : isEditing ? "Enregistrer" : "Créer le bien"}</button>
        </footer>
      </SheetContent>

      <Dialog open={jsonOpen} onOpenChange={setJsonOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-xl rounded-[10px] bg-card">
          <DialogHeader className="text-left">
            <DialogTitle className="font-serif text-[22px] font-semibold">Importer un code JSON</DialogTitle>
            <DialogDescription>Collez le code du bien pour remplir le formulaire. Vos photos déjà importées sont conservées si le code n’en contient pas.</DialogDescription>
          </DialogHeader>
          <textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} placeholder='{ "titre": "…", "type": "villa", "services": ["vente"], "prix_vente": 5000000 }' className={cn(fieldCls.input, "h-auto min-h-[240px] py-2.5 font-mono text-xs")} />
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <button type="button" onClick={() => setJsonOpen(false)} className={btn.outline}>Annuler</button>
            <button type="button" onClick={handleJsonImport} className={btn.primary}>Remplir le formulaire</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}

export default BienForm;
