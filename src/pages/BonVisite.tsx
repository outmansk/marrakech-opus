import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Download, Eraser, Loader2, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { whatsappHref } from "@/lib/contact";
import { AGENCY } from "@/content/agency";
import SignaturePad, { type SignaturePadHandle } from "@/components/bons/SignaturePad";
import {
  INDICATIFS,
  TYPE_BIEN_LABELS,
  bonReference,
  downloadBonPdf,
  formatBonDate,
  formatBonPrix,
  formatBonSigneLe,
  fullPhone,
  JETON_RE,
  signErrorMessage,
  validateBon,
  type BonChamp,
  type BonSaisie,
  type BonVisitePublic,
} from "@/lib/bonsVisite";

/* Page publique de signature, ouverte par le lien secret envoyé sur WhatsApp. Français uniquement. */

const input = "h-12 w-full rounded-md border bg-white px-3.5 text-base text-foreground outline-none transition-colors placeholder:text-[hsl(36_8%_55%)] focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/25";
const label = "text-sm font-semibold text-foreground";
const errorText = "flex items-start gap-1.5 text-sm font-medium text-destructive";
const primaryBtn = "inline-flex h-14 w-full items-center justify-center gap-2 rounded-md bg-accent px-5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[hsl(15_42%_38%)] disabled:opacity-60";
const outlineBtn = "inline-flex h-12 items-center justify-center gap-2 rounded-md border border-input bg-white px-4 text-[15px] font-semibold text-foreground transition-colors hover:bg-muted";

const EMPTY: BonSaisie = { nom: "", indicatif: "+212", telephone: "", email: "", confirme: false };

function draftKey(jeton: string) {
  return `bon-visite-${jeton.slice(0, 16)}`;
}
function readDraft(jeton: string): BonSaisie {
  try {
    const raw = sessionStorage.getItem(draftKey(jeton));
    if (raw) return { ...EMPTY, ...JSON.parse(raw), confirme: false };
  } catch {
    // Brouillon illisible : on repart d'un formulaire vide.
  }
  return EMPTY;
}

async function fetchBon(jeton: string) {
  const { data, error } = await supabase.rpc("bon_visite_public", { p_jeton: jeton });
  if (error) throw error;
  return ((data ?? []) as unknown as BonVisitePublic[])[0] ?? null;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100svh] bg-background text-foreground">
      <Helmet htmlAttributes={{ lang: "fr" }}>
        <title>Bon de visite – Live In Marrakech</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="referrer" content="no-referrer" />
      </Helmet>
      <main className="mx-auto flex w-full max-w-[560px] flex-col gap-6 px-4 pb-16 pt-8 sm:pt-12">{children}</main>
    </div>
  );
}

function Heading({ numero }: { numero?: number }) {
  return (
    <header className="flex flex-col gap-1.5 text-center">
      <h1 className="m-0 font-serif text-[34px] font-semibold leading-tight sm:text-[40px]">Bon de visite</h1>
      <p className="m-0 text-sm font-semibold uppercase tracking-[0.18em] text-accent">Live In Marrakech</p>
      {numero !== undefined && <p className="m-0 text-xs text-muted-foreground">N° {bonReference(numero)}</p>}
    </header>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-[10px] border border-border bg-card p-4 shadow-[0_1px_2px_rgba(33,31,27,0.05)] sm:p-5">
      <h2 className="m-0 font-serif text-[22px] font-semibold leading-tight">{title}</h2>
      {children}
    </section>
  );
}

