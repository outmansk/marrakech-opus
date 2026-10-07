import { queryOptions, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

function friendlyError(err: Error) {
  if (/fetch|network/i.test(err.message)) return "Connexion impossible. Vérifiez internet puis réessayez.";
  return `L’opération n’a pas abouti. Réessayez. (${err.message})`;
}

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
  queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
}

// ─── Query definitions (shared with the build-time pre-render) ─────────────
export type PropertyFilters = {
  type?: string;
  service?: string;
  statut?: string | string[];
  quartier?: string;
};

export const propertiesQueryOptions = (filters?: PropertyFilters) => queryOptions<Bien[]>({
  queryKey: [QUERY_KEY, filters],
  queryFn: async () => {
    let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false });

    if (filters?.type) query = query.eq('type', filters.type);
    if (filters?.service) query = query.contains('services', [filters.service]);
    if (Array.isArray(filters?.statut)) query = query.in('statut', filters.statut);
    else if (filters?.statut) query = query.eq('statut', filters.statut);
    if (filters?.quartier) query = query.eq('quartier', filters.quartier);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Bien[];
  },
});

export const propertyQueryOptions = (id: string | null) => queryOptions<Bien>({
  queryKey: [QUERY_KEY, id],
  queryFn: async () => {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id!).single();
    if (error) throw error;
    return data as Bien;
  },
  enabled: !!id,
});

// ─── useProperties ─────────────────────────────────────────────────────────
export function useProperties(filters?: PropertyFilters) {
  return useQuery(propertiesQueryOptions(filters));
}

// ─── useProperty ───────────────────────────────────────────────────────────
export function useProperty(id: string | null) {
  return useQuery(propertyQueryOptions(id));
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
      invalidateAll(queryClient);
      toast.success('Bien enregistré.');
    },
    onError: (err: Error) => {
      toast.error(friendlyError(err));
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
      invalidateAll(queryClient);
      toast.success('Modifications enregistrées.');
    },
    onError: (err: Error) => {
      toast.error(friendlyError(err));
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
      invalidateAll(queryClient);
      toast.success('Bien supprimé.');
    },
    onError: (err: Error) => {
      toast.error(friendlyError(err));
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
      invalidateAll(queryClient);
      const label = data.statut === 'publie' ? 'publié' : 'dépublié';
      toast.success(`Bien ${label}.`);
    },
    onError: (err: Error) => {
      toast.error(friendlyError(err));
    },
  });
}

// ─── useSetStatut ──────────────────────────────────────────────────────────
export function useSetStatut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: Bien['statut'] }) => {
      const { data, error } = await supabase.from(TABLE).update({ statut }).eq('id', id).select().single();
      if (error) throw error;
      return data as Bien;
    },
    onSuccess: (data) => {
      invalidateAll(queryClient);
      toast.success(data.statut === 'vendu-loue' ? 'Bien marqué « Déjà loué / vendu ».' : data.statut === 'publie' ? 'Bien publié.' : 'Bien passé en brouillon.');
    },
    onError: (err: Error) => {
      toast.error(friendlyError(err));
    },
  });
}
