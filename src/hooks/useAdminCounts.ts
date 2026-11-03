import { PENDING_ALERT_DAYS } from "@/lib/social/stats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/** Statuses of a visit request that are no longer « en attente » (see visitStatus in lib/labels). */
export const CLOSED_VISIT_STATUSES = "(confirmee,confirmed,annulee,cancelled)";
export const CLOSED_LEAD_STATUSES = "(converti,perdu)";

export function endOfToday() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Compteurs de la navigation : visites en attente, relances clients, tâches d'agenda dues aujourd'hui,
 * messages non traités, publications en attente. Rafraîchis toutes les minutes : uniquement des
 * comptages faits par la base (aucune ligne téléchargée).
 */
export function useAdminCounts() {
  return useQuery({
    queryKey: ["admin-counts"],
    refetchInterval: 60_000,
    queryFn: async () => {
      const end = endOfToday().toISOString();
      const head = { count: "exact" as const, head: true };
      const [visits, leads, taches, messages, social] = await Promise.all([
        supabase.from("visit_requests").select("id", head).not("status", "in", CLOSED_VISIT_STATUSES),
        supabase.from("client_leads").select("id", head).not("status", "in", CLOSED_LEAD_STATUSES).lte("next_follow_up_at", end),
        // L'agenda peut ne pas être encore activé : 0 dans ce cas.
        supabase.from("taches").select("id", head).eq("fait", false).lte("echeance", end),
        // Colonne « traite » absente tant que le SQL n'est pas lancé : 0 dans ce cas.
        supabase.from("contact_messages").select("id", head).eq("traite", false),
        // Réseaux sociaux : publications en attente depuis plus de 3 jours (0 tant que le SQL n'est pas lancé).
        supabase.from("social_publications").select("id", head).eq("statut", "en-attente")
          .lt("publie_le", new Date(Date.now() - PENDING_ALERT_DAYS * 24 * 3600 * 1000).toISOString()),
      ]);
      return {
        pendingVisits: visits.count ?? 0,
        followUps: leads.count ?? 0,
        tasksDue: taches.count ?? 0,
        newMessages: messages.count ?? 0,
        socialPending: social.count ?? 0,
      };
    },
  });
}