function BienDetails({ bon }: { bon: BonVisitePublic }) {
  const rows: [string, string][] = [
    ["Type de bien", TYPE_BIEN_LABELS[bon.type_bien]],
    ["Bien", bon.bien],
    ["Résidence / quartier", bon.quartier],
    ["Date de la visite", formatBonDate(bon.date_visite)],
    ["Prix proposé", formatBonPrix(bon.prix, bon.prix_unite)],
  ];
  return (
    <dl className="m-0 grid gap-3">
      {rows.map(([k, v]) => (
        <div key={k} className="grid gap-0.5 border-b border-border pb-3 last:border-0 last:pb-0">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{k}</dt>
          <dd className="m-0 text-base font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function PdfButton({ bon }: { bon: BonVisitePublic }) {
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");
  const download = async () => {
    setState("busy");
    try {
      await downloadBonPdf(bon);
      setState("idle");
    } catch {
      setState("error");
    }
  };
  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={() => void download()} disabled={state === "busy"} className={primaryBtn}>
        {state === "busy" ? <Loader2 size={20} className="animate-spin" aria-hidden="true" /> : <Download size={20} aria-hidden="true" />}
        Télécharger une copie (PDF)
      </button>
      {state === "error" && <p role="alert" className={errorText}><AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />Le PDF n’a pas pu être créé. Réessayez.</p>}
    </div>
  );
}

function Done({ bon, justSigned }: { bon: BonVisitePublic; justSigned: boolean }) {
  return (
    <Shell>
      <Heading numero={bon.numero} />
      <section className="flex flex-col items-center gap-3 rounded-[10px] border border-[hsl(92_25%_80%)] bg-success p-6 text-center" role="status">
        <CheckCircle2 size={40} className="text-success-foreground" aria-hidden="true" />
        <p className="m-0 font-serif text-[24px] font-semibold leading-snug text-success-foreground">
          {justSigned ? "Votre bon de visite a bien été envoyé. Merci." : "Ce bon de visite a déjà été signé."}
        </p>
        {bon.signe_le && <p className="m-0 text-sm text-success-foreground">Signé par {bon.client_nom} le {formatBonSigneLe(bon.signe_le)} (heure de Marrakech).</p>}
      </section>
      <PdfButton bon={bon} />
      <Card title="Le bien visité"><BienDetails bon={bon} /></Card>
    </Shell>
  );
}

function Problem({ title, text }: { title: string; text: string }) {
  const href = whatsappHref(AGENCY.phone, "Bonjour, je n’arrive pas à ouvrir mon bon de visite.");
  return (
    <Shell>
      <Heading />
      <section role="alert" className="flex flex-col items-center gap-3 rounded-[10px] border border-border bg-card p-6 text-center">
        <AlertCircle size={36} className="text-accent" aria-hidden="true" />
        <p className="m-0 font-serif text-[22px] font-semibold">{title}</p>
        <p className="m-0 text-[15px] text-muted-foreground">{text}</p>
        {href && <a href={href} target="_blank" rel="noopener noreferrer" className={cn(outlineBtn, "mt-1")}><MessageCircle size={18} aria-hidden="true" />Contacter l’agence</a>}
      </section>
    </Shell>
  );
}

export default function BonVisite() {
  const { jeton = "" } = useParams();
  const queryClient = useQueryClient();
  const valid = JETON_RE.test(jeton);
  const { data: bon, isPending, isError, refetch } = useQuery({
    queryKey: ["bon-visite", jeton],
    queryFn: () => fetchBon(jeton),
    enabled: valid,
    retry: 1,
    staleTime: 0,
  });

  const [saisie, setSaisie] = useState<BonSaisie>(EMPTY);
  const [hasSignature, setHasSignature] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<BonChamp, string>>>({});
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  const [signed, setSigned] = useState<BonVisitePublic | null>(null);
  const padRef = useRef<SignaturePadHandle>(null);
  const ids = useId();
  const id = (name: string) => `${ids}-${name}`;

  // Brouillon (sans la signature) gardé si la page se recharge.
  useEffect(() => { if (valid) setSaisie(readDraft(jeton)); }, [jeton, valid]);
  useEffect(() => {
    if (!valid) return;
    try {
      const { nom, indicatif, telephone, email } = saisie;
      sessionStorage.setItem(draftKey(jeton), JSON.stringify({ nom, indicatif, telephone, email }));
    } catch {
      // Stockage indisponible (navigation privée) : sans conséquence.
    }
  }, [saisie, jeton, valid]);

  const set = <K extends keyof BonSaisie>(key: K, value: BonSaisie[K]) => {
    setSaisie((s) => ({ ...s, [key]: value }));
    setErrors((e) => ({ ...e, [key === "indicatif" ? "telephone" : key]: undefined }));
  };
  const onSignatureChange = useCallback((value: boolean) => {
    setHasSignature(value);
    if (value) setErrors((e) => ({ ...e, signature: undefined }));
  }, []);

  if (!valid) return <Problem title="Lien incomplet" text="Ce lien de bon de visite n’est pas complet. Ouvrez de nouveau le lien reçu sur WhatsApp, ou contactez l’agence." />;
  // isPending (et non isLoading) : une requête mise en pause, onglet en arrière-plan, reste « en chargement ».
  if (isPending) {
    return (
      <Shell>
        <Heading />
        <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground" aria-busy="true"><Loader2 size={20} className="animate-spin" aria-hidden="true" />Chargement du bon de visite…</div>
      </Shell>
    );
  }
  if (isError) {
    return (
      <Shell>
        <Heading />
        <section role="alert" className="flex flex-col items-center gap-3 rounded-[10px] border border-border bg-card p-6 text-center">
          <AlertCircle size={36} className="text-accent" aria-hidden="true" />
          <p className="m-0 text-[15px]">Le bon de visite n’a pas pu être chargé. Vérifiez votre connexion.</p>
          <button type="button" onClick={() => void refetch()} className={outlineBtn}>Réessayer</button>
        </section>
      </Shell>
    );
  }
  if (signed) return <Done bon={signed} justSigned />;
  if (!bon) return <Problem title="Bon de visite introuvable" text="Ce lien n’est pas valide ou le bon a été retiré par l’agence." />;
  if (bon.statut === "signe") return <Done bon={bon} justSigned={false} />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setFormError("");
    const found = validateBon(saisie, hasSignature);
    const signature = hasSignature ? padRef.current?.toDataURL() ?? null : null;
    if (hasSignature && !signature) found.signature = "Signez dans le cadre avant d’envoyer.";
    setErrors(found);
    const first = (["nom", "telephone", "email", "confirme", "signature"] as BonChamp[]).find((k) => found[k]);
    if (first) {
      document.getElementById(id(first))?.focus({ preventScroll: false });
      setFormError("Certaines informations sont à compléter.");
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.rpc("signer_bon_visite", {
        p_jeton: jeton,
        p_nom: saisie.nom.trim(),
        p_telephone: fullPhone(saisie.indicatif, saisie.telephone),
        p_email: saisie.email.trim() || null,
        p_signature: signature,
      });
      const row = ((data ?? []) as unknown as BonVisitePublic[])[0];
      if (error || !row || row.statut !== "signe") {
        const problem = signErrorMessage(error);
        if (problem.alreadySigned) { void queryClient.invalidateQueries({ queryKey: ["bon-visite", jeton] }); }
        if (problem.field) setErrors((x) => ({ ...x, [problem.field!]: problem.message }));
        setFormError(problem.message);
        return;
      }
      try { sessionStorage.removeItem(draftKey(jeton)); } catch { /* sans conséquence */ }
      queryClient.setQueryData(["bon-visite", jeton], row);
      setSigned(row);
      window.scrollTo(0, 0);
    } catch {
      setFormError(signErrorMessage(null).message);
    } finally {
      setSending(false);
    }
  };

  const fieldError = (name: BonChamp) => errors[name] && (
    <p id={id(`${name}-error`)} className={errorText}><AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />{errors[name]}</p>
  );
  const describe = (name: BonChamp, extra?: string) => [errors[name] ? id(`${name}-error`) : null, extra].filter(Boolean).join(" ") || undefined;
  const border = (name: BonChamp) => (errors[name] ? "border-destructive" : "border-input");

  return (
    <Shell>
      <Heading numero={bon.numero} />

      <form noValidate onSubmit={submit} className="flex flex-col gap-6">
        <Card title="Vos coordonnées">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={id("nom")} className={label}>Nom et prénom <span className="text-accent">*</span></label>
            <input id={id("nom")} type="text" autoComplete="name" required value={saisie.nom} onChange={(e) => set("nom", e.target.value)}
              aria-invalid={!!errors.nom} aria-describedby={describe("nom")} className={cn(input, border("nom"))} />
            {fieldError("nom")}
          </div>

          <fieldset className="m-0 flex flex-col gap-1.5 border-0 p-0">
            <legend className={cn(label, "mb-1.5 p-0")}>Téléphone / WhatsApp <span className="text-accent">*</span></legend>
            <div className="flex gap-2">
              <label htmlFor={id("indicatif")} className="sr-only">Indicatif du pays</label>
              <select id={id("indicatif")} value={saisie.indicatif} onChange={(e) => set("indicatif", e.target.value)}
                className={cn(input, "w-[112px] shrink-0 cursor-pointer px-2.5", border("telephone"))}>
                {INDICATIFS.map((i) => <option key={i.code} value={i.code}>{i.label}</option>)}
              </select>
              <label htmlFor={id("telephone")} className="sr-only">Numéro de téléphone</label>
              <input id={id("telephone")} type="tel" inputMode="tel" autoComplete="tel-national" required placeholder="6 12 34 56 78"
                value={saisie.telephone} onChange={(e) => set("telephone", e.target.value)}
                aria-invalid={!!errors.telephone} aria-describedby={describe("telephone")} className={cn(input, "min-w-0 flex-1", border("telephone"))} />
            </div>
            {fieldError("telephone")}
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={id("email")} className={label}>E-mail <span className="font-normal text-muted-foreground">(facultatif)</span></label>
            <input id={id("email")} type="email" inputMode="email" autoComplete="email" value={saisie.email} onChange={(e) => set("email", e.target.value)}
              aria-invalid={!!errors.email} aria-describedby={describe("email")} className={cn(input, border("email"))} />
            {fieldError("email")}
          </div>
        </Card>

        <Card title="Le bien visité">
          <BienDetails bon={bon} />
        </Card>

        <Card title="Confirmation">
          <div className="flex flex-col gap-3 rounded-md border-l-[3px] border-accent bg-background px-4 py-3 text-[15px] leading-relaxed">
            {bon.texte.split(/\n\s*\n/).map((p) => <p key={p} className="m-0">{p.trim()}</p>)}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={id("confirme")} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-md py-1">
              <input id={id("confirme")} type="checkbox" checked={saisie.confirme} onChange={(e) => set("confirme", e.target.checked)}
                aria-invalid={!!errors.confirme} aria-describedby={describe("confirme")}
                className="mt-0.5 h-6 w-6 shrink-0 cursor-pointer accent-[hsl(var(--accent))]" />
              <span className="text-[15px] font-medium leading-snug">{bon.texte_confirmation} <span className="text-accent">*</span></span>
            </label>
            {fieldError("confirme")}
          </div>
        </Card>

        <Card title="Votre signature">
          <p id={id("signature-help")} className="m-0 text-sm text-muted-foreground">Signez avec votre doigt dans le cadre ci-dessous (ou avec la souris sur ordinateur).</p>
          <div id={id("signature")} tabIndex={-1} className="outline-none">
            <SignaturePad ref={padRef} onChange={onSignatureChange} invalid={!!errors.signature} describedBy={describe("signature", id("signature-help"))} />
          </div>
          {fieldError("signature")}
          <button type="button" onClick={() => padRef.current?.clear()} className={cn(outlineBtn, "self-start")}>
            <Eraser size={18} aria-hidden="true" />Effacer et recommencer
          </button>
        </Card>

        <div className="flex flex-col gap-3">
          {formError && <p role="alert" className={cn(errorText, "rounded-md bg-[hsl(0_70%_97%)] p-3")}><AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />{formError}</p>}
          <button type="submit" disabled={sending} className={primaryBtn}>
            {sending && <Loader2 size={20} className="animate-spin" aria-hidden="true" />}
            {sending ? "Envoi en cours…" : "Signer et envoyer"}
          </button>
          <p className="m-0 text-center text-xs leading-relaxed text-muted-foreground">
            Vos coordonnées servent uniquement au suivi de cette visite par Live In Marrakech.{" "}
            <a href="/confidentialite" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Politique de confidentialité</a>
          </p>
        </div>
      </form>
    </Shell>
  );
}
