import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import DOMPurify from "dompurify";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Code, X } from "lucide-react";
import type { Article } from "@/types/article";
import type { TablesInsert } from "@/integrations/supabase/types";
import { useCreateArticle, useUpdateArticle } from "@/hooks/useArticles";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { btn, field } from "@/components/admin/styles";
import { ARTICLE_CATEGORY_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

const articleSchema = z.object({
  title: z.string().trim().min(5, "Le titre doit faire au moins 5 caractères.").transform((v) => DOMPurify.sanitize(v)),
  slug: z.string().trim().min(3, "Indiquez l’adresse de l’article (ex. louer-a-marrakech).").regex(/^[a-z0-9-]+$/, "Lettres minuscules, chiffres et tirets uniquement.").transform((v) => DOMPurify.sanitize(v)),
  category: z.enum(["location-longue-duree", "sous-location", "vente", "terrain"]),
  lang: z.enum(["fr", "en", "es"]),
  translation_key: z.string().trim().regex(/^[a-z0-9-]*$/, "Lettres minuscules, chiffres et tirets uniquement.").optional(),
  content: z.string().min(20, "Le contenu est trop court (20 caractères minimum).").transform((v) => DOMPurify.sanitize(v)),
  excerpt: z.string().optional().transform((v) => (v ? DOMPurify.sanitize(v) : v)),
  image_url: z.string().url("Collez une adresse d’image complète (https://…).").optional().or(z.literal("")).transform((v) => (v ? DOMPurify.sanitize(v) : v)),
  meta_title: z.string().optional().transform((v) => (v ? DOMPurify.sanitize(v) : v)),
  meta_description: z.string().optional().transform((v) => (v ? DOMPurify.sanitize(v) : v)),
  est_publie: z.boolean().default(false),
});
type ArticleFormValues = z.infer<typeof articleSchema>;

const slugify = (title: string) => title.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function Counter({ value, max }: { value: number; max: number }) {
  return <span className={cn("text-xs font-semibold tabular-nums", value > max ? "text-destructive" : value > max * 0.9 ? "text-warning-foreground" : "text-muted-foreground")}>{value} / {max}</span>;
}

interface ArticleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article?: Article;
}

