/* Classes communes du back-office : zones tactiles de 44 px, une seule icône par bouton. */

export const btn = {
  primary: "inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-[hsl(70_19%_28%)] disabled:opacity-60",
  outline: "inline-flex h-11 items-center justify-center gap-2 rounded-md border border-input bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60",
  soft: "inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary-soft px-4 text-sm font-semibold text-[hsl(72_19%_23%)] transition-colors hover:bg-[hsl(72_20%_87%)]",
  whatsapp: "inline-flex h-11 items-center justify-center gap-2 rounded-md bg-whatsapp px-4 text-sm font-semibold text-white transition-colors hover:bg-[hsl(152_39%_25%)]",
  danger: "inline-flex h-11 items-center justify-center gap-2 rounded-md bg-destructive px-4 text-sm font-semibold text-white transition-colors hover:bg-[hsl(9_56%_33%)]",
  icon: "inline-grid h-11 w-11 shrink-0 place-items-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-muted",
  iconDanger: "inline-grid h-11 w-11 shrink-0 place-items-center rounded-md border border-[hsl(20_47%_85%)] bg-card text-destructive transition-colors hover:bg-[hsl(14_60%_95%)]",
};

export const field = {
  label: "text-[13px] font-semibold leading-tight text-foreground",
  input: "h-11 w-full rounded-md border border-input bg-white px-3 text-base text-foreground outline-none transition-colors placeholder:text-[hsl(36_8%_50%)] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 lg:text-sm",
  select: "h-11 w-full cursor-pointer appearance-none rounded-md border border-input bg-card pl-3 pr-9 text-[15px] font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/25 lg:text-sm",
  help: "text-xs leading-snug text-muted-foreground",
};
