import { queryOptions, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Article } from '@/types/article';
import { toast } from 'sonner';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { DEFAULT_LANG, type Lang } from '@/i18n/routing';
import { withFileArticles } from '@/content/blog';

type ArticleInsert = TablesInsert<'articles'>;
type ArticleUpdate = TablesUpdate<'articles'>;

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Erreur inconnue';

// PostgREST answers PGRST204 when a column is unknown: the `lang` migration has not run yet.
const withoutLangColumns = <T extends Record<string, unknown>>({ lang: _lang, translation_key: _key, ...rest }: T) => rest;
async function saveArticle<T>(write: (row: ArticleInsert | ArticleUpdate) => PromiseLike<{ data: T; error: { code?: string } | null }>, row: ArticleInsert | ArticleUpdate) {
  let result = await write(row);
  if (result.error?.code === 'PGRST204') result = await write(withoutLangColumns(row) as ArticleInsert | ArticleUpdate);
  if (result.error) throw result.error;
  return result.data;
}

// ─── Public queries (shared with the build-time pre-render) ─────────────────

const withLang = (article: Article): Article => ({ ...article, lang: article.lang ?? DEFAULT_LANG });

/** Every published article: Supabase rows plus the Markdown files of src/content/blog. */
async function allPublishedArticles(): Promise<Article[]> {
  const { data, error } = await supabase.from('articles').select('*').eq('est_publie', true);
  if (error) throw error;
  return withFileArticles((data as Article[]).map(withLang), () => true);
}

export const publishedArticlesQueryOptions = (lang: Lang) => queryOptions<Article[]>({
  queryKey: ['articles', 'published', lang],
  queryFn: async () => (await allPublishedArticles()).filter((article) => article.lang === lang),
});

export interface ArticlePage {
  article: Article | null;
  /** Published versions of the same article in other languages. */
  translations: { lang: Lang; slug: string }[];
  similar: Article[];
}

export const articleQueryOptions = (slug: string | undefined) => queryOptions<ArticlePage>({
  queryKey: ['articles', 'slug', slug],
  enabled: !!slug,
  queryFn: async () => {
    const all = await allPublishedArticles();
    const article = all.find((candidate) => candidate.slug === slug) ?? null;
    if (!article) return { article: null, translations: [], similar: [] };

    const translations = article.translation_key
      ? all.filter((other) => other.translation_key === article.translation_key && other.slug !== article.slug)
          .map((other) => ({ lang: other.lang!, slug: other.slug }))
      : [];
    const sameLang = all.filter((other) => other.lang === article.lang && other.slug !== article.slug);
    const similar = [
      ...sameLang.filter((other) => other.category === article.category),
      ...sameLang.filter((other) => other.category !== article.category),
    ].slice(0, 3);

    return { article, translations, similar };
  },
});

export function useArticles() {
  return useQuery({
    queryKey: ['articles-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Article[];
    },
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (article: ArticleInsert) =>
      saveArticle((row) => supabase.from('articles').insert(row as ArticleInsert).select().single(), article),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles-admin'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Article créé avec succès');
    },
    onError: (error: unknown) => {
      toast.error('Erreur lors de la création : ' + getErrorMessage(error));
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...article }: ArticleUpdate & { id: string }) =>
      saveArticle((row) => supabase.from('articles').update(row).eq('id', id).select().single(), article),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles-admin'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Article mis à jour');
    },
    onError: (error: unknown) => {
      toast.error('Erreur lors de la mise à jour : ' + getErrorMessage(error));
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles-admin'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Article supprimé');
    },
    onError: (error: unknown) => {
      toast.error('Erreur lors de la suppression : ' + getErrorMessage(error));
    },
  });
}

export function useToggleArticleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, est_publie }: { id: string; est_publie: boolean }) => {
      const { error } = await supabase
        .from('articles')
        .update({ est_publie })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles-admin'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Statut mis à jour');
    },
  });
}
