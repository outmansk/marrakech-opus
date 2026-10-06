import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { visitStatus } from "@/lib/labels";

const CLOSED_LEADS = ["converti", "perdu"];

export function endOfToday() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end;
}

/** Compteurs de la navigation : visites en attente, relances clients et tâches d'agenda dues aujourd'hui. */
export function useAdminCounts() {
  return useQuery({
    queryKey: ["admin-counts"],
    refetchInterval: 60_000,
    queryFn: async () => {
      const [visits, leads, taches, messages] = await Promise.all([
        supabase.from("visit_requests").select("status"),
        supabase.from("client_leads").select("status, next_follow_up_at"),
        // L'agenda peut ne pas être encore activé : 0 dans ce cas.
        supabase.from("taches").select("echeance").eq("fait", false).not("echeance", "is", null),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("traite", false),
      ]);
      const pendingVisits = (visits.data ?? []).filter((v) => visitStatus(v.status) === "pending").length;
      const limit = endOfToday();
      const followUps = ((leads.data ?? []) as { status: string; next_follow_up_at: string | null }[])
        .filter((l) => l.next_follow_up_at && new Date(l.next_follow_up_at) <= limit && !CLOSED_LEADS.includes(l.status)).length;
      const tasksDue = ((taches.data ?? []) as { echeance: string }[]).filter((t) => new Date(t.echeance) <= limit).length;
      // Colonne « traite » absente tant que le SQL n'est pas lancé : 0 dans ce cas.
      const newMessages = messages.count ?? 0;
      return { pendingVisits, followUps, tasksDue, newMessages };
    },
  });
}
