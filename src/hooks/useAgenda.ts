import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Contact, Tache } from "@/lib/agenda";

const TACHES = ["admin-taches"];
const CONTACTS = ["admin-contacts"];

export type TacheInput = Omit<Tache, "id" | "created_at" | "updated_at" | "fait_le"> & { fait_le?: string | null };
export type ContactInput = Omit<Contact, "id" | "created_at" | "updated_at">;

export function useTaches() {
  return useQuery({
    queryKey: TACHES,
    queryFn: async () => {
      const { data, error } = await supabase.from("taches").select("*").order("echeance", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as Tache[];
    },
    retry: (count, error: { code?: string }) => error?.code !== "PGRST205" && count < 2,
  });
}

export function useContacts() {
  return useQuery({
    queryKey: CONTACTS,
    queryFn: async () => {
      const { data, error } = await supabase.from("contacts").select("*").order("nom", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Contact[];
    },
    retry: (count, error: { code?: string }) => error?.code !== "PGRST205" && count < 2,
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: TACHES });
    void queryClient.invalidateQueries({ queryKey: CONTACTS });
    void queryClient.invalidateQueries({ queryKey: ["admin-counts"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
  };
}

async function currentUserId() {
  return (await supabase.auth.getUser()).data.user?.id ?? null;
}

export function useSaveTache() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Partial<TacheInput> }) => {
      const query = id
        ? supabase.from("taches").update(values).eq("id", id)
        : supabase.from("taches").insert({ ...(values as TacheInput), created_by: await currentUserId() });
      const { data, error } = await query.select().single();
      if (error) throw error;
      return data as Tache;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteTache() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("taches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useSaveContact() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Partial<ContactInput> }) => {
      const query = id
        ? supabase.from("contacts").update(values).eq("id", id)
        : supabase.from("contacts").insert({ ...(values as ContactInput), created_by: await currentUserId() });
      const { data, error } = await query.select().single();
      if (error) throw error;
      return data as Contact;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteContact() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}
