import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { btn, field } from "@/components/admin/styles";

/* Briques communes du back-office : tailles tactiles de 44 px, une seule icône par bouton. */

export function PageHeader({ title, count, children }: { title: string; count?: number | string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <h1 className="m-0 flex items-baseline gap-3 font-serif text-[30px] font-semibold leading-tight lg:text-[38px]">
        <span className="hidden lg:inline">{title}</span>
        {count !== undefined && <span className="font-sans text-[13px] font-medium text-muted-foreground lg:text-[15px]">{count}</span>}
      </h1>
      {children && <div className="flex flex-wrap gap-2.5">{children}</div>}
    </div>
  );
}

/** Menu « ⋯ » accessible au doigt (Popover Radix). */
export function ActionMenu({ label, items }: { label: string; items: { label: string; onSelect: () => void; danger?: boolean; href?: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" aria-label={label} className={btn.icon}>
          <MoreHorizontal size={18} aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60 rounded-[10px] border-border bg-white p-1.5 shadow-[0_16px_40px_-18px_rgba(33,31,27,0.4)]">
        <div role="menu" className="flex flex-col">
          {items.map((item, i) => {
            const cls = cn("flex min-h-11 w-full items-center rounded-md px-2.5 text-left text-sm hover:bg-muted", item.danger ? "font-semibold text-destructive" : "font-medium text-foreground");
            return (
              <div key={item.label}>
                {item.danger && i > 0 && <div className="mx-1.5 my-1 h-px bg-border" />}
                {item.href ? (
                  <a role="menuitem" href={item.href} target="_blank" rel="noopener noreferrer" className={cls} onClick={() => setOpen(false)}>{item.label}</a>
                ) : (
                  <button role="menuitem" type="button" className={cls} onClick={() => { setOpen(false); item.onSelect(); }}>{item.label}</button>
                )}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Dialogue de confirmation pour toute suppression. */
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "Supprimer", onConfirm }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; confirmLabel?: string; onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-[440px] rounded-[10px] border-border bg-card">
        <AlertDialogHeader className="text-left">
          <AlertDialogTitle className="font-serif text-[22px] font-semibold">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <AlertDialogCancel className={cn(btn.outline, "mt-0")}>Annuler</AlertDialogCancel>
          <AlertDialogAction className={btn.danger} onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2.5 rounded-[10px] border border-dashed border-input bg-card px-5 py-10 text-center">
      <p className="m-0 font-serif text-[22px] font-semibold leading-tight">{title}</p>
      <p className="m-0 max-w-sm text-sm leading-relaxed text-muted-foreground">{text}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ title, onRetry }: { title: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-[10px] border border-[hsl(11_47%_79%)] bg-[hsl(14_60%_95%)] p-4">
      <p className="m-0 text-[15px] font-semibold text-[hsl(9_57%_31%)]">{title}</p>
      <p className="m-0 text-sm text-[hsl(36_8%_21%)]">Vérifiez votre connexion internet, puis réessayez. Vos données ne sont pas perdues.</p>
      {onRetry && <button type="button" onClick={onRetry} className={cn(btn.outline, "self-start bg-white")}>Réessayer</button>}
    </div>
  );
}

/** Onglets / filtres en puces (un seul choix). */
export function Chips<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; count?: number }[]; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button key={o.value} type="button" aria-pressed={on} onClick={() => onChange(o.value)}
            className={cn("min-h-10 rounded-full border px-3.5 text-[13px] font-semibold transition-colors", on ? "border-foreground bg-foreground text-background" : "border-input bg-card text-foreground hover:bg-muted")}>
            {o.label}{o.count !== undefined && <span className="ml-1 font-medium opacity-75">{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function SelectField({ label, value, onChange, children, className }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("relative flex", className)}>
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={field.select}>{children}</select>
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="pointer-events-none absolute right-3 top-[14px] fill-none stroke-muted-foreground" strokeWidth={1.8} strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
    </span>
  );
}
