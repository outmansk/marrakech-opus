import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { VisitRequest } from "@/types/property";

export default function AdminVisites() {
  const [visits, setVisits] = useState<(VisitRequest & { properties?: { title: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    setLoading(true);
    // Supposing 'visit_requests' table has a relation to 'properties' or 'properties_v2'. 
    // Usually 'properties(title)' fetches the old table. We'll keep it as is.
    const { data } = await supabase
      .from("visit_requests")
      .select("*, properties(title)")
      .order("created_at", { ascending: false });
    
    if (data) setVisits(data as any);
    setLoading(false);
  };

  return (
    <main className="container mx-auto px-6 md:px-12 py-8 space-y-6 flex-1 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl">Demandes de visite</h2>
        <p className="text-sm text-muted-foreground">
          {loading ? "..." : `${visits.length} demande${visits.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="space-y-4">
        {loading && <p className="text-muted-foreground font-light py-12">Chargement...</p>}
        {visits.map((v) => (
          <div key={v.id} className="p-4 border border-border bg-card rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">{v.client_name}</p>
              <span className="text-xs tracking-widest uppercase px-3 py-1 bg-secondary text-muted-foreground rounded-full">
                {v.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-light">
              Bien : {(v as any).properties?.title || '—'}
            </p>
            <div className="text-sm text-muted-foreground font-light flex gap-4 mt-2">
              <span>Date souhaitée : {v.requested_date}</span>
              <span>Téléphone : {v.client_phone}</span>
            </div>
          </div>
        ))}
        {!loading && visits.length === 0 && (
          <p className="text-muted-foreground font-light text-center py-12">Aucune demande de visite enregistrée.</p>
        )}
      </div>
    </main>
  );
}
