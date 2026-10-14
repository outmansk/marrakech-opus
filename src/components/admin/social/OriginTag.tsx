import { Megaphone } from "lucide-react";
import { useSocialData } from "@/hooks/useSocial";
import { RESEAUX, pubRef, type Reseau } from "@/lib/social/model";

type Row = { origine_reseau?: string | null; origine_groupe_id?: string | null; origine_publication_id?: string | null; origine_ref?: string | null };

/** Petite étiquette « Venu de Facebook · Groupe · FB-12 » sur une visite, un message ou un client. */
export default function OriginTag({ row }: { row: Row }) {
  const { data } = useSocialData();
  if (!(row.origine_publication_id || row.origine_reseau || row.origine_ref)) return null;
  const pub = row.origine_publication_id ? data?.pubs.find((p) => p.id === row.origine_publication_id) : undefined;
  const groupe = data?.groupes.find((g) => g.id === (pub?.groupe_id ?? row.origine_groupe_id));
  const reseau = (pub?.reseau ?? row.origine_reseau) as Reseau | null | undefined;
  const label = [reseau ? `Venu de ${RESEAUX[reseau]?.label ?? reseau}` : "Venu des réseaux", groupe?.nom, pub ? pubRef(pub) : row.origine_ref].filter(Boolean).join(" · ");
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 self-start rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-[hsl(72_19%_23%)]">
      <Megaphone size={13} aria-hidden="true" /><span className="truncate">{label}</span>
    </span>
  );
}
