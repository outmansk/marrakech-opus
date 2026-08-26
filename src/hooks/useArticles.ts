import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Article } from '@/types/article';
import { toast } from 'sonner';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type ArticleInsert = TablesInsert<'articles'>;
type ArticleUpdate = TablesUpdate<'articles'>;

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Erreur inconnue';

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
    mutationFn: async (article: ArticleInsert) => {
      const { data, error } = await supabase
        .from('articles')
        .insert(article)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
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
    mutationFn: async ({ id, ...article }: ArticleUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('articles')
        .update(article)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
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
