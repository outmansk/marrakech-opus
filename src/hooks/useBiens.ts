import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Bien, BienInsert, BienUpdate } from '@/types/property';

const TABLE = 'properties_v2';
const QUERY_KEY = 'biens';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateReference(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `DP-${year}-${rand}`;
}

// ─── useProperties ─────────────────────────────────────────────────────────
export function useProperties(filters?: {
  type?: string;
  service?: string;
  statut?: string;
}) {
  return useQuery<Bien[]>({
    queryKey: [QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false });

      if (filters?.type) query = query.eq('type', filters.type);
      if (filters?.service) query = query.contains('services', [filters.service]);
      if (filters?.statut) query = query.eq('statut', filters.statut);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Bien[];
    },
  });
}

// ─── useProperty ───────────────────────────────────────────────────────────
export function useProperty(id: string | null) {
  return useQuery<Bien>({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase.from(TABLE).select('*').eq('id', id!).single();
      if (error) throw error;
      return data as Bien;
    },
    enabled: !!id,
  });
}

// ─── useCreateProperty ─────────────────────────────────────────────────────
export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BienInsert) => {
      const withRef = {
        ...payload,
        reference: payload.reference || generateReference(),
      };
      const { data, error } = await supabase.from(TABLE).insert(withRef).select().single();
      if (error) throw error;
      return data as Bien;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Bien créé avec succès !');
    },
    onError: (err: Error) => {
      toast.error(`Erreur : ${err.message}`);
    },
  });
}

// ─── useUpdateProperty ─────────────────────────────────────────────────────
export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: BienUpdate & { id: string }) => {
      const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data as Bien;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Bien mis à jour !');
    },
    onError: (err: Error) => {
      toast.error(`Erreur : ${err.message}`);
    },
  });
}

// ─── useDeleteProperty ─────────────────────────────────────────────────────
export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(TABLE).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Bien supprimé.');
    },
    onError: (err: Error) => {
      toast.error(`Erreur : ${err.message}`);
    },
  });
}

// ─── useToggleStatus ───────────────────────────────────────────────────────
export function useToggleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: string }) => {
      const newStatut = statut === 'publie' ? 'brouillon' : 'publie';
      const { data, error } = await supabase.from(TABLE).update({ statut: newStatut }).eq('id', id).select().single();
      if (error) throw error;
      return data as Bien;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      const label = data.statut === 'publie' ? 'publié' : 'dépublié';
      toast.success(`Bien ${label} avec succès.`);
    },
    onError: (err: Error) => {
      toast.error(`Erreur : ${err.message}`);
    },
  });
}