export function ArticleForm({ open, onOpenChange, article }: ArticleFormProps) {
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const isPending = createArticle.isPending || updateArticle.isPending;
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [jsonOpen, setJsonOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");

  const form = useForm<ArticleFormValues>({ resolver: zodResolver(articleSchema) });
  const { register, watch, setValue, formState: { errors, isDirty } } = form;
  const v = watch();

  useEffect(() => {
    if (!open) return;
    form.reset({
      title: article?.title || "", slug: article?.slug || "", category: article?.category || "vente", lang: article?.lang || "fr", translation_key: article?.translation_key || "", content: article?.content || "",
      excerpt: article?.excerpt || "", image_url: article?.image_url || "", meta_title: article?.meta_title || "",
      meta_description: article?.meta_description || "", est_publie: article?.est_publie || false,
    });
    setTab("write");
  }, [article, open, form]);

  const titleField = register("title");
  const onSubmit = async (data: ArticleFormValues) => {
    const payload: TablesInsert<"articles"> = {
      title: data.title, slug: data.slug, category: data.category, content: data.content,
      lang: data.lang, translation_key: data.translation_key || null,
      excerpt: data.excerpt || null, image_url: data.image_url || null, meta_title: data.meta_title || null,
      meta_description: data.meta_description || null, est_publie: data.est_publie ?? false,
    };
    if (article) await updateArticle.mutateAsync({ id: article.id, ...payload });
    else await createArticle.mutateAsync(payload);
    onOpenChange(false);
  };
  const submit = form.handleSubmit(onSubmit, () => { setTab("write"); toast.error("Certains champs sont à compléter."); });

  const handleJsonImport = () => {
    try {
      form.reset({ ...form.getValues(), ...JSON.parse(jsonInput) }, { keepDefaultValues: true });
      setJsonOpen(false);
      setJsonInput("");
      toast.success("Article rempli à partir du code.");
    } catch {
      toast.error("Ce code n’est pas un JSON valide. Vérifiez les accolades et les guillemets.");
    }
  };

  const requestClose = (next: boolean) => {
    if (!next && isDirty && !isPending && !window.confirm("Quitter sans enregistrer l’article ?")) return;
    onOpenChange(next);
  };

  const seoTitle = v.meta_title || v.title || "Titre de l’article";
  const seoDesc = v.meta_description || v.excerpt || "Ajoutez une description pour donner envie de cliquer depuis Google.";
  const site = typeof window !== "undefined" ? window.location.host : "liveinmarrakech.com";

  return (
    <Sheet open={open} onOpenChange={requestClose}>
      <SheetContent side="right" onOpenAutoFocus={(e) => e.preventDefault()} className="flex h-[100dvh] w-full max-w-none flex-col gap-0 border-border bg-background p-0 sm:max-w-none lg:w-[760px] [&>button]:hidden">
        <header className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-2 py-1.5 lg:px-6 lg:py-3.5">
          <button type="button" onClick={() => requestClose(false)} aria-label="Fermer" className="grid h-11 w-11 shrink-0 place-items-center rounded-md hover:bg-muted lg:order-last"><X size={22} aria-hidden="true" /></button>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <SheetTitle className="truncate font-serif text-[19px] font-semibold lg:text-[26px]">{article ? "Modifier l’article" : "Nouvel article"}</SheetTitle>
            <SheetDescription className={cn("m-0 text-xs font-medium", isDirty ? "text-warning-foreground" : "text-muted-foreground")}>{isDirty ? "Modifications non enregistrées" : v.est_publie ? "Publié sur le blog" : "Brouillon"}</SheetDescription>
          </div>
          <button type="button" onClick={() => setJsonOpen(true)} className={cn(btn.outline, "h-10 px-3 text-[13px]")}><Code size={16} aria-hidden="true" /><span className="hidden sm:inline">Importer un code JSON</span><span className="sm:hidden">JSON</span></button>
        </header>

        <form id="article-form" onSubmit={submit} noValidate className="min-h-0 flex-1 overflow-y-auto px-4 pb-32 pt-5 lg:px-6">
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-4 rounded-[10px] border border-border bg-card p-4">
              <label className="flex flex-col gap-1.5">
                <span className={field.label}>Titre</span>
                <input {...titleField} onChange={(e) => { void titleField.onChange(e); if (!article) setValue("slug", slugify(e.target.value), { shouldDirty: true }); }} placeholder="Ex. Louer à Marrakech : le guide des quartiers" className={cn(field.input, errors.title && "border-destructive")} />
                {errors.title && <span role="alert" className="text-xs font-medium text-destructive">{errors.title.message}</span>}
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={field.label}>Adresse de l’article</span>
                <span className={cn("flex h-11 overflow-hidden rounded-md border bg-white focus-within:border-primary", errors.slug ? "border-destructive" : "border-input")}>
                  <span className="hidden items-center border-r border-border bg-[hsl(38_45%_95%)] px-3 text-[13px] text-muted-foreground sm:flex">/blog/</span>
                  <input {...register("slug")} placeholder="louer-a-marrakech" className="min-w-0 flex-1 bg-transparent px-3 text-base outline-none lg:text-sm" />
                </span>
                {errors.slug ? <span role="alert" className="text-xs font-medium text-destructive">{errors.slug.message}</span> : <span className={field.help}>Créée automatiquement à partir du titre.</span>}
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className={field.label}>Catégorie</span>
                  <select {...register("category")} className={field.select}>
                    {Object.entries(ARTICLE_CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={field.label}>Langue de l’article</span>
                  <select {...register("lang")} className={field.select}>
                    <option value="fr">Français (/blog/…)</option>
                    <option value="en">Anglais (/en/blog/…)</option>
                    <option value="es">Espagnol (/es/blog/…)</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={field.label}>Code de traduction (facultatif)</span>
                  <input {...register("translation_key")} placeholder="acheter-au-maroc" className={cn(field.input, errors.translation_key && "border-destructive")} />
                  {errors.translation_key ? <span role="alert" className="text-xs font-medium text-destructive">{errors.translation_key.message}</span> : <span className={field.help}>Le même code sur les versions FR, EN et ES d’un article les relie entre elles pour Google.</span>}
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={field.label}>Image de couverture (adresse)</span>
                  <input {...register("image_url")} placeholder="https://…" className={cn(field.input, errors.image_url && "border-destructive")} />
                  {errors.image_url && <span role="alert" className="text-xs font-medium text-destructive">{errors.image_url.message}</span>}
                </label>
              </div>
              {v.image_url && !errors.image_url && <img src={v.image_url} alt="Aperçu de la couverture" className="aspect-[16/7] w-full rounded-md object-cover" />}
              <label className="flex flex-col gap-1.5">
                <span className={cn(field.label, "flex justify-between")}><span>Résumé</span><Counter value={(v.excerpt ?? "").length} max={200} /></span>
                <textarea rows={3} {...register("excerpt")} placeholder="Deux phrases affichées dans la liste du blog." className={cn(field.input, "h-auto py-2.5 leading-relaxed")} />
              </label>
            </section>

            <section className="flex flex-col gap-3 rounded-[10px] border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-serif text-[22px] font-semibold">Contenu</span>
                <div role="tablist" aria-label="Contenu" className="grid grid-cols-2 gap-1 rounded-lg bg-[hsl(38_33%_91%)] p-1">
                  {(["write", "preview"] as const).map((t) => (
                    <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("h-9 rounded-md px-3 text-[13px]", tab === t ? "bg-white font-semibold shadow-sm" : "font-medium")}>{t === "write" ? "Écrire" : "Aperçu"}</button>
                  ))}
                </div>
              </div>
              {tab === "write" ? (
                <>
                  <textarea rows={16} {...register("content")} placeholder={"## Un intertitre\n\nVotre texte… **gras**, *italique*, listes avec « - »."} className={cn(field.input, "h-auto py-2.5 font-mono text-sm leading-relaxed", errors.content && "border-destructive")} />
                  {errors.content ? <span role="alert" className="text-xs font-medium text-destructive">{errors.content.message}</span> : <span className={field.help}>Mise en forme Markdown : ## intertitre, **gras**, - liste, [lien](https://…).</span>}
                </>
              ) : (
                <article className="prose-sm min-h-[320px] max-w-none rounded-md border border-border bg-white p-4 text-[15px] leading-relaxed [&_a]:text-primary [&_a]:underline [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:font-serif [&_h3]:text-xl [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-3">
                  {v.content ? <ReactMarkdown>{v.content}</ReactMarkdown> : <p className="text-muted-foreground">Rien à afficher pour l’instant.</p>}
                </article>
              )}
            </section>

            <section className="flex flex-col gap-4 rounded-[10px] border border-border bg-card p-4">
              <span className="font-serif text-[22px] font-semibold">Référencement Google</span>
              <label className="flex flex-col gap-1.5">
                <span className={cn(field.label, "flex justify-between")}><span>Titre pour Google</span><Counter value={(v.meta_title ?? "").length} max={60} /></span>
                <input {...register("meta_title")} placeholder={v.title || "Reprend le titre si vide"} className={field.input} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={cn(field.label, "flex justify-between")}><span>Description pour Google</span><Counter value={(v.meta_description ?? "").length} max={160} /></span>
                <textarea rows={3} {...register("meta_description")} placeholder="Reprend le résumé si vide" className={cn(field.input, "h-auto py-2.5 leading-relaxed")} />
              </label>
              <div aria-label="Aperçu dans Google" className="flex flex-col gap-1 rounded-md border border-border bg-white p-4">
                <span className="text-xs text-[#4d5156]">{site} › blog › {v.slug || "adresse-de-l-article"}</span>
                <span className="line-clamp-1 font-sans text-lg leading-snug text-[#1a0dab]">{seoTitle.length > 60 ? `${seoTitle.slice(0, 57)}…` : seoTitle}</span>
                <span className="line-clamp-2 text-sm leading-snug text-[#4d5156]">{seoDesc.length > 160 ? `${seoDesc.slice(0, 157)}…` : seoDesc}</span>
              </div>
            </section>

            <label className="flex min-h-[64px] items-center justify-between gap-4 rounded-[10px] border border-border bg-card px-4">
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold">Publier l’article</span>
                <span className="text-[13px] text-muted-foreground">Visible immédiatement sur le blog du site.</span>
              </span>
              <Switch checked={!!v.est_publie} onCheckedChange={(c) => setValue("est_publie", c, { shouldDirty: true })} aria-label="Publier l’article" />
            </label>
          </div>
        </form>

        <footer className="absolute inset-x-0 bottom-0 flex gap-2 border-t border-border bg-card px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 lg:justify-end lg:px-6 lg:pb-3.5">
          <button type="button" onClick={() => requestClose(false)} disabled={isPending} className={cn(btn.outline, "h-12 flex-1 lg:h-11 lg:flex-none")}>Annuler</button>
          <button type="submit" form="article-form" disabled={isPending} className={cn(btn.primary, "h-12 flex-[2] lg:h-11 lg:flex-none lg:px-6")}>{isPending ? "Enregistrement…" : v.est_publie ? "Enregistrer et publier" : "Enregistrer le brouillon"}</button>
        </footer>
      </SheetContent>

      <Dialog open={jsonOpen} onOpenChange={setJsonOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-xl rounded-[10px] bg-card">
          <DialogHeader className="text-left">
            <DialogTitle className="font-serif text-[22px] font-semibold">Importer un code JSON</DialogTitle>
            <DialogDescription>Collez le code de l’article pour remplir les champs automatiquement.</DialogDescription>
          </DialogHeader>
          <textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} placeholder='{ "title": "…", "slug": "…", "category": "vente", "content": "…" }' className={cn(field.input, "h-auto min-h-[240px] py-2.5 font-mono text-xs")} />
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <button type="button" onClick={() => setJsonOpen(false)} className={btn.outline}>Annuler</button>
            <button type="button" onClick={handleJsonImport} className={btn.primary}>Remplir l’article</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
