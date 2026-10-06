import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { visitStatus } from "@/lib/labels";

const CLOSED_LEADS = ["converti", "perdu"];

export function endOfToday() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end;
}

/** Compteurs de la navigation : visites en attente et relances clients dues aujourd'hui. */
export function useAdminCounts() {
  return useQuery({
    queryKey: ["admin-counts"],
    refetchInterval: 60_000,
    queryFn: async () => {
      const [visits, leads] = await Promise.all([
        supabase.from("visit_requests").select("status"),
        supabase.from("client_leads").select("status, next_follow_up_at"),
      ]);
      const pendingVisits = (visits.data ?? []).filter((v) => visitStatus(v.status) === "pending").length;
      const limit = endOfToday();
      const followUps = ((leads.data ?? []) as { status: string; next_follow_up_at: string | null }[])
        .filter((l) => l.next_follow_up_at && new Date(l.next_follow_up_at) <= limit && !CLOSED_LEADS.includes(l.status)).length;
      return { pendingVisits, followUps };
    },
  });
}
