import { cn } from "@/lib/utils";
import type { StatusTone } from "@/lib/labels";

const TONES: Record<StatusTone, { chip: string; dot: string }> = {
  success: { chip: "bg-success text-success-foreground", dot: "bg-[hsl(100_32%_36%)]" },
  warning: { chip: "bg-warning text-warning-foreground", dot: "bg-[hsl(39_68%_45%)]" },
  closed: { chip: "bg-closed text-closed-foreground", dot: "bg-[hsl(2_17%_59%)]" },
};

/** Puce de statut : toujours un libellé lisible, jamais une valeur brute. */
export default function StatusBadge({ tone, children, className }: { tone: StatusTone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold", TONES[tone].chip, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", TONES[tone].dot)} aria-hidden="true" />
      {children}
    </span>
  );
}

/** Pastille compteur terracotta (éléments à traiter). */
export function CountBadge({ count, className }: { count: number; className?: string }) {
  if (!count) return null;
  return (
    <span className={cn("inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-accent px-1.5 text-xs font-semibold leading-none text-white", className)}>
      {count}
    </span>
  );
}
