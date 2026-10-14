import { NavLink } from "react-router-dom";
import { Check, Copy, Database, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { field } from "@/components/admin/styles";

export const SOCIAL_BASE = "/manage-xk92p/reseaux";

/** Sous-menu de la section : vue globale, journal, groupes. */
export function SocialNav() {
  const links = [
    { to: SOCIAL_BASE, label: "Vue globale", end: true },
    { to: `${SOCIAL_BASE}/journal`, label: "Journal des publications" },
    { to: `${SOCIAL_BASE}/groupes`, label: "Groupes" },
  ];
  return (
    <nav aria-label="Réseaux sociaux" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
      {links.map((l) => (
        <NavLink key={l.to} to={l.to} end={l.end}
          className={({ isActive }) => cn("flex min-h-10 shrink-0 items-center rounded-full border px-3.5 text-[13px] font-semibold transition-colors", isActive ? "border-foreground bg-foreground text-background" : "border-input bg-card hover:bg-muted")}>
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
}

/** Affiché tant que le SQL de la section n'a pas été lancé dans Supabase. */
export function SetupNotice() {
  return (
    <div role="status" className="flex flex-col gap-3 rounded-[10px] border border-[hsl(20_47%_85%)] bg-[hsl(20_70%_95%)] p-4 lg:p-5">
      <p className="m-0 flex items-center gap-2 text-[15px] font-semibold"><Database size={18} aria-hidden="true" />Section à activer</p>
      <p className="m-0 text-sm leading-relaxed text-[hsl(36_8%_21%)]">
        Les tables des réseaux sociaux n’existent pas encore. Ouvrez Supabase → SQL Editor, collez le contenu du fichier
        <code className="mx-1 rounded bg-card px-1.5 py-0.5 text-[13px]">supabase/migrations/20261013_reseaux_sociaux.sql</code>
        puis cliquez sur « Run ». Rechargez ensuite cette page : vos groupes et publications pourront être enregistrés.
      </p>
    </div>
  );
}

export function Field({ label, children, className, help }: { label: string; children: React.ReactNode; className?: string; help?: string }) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className={field.label}>{label}</span>
      {children}
      {help && <span className={field.help}>{help}</span>}
    </label>
  );
}

export function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md border border-input bg-card px-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-[18px] w-[18px] accent-[hsl(70_19%_34%)]" />
      {label}
    </label>
  );
}

/** Panneau latéral des formulaires, identique à celui des fiches clients. */
export function FormSheet({ open, onClose, title, description, children }: { open: boolean; onClose: () => void; title: string; description: string; children: React.ReactNode }) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" onOpenAutoFocus={(e) => e.preventDefault()} className="flex h-[100dvh] w-full max-w-none flex-col gap-0 border-border bg-background p-0 sm:max-w-none lg:w-[640px] [&>button]:hidden">
        <header className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-2 py-1.5 lg:px-5 lg:py-3">
          <button type="button" onClick={onClose} aria-label="Fermer" className="grid h-11 w-11 place-items-center rounded-md hover:bg-muted"><X size={22} aria-hidden="true" /></button>
          <SheetTitle className="flex-1 truncate font-sans text-[15px] font-semibold">{title}</SheetTitle>
          <SheetDescription className="sr-only">{description}</SheetDescription>
        </header>
        {children}
      </SheetContent>
    </Sheet>
  );
}

export function CopyLinkButton({ url, compact }: { url: string | null; compact?: boolean }) {
  const [done, setDone] = useState(false);
  if (!url) return null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setDone(true);
      toast.success("Lien suivi copié : collez-le dans la publication.");
      setTimeout(() => setDone(false), 2000);
    } catch {
      toast.error("Copie impossible : sélectionnez le lien à la main.");
    }
  };
  return (
    <button type="button" onClick={copy} title={url} aria-label="Copier le lien suivi"
      className={cn("inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-input bg-card text-sm font-semibold hover:bg-muted", compact ? "w-11" : "px-3.5")}>
      {done ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
      {!compact && "Copier le lien suivi"}
    </button>
  );
}

