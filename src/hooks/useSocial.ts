import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { isMissingTable } from "@/lib/agenda";
import { FILE_PROPERTIES } from "@/lib/fileProperties";
import type { AlerteCompte, Clic, Groupe, LeadOrigine, Publication, VisiteOrigine } from "@/lib/social/model";

// Données de la section « Réseaux sociaux » (admin). Tant que le SQL
// supabase/migrations/20261013_reseaux_sociaux.sql n'a pas été lancé, `missing` vaut true
// et les pages affichent comment l'activer, sans erreur.

export const SOCIAL_KEY = ["social"] as const;

/** Bien sélectionnable : ceux de la base et ceux encore décrits dans le code. */
export interface BienRef { id: string; titre: string; reference: string | null; statut: string; type: string; services: string[]; enBase: boolean }

const missingColumn = (error: { code?: string; message?: string } | null) => !!error && (error.code === "42703" || error.code === "PGRST204" || /column .* does not exist/i.test(error.message ?? ""));

export function useSocialData() {
  return useQuery({
    queryKey: SOCIAL_KEY,
    queryFn: async () => {
      const [groupes, pubs, clics, alertes, leads, visites, biens] = await Promise.all([
        supabase.from("social_groups").select("*").order("nom"),
        supabase.from("social_publications").select("*").order("publie_le", { ascending: false }),
        supabase.from("social_clicks").select("id, publication_id, created_at"),
        supabase.from("social_account_alerts").select("*").order("survenue_le", { ascending: false }),
        supabase.from("client_leads").select("id, name, status, bien_id, created_at, origine_reseau, origine_groupe_id, origine_publication_id, origine_ref"),
        supabase.from("visit_requests").select("id, property_v2_id, created_at, origine_reseau, origine_groupe_id, origine_publication_id, origine_ref"),
        supabase.from("properties_v2").select("id, titre, reference, statut, type, services").order("titre"),
      ]);
      const missing = isMissingTable(groupes.error) || isMissingTable(pubs.error);
      if (!missing) for (const r of [groupes, pubs, clics, alertes]) if (r.error) throw r.error;
      const dbBiens = ((biens.data ?? []) as Omit<BienRef, "enBase">[]).map((b) => ({ ...b, enBase: true }));
      const known = new Set(dbBiens.map((b) => b.id));
      const allBiens: BienRef[] = [
        ...dbBiens,
        ...FILE_PROPERTIES.filter((p) => !known.has(p.id)).map((p) => ({ id: p.id, titre: p.titre, reference: p.reference, statut: p.statut, type: p.type, services: p.services, enBase: false })),
      ].sort((a, b) => a.titre.localeCompare(b.titre, "fr"));
      return {
        missing,
        groupes: (groupes.data ?? []) as Groupe[],
        pubs: (pubs.data ?? []) as Publication[],
        clics: (clics.data ?? []) as Clic[],
        alertes: (alertes.data ?? []) as AlerteCompte[],
        // Colonnes d'origine absentes tant que le SQL n'est pas lancé : aucun client « venu des réseaux ».
        leads: (missingColumn(leads.error) ? [] : leads.data ?? []) as LeadOrigine[],
        visites: (missingColumn(visites.error) ? [] : visites.data ?? []) as VisiteOrigine[],
        biens: allBiens,
      };
    },
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => {
    for (const key of [SOCIAL_KEY, ["admin-counts"], ["admin-dashboard"]]) void queryClient.invalidateQueries({ queryKey: key });
  };
}

const errorText = (error: unknown) => (error instanceof Error ? error.message : (error as { message?: string })?.message ?? "erreur inconnue");

export type PublicationInput = Omit<Publication, "id" | "code" | "statut_change_le" | "created_at">;
export type GroupeInput = Omit<Groupe, "id" | "code" | "created_at">;

export function useSavePublication() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Partial<PublicationInput> }) => {
      const query = id ? supabase.from("social_publications").update(values).eq("id", id) : supabase.from("social_publications").insert(values);
      const { data, error } = await query.select().single();
      if (error) throw error;
      return data as Publication;
    },
    onSuccess: (_d, { id }) => { toast.success(id ? "Publication mise à jour" : "Publication ajoutée"); invalidate(); },
    onError: (error) => toast.error(`La publication n’a pas pu être enregistrée : ${errorText(error)}`),
  });
}

export function useSetPublicationStatus() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: Publication["statut"] }) => {
      const { error } = await supabase.from("social_publications").update({ statut }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (error) => toast.error(`Le statut n’a pas pu être changé : ${errorText(error)}`),
  });
}

export function useDeletePublication() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("social_publications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Publication supprimée"); invalidate(); },
    onError: (error) => toast.error(`Suppression impossible : ${errorText(error)}`),
  });
}

export function useSaveGroupe() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Partial<GroupeInput> }) => {
      const query = id ? supabase.from("social_groups").update(values).eq("id", id) : supabase.from("social_groups").insert(values as GroupeInput);
      const { data, error } = await query.select().single();
      if (error) throw error;
      return data as Groupe;
    },
    onSuccess: (_d, { id }) => { toast.success(id ? "Groupe mis à jour" : "Groupe ajouté"); invalidate(); },
    onError: (error) => toast.error(`Le groupe n’a pas pu être enregistré : ${errorText(error)}`),
  });
}

export function useDeleteGroupe() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("social_groups").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Groupe supprimé"); invalidate(); },
    onError: (error) => toast.error(`Suppression impossible : ${errorText(error)}`),
  });
}

export function useSaveAlerte() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (values: Omit<AlerteCompte, "id">) => {
      const { error } = await supabase.from("social_account_alerts").insert(values);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Alerte enregistrée"); invalidate(); },
    onError: (error) => toast.error(`L’alerte n’a pas pu être enregistrée : ${errorText(error)}`),
  });
}

export function useDeleteAlerte() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("social_account_alerts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (error) => toast.error(`Suppression impossible : ${errorText(error)}`),
  });
}

/** Clics et clients par publication. */
export function usePublicationCounts(clics: Clic[], leads: LeadOrigine[]) {
  return useMemo(() => {
    const clicks = new Map<string, number>();
    for (const c of clics) clicks.set(c.publication_id, (clicks.get(c.publication_id) ?? 0) + 1);
    const clients = new Map<string, number>();
    for (const l of leads) if (l.origine_publication_id) clients.set(l.origine_publication_id, (clients.get(l.origine_publication_id) ?? 0) + 1);
    return { clicks, clients };
  }, [clics, leads]);
}

