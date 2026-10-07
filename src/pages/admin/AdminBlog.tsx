import { useEffect, useMemo, useState } from "react";
import { localizePath } from "@/i18n/routing";
import { useSearchParams } from "react-router-dom";
import { FileText, Pencil, Plus, Search, X } from "lucide-react";
import { useArticles, useDeleteArticle, useToggleArticleStatus } from "@/hooks/useArticles";
import { ArticleForm } from "@/components/admin/ArticleForm";
import type { Article } from "@/types/article";
import OptimizedImage from "@/components/ui/OptimizedImage";
import StatusBadge from "@/components/admin/StatusBadge";
import { ActionMenu, Chips, ConfirmDialog, EmptyState, PageHeader, SelectField } from "@/components/admin/ui";
import { btn } from "@/components/admin/styles";
import { ARTICLE_CATEGORY_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "published" | "draft";

const dateFr = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
const categoryLabel = (c: string | null | undefined) => (c ? ARTICLE_CATEGORY_LABELS[c as keyof typeof ARTICLE_CATEGORY_LABELS] ?? c : "—");

function Cover({ article, className }: { article: Article; className: string }) {
  return (
    <span className={cn("block shrink-0 overflow-hidden bg-[hsl(38_30%_91%)]", className)}>
      {article.image_url ? <OptimizedImage src={article.image_url} alt="" size="thumb" className="h-full w-full object-cover" wrapperClassName="h-full w-full" /> : <FileText size={18} className="m-auto mt-[30%] text-muted-foreground" aria-hidden="true" />}
    </span>
  );
}

export default function AdminBlog() {
  const { data: articles = [], isLoading } = useArticles();
  const deleteArticle = useDeleteArticle();
  const toggleStatus = useToggleArticleStatus();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Article | undefined>(undefined);
  const [toDelete, setToDelete] = useState<Article | null>(null);

  const openNew = () => { setEditing(undefined); setSheetOpen(true); };
  const openEdit = (a: Article) => { setEditing(a); setSheetOpen(true); };

  // Liens directs : ?new=1 ou ?edit=<id>
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (searchParams.get("new") === "1") {
      openNew();
      setSearchParams({}, { replace: true });
    } else if (editId && !isLoading) {
      const a = articles.find((x) => x.id === editId);
      if (a) openEdit(a);
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isLoading, articles]);

  const visible = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase("fr");
    return articles.filter((a) =>
      (!needle || `${a.title} ${a.slug}`.toLocaleLowerCase("fr").includes(needle)) &&
      (category === "all" || a.category === category) &&
      (status === "all" || (status === "published" ? a.est_publie : !a.est_publie)));
  }, [articles, search, category, status]);

  const published = articles.filter((a) => a.est_publie).length;
  const menu = (a: Article) => [
    { label: "Voir sur le site", onSelect: () => undefined, href: localizePath(`/blog/${a.slug}`, a.lang ?? "fr") },
    { label: "Supprimer…", danger: true, onSelect: () => setToDelete(a) },
  ];
  const toggle = (a: Article) => toggleStatus.mutate({ id: a.id, est_publie: !a.est_publie });

  return (
    <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-4 py-4 lg:gap-5 lg:px-10 lg:py-8">
      <ArticleForm open={sheetOpen} onOpenChange={setSheetOpen} article={editing} />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Supprimer cet article ?"
        description={toDelete ? `« ${toDelete.title} » sera supprimé définitivement du blog.` : ""}
        onConfirm={() => toDelete && deleteArticle.mutate(toDelete.id)}
      />

      <PageHeader title="Blog" count={isLoading ? undefined : `${published} publiés · ${articles.length - published} brouillons`}>
        <button type="button" onClick={openNew} className={btn.primary}><Plus size={18} aria-hidden="true" />Nouvel article</button>
      </PageHeader>

      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25 lg:max-w-[420px]">
          <Search size={18} className="shrink-0 text-muted-foreground" aria-hidden="true" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un article…" aria-label="Rechercher un article" className="min-w-0 flex-1 bg-transparent text-base outline-none lg:text-sm" />
          {search && <button type="button" onClick={() => setSearch("")} aria-label="Effacer la recherche" className="grid h-8 w-8 place-items-center text-muted-foreground"><X size={16} aria-hidden="true" /></button>}
        </label>
        <SelectField label="Catégorie" value={category} onChange={setCategory} className="lg:w-[230px]">
          <option value="all">Toutes les catégories</option>
          {Object.entries(ARTICLE_CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </SelectField>
        <Chips<StatusFilter> label="Statut" value={status} onChange={setStatus} options={[{ value: "all", label: "Tous" }, { value: "published", label: "Publiés" }, { value: "draft", label: "Brouillons" }]} />
      </div>

      {isLoading && <div className="flex flex-col gap-3" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-24 rounded-[10px] border border-border bg-card" />)}</div>}
      {!isLoading && articles.length === 0 && <EmptyState title="Aucun article pour l’instant" text="Rédigez votre premier article : il restera en brouillon tant que vous ne le publiez pas." action={<button type="button" onClick={openNew} className={btn.primary}><Plus size={18} aria-hidden="true" />Nouvel article</button>} />}
      {!isLoading && articles.length > 0 && visible.length === 0 && <EmptyState title="Aucun article ne correspond" text="Essayez un autre mot ou retirez un filtre." />}

      {!isLoading && visible.length > 0 && (
        <>
          <ul className="m-0 flex list-none flex-col gap-3 p-0 lg:hidden">
            {visible.map((a) => (
              <li key={a.id} className="flex flex-col rounded-[10px] border border-border bg-card">
                <button type="button" onClick={() => openEdit(a)} className="flex gap-3 p-3 pb-2.5 text-left">
                  <Cover article={a} className="h-[72px] w-[72px] rounded-md" />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex items-center justify-between gap-2"><span className="truncate text-xs font-medium text-muted-foreground">{categoryLabel(a.category)}</span><StatusBadge tone={a.est_publie ? "success" : "warning"}>{a.est_publie ? "Publié" : "Brouillon"}</StatusBadge></span>
                    <span className="font-serif text-[17px] font-semibold leading-tight">{a.title}</span>
                    <span className="text-xs text-muted-foreground">{dateFr(a.created_at)}</span>
                  </span>
                </button>
                <div className="flex gap-2 px-3 pb-3">
                  <button type="button" onClick={() => openEdit(a)} className={cn(btn.soft, "flex-1 px-2")}><Pencil size={16} aria-hidden="true" />Modifier</button>
                  <button type="button" onClick={() => toggle(a)} className={cn(btn.outline, "flex-1 px-2")}>{a.est_publie ? "Dépublier" : "Publier"}</button>
                  <ActionMenu label={`Plus d’actions pour ${a.title}`} items={menu(a)} />
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-hidden rounded-[10px] border border-border bg-card lg:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-muted text-xs font-semibold tracking-[0.04em] text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-semibold">Article</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Catégorie</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Statut</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Date</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((a) => (
                  <tr key={a.id} className="border-b border-[hsl(37_32%_90%)] last:border-b-0 hover:bg-[hsl(40_60%_98%)]">
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => openEdit(a)} className="flex items-center gap-3 text-left">
                        <Cover article={a} className="h-12 w-16 rounded" />
                        <span className="flex flex-col gap-0.5"><span className="text-[15px] font-semibold hover:text-primary">{a.title}</span><span className="text-xs text-muted-foreground">{localizePath(`/blog/${a.slug}`, a.lang ?? "fr")}</span></span>
                      </button>
                    </td>
                    <td className="px-3 py-3 text-sm font-medium">{categoryLabel(a.category)}</td>
                    <td className="px-3 py-3"><StatusBadge tone={a.est_publie ? "success" : "warning"}>{a.est_publie ? "Publié" : "Brouillon"}</StatusBadge></td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-muted-foreground">{dateFr(a.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className="flex justify-end gap-1.5">
                        <button type="button" onClick={() => openEdit(a)} className={cn(btn.soft, "h-10 px-3 text-[13px]")}>Modifier</button>
                        <button type="button" onClick={() => toggle(a)} className={cn(btn.outline, "h-10 px-3 text-[13px]")}>{a.est_publie ? "Dépublier" : "Publier"}</button>
                        <ActionMenu label={`Plus d’actions pour ${a.title}`} items={menu(a)} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
