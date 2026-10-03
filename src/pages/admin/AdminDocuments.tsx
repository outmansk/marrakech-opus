import { useMemo, useState } from "react";
import type React from "react";
import { FileText, Printer } from "lucide-react";
import { useProperties } from "@/hooks/useBiens";
import type { Bien } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Kind = "reservation" | "lease" | "receipt";
type Lang = "fr" | "ar" | "both";
type FormData = {
  date: string; propertyId: string; address: string; description: string; landlord: string; landlordProfession: string;
  landlordNationality: string; landlordBirth: string; landlordId: string; landlordAddress: string; agent: string;
  agentId: string; mandate: string; tenant: string; tenantProfession: string; tenantNationality: string;
  tenantBirth: string; tenantId: string; tenantAddress: string; otherTenant: string; otherTenantProfession: string;
  otherTenantNationality: string; otherTenantBirth: string; otherTenantId: string; otherTenantAddress: string; furnished: boolean;
  from: string; to: string; rent: string; depositMonths: string; advance: string; paymentDay: string;
  paymentMethod: string; bankDetails: string; charges: string; gardenPool: string; notice: string; residenceRules: string;
  reservationDate: string; cancelClient: string; cancelClientAr: string; cancelOwner: string; cancelOwnerAr: string; receiptNumber: string;
  receiptAmount: string; receiptRent: string; receiptCharges: string; receiptPurpose: string; receiptPeriod: string; agency: string; agencyAddress: string;
  agencyIds: string; agencyPhone: string; extra: string;
};

const initial: FormData = {
  date: new Date().toISOString().slice(0, 10), propertyId: "", address: "", description: "", landlord: "",
  landlordProfession: "", landlordNationality: "", landlordBirth: "", landlordId: "", landlordAddress: "",
  agent: "", agentId: "", mandate: "", tenant: "", tenantProfession: "", tenantNationality: "",
  tenantBirth: "", tenantId: "", tenantAddress: "", otherTenant: "", otherTenantProfession: "", otherTenantNationality: "",
  otherTenantBirth: "", otherTenantId: "", otherTenantAddress: "", furnished: true, from: "", to: "",
  rent: "", depositMonths: "2", advance: "", paymentDay: "5", paymentMethod: "Virement bancaire",
  bankDetails: "", charges: "", gardenPool: "", notice: "Deux mois, sous réserve des dispositions légales applicables.",
  residenceRules: "", reservationDate: "", cancelClient: "Remboursement de 50 % de l'acompte. Les 50 % restants sont conservés.",
  cancelClientAr: "يرجع 50٪ من التسبيق ويحتفظ بنسبة 50٪ المتبقية.",
  cancelOwner: "Remboursement de 100 % de l'acompte.", cancelOwnerAr: "يرجع التسبيق كاملا بنسبة 100٪.",
  receiptNumber: "", receiptAmount: "", receiptRent: "", receiptCharges: "", receiptPurpose: "Loyer",
  receiptPeriod: "", agency: "Live In Marrakech", agencyAddress: "", agencyIds: "", agencyPhone: "", extra: "",
};

const articleTitles = [
  ["Objet du contrat et description du bien loué", "موضوع العقد ووصف العقار المكترى"],
  ["Durée du bail", "مدة الكراء"],
  ["Montant du loyer et périodicité du paiement", "مبلغ الكراء ودورية الأداء"],
  ["Dépôt de garantie et sommes versées à la signature", "الضمان والمبالغ المؤداة عند التوقيع"],
  ["Eau, électricité et frais de résidence", "الماء والكهرباء ومصاريف الإقامة"],
  ["Jardin et piscine", "الحديقة والمسبح"],
  ["Conservation du bien, entretien et travaux", "المحافظة على العقار والصيانة والأشغال"],
  ["État des lieux, inventaire et remise des clés", "معاينة حالة العقار والجرد وتسليم المفاتيح"],
  ["Usage du bien et règlement de la résidence", "استعمال العقار ونظام الإقامة"],
  ["Fin du contrat et restitution du bien", "انتهاء العقد وإرجاع العقار"],
  ["Droit applicable, litiges et bonne foi", "القانون المطبق والنزاعات وحسن النية"],
] as const;

const clauses: Array<[string, string]> = [
  ["Le Bailleur donne en location au Locataire, qui accepte, le bien désigné ci-dessus. Il est loué {furnishing} et destiné exclusivement à l'habitation. Description et équipements remis : {description}.", "يؤجر المكري للمكتري، الذي يقبل، العقار المحدد أعلاه. العقار مكترى {furnishing} ومخصص للسكنى فقط. وصف العقار والتجهيزات المسلمة: {description}."],
  ["Le bail est conclu du {from} au {to}. Le renouvellement et la fin du bail restent soumis aux dispositions légales applicables.", "أبرم عقد الكراء من {from} إلى {to}. يخضع تجديد العقد وإنهاؤه للمقتضيات القانونية الجاري بها العمل."],
  ["Le loyer est fixé à {rent} dirhams par mois, payable d'avance au plus tard le {day} de chaque mois par {method}. {bank}", "حدد مبلغ الكراء في {rent} درهم شهريا، يؤدى مسبقا في أجل أقصاه اليوم {day} من كل شهر بواسطة {method}. {bank}"],
  ["Le dépôt de garantie est fixé à {deposit} dirhams. L'avance à la signature est de {advance} dirhams. Les sommes réellement reçues sont constatées par reçu. La restitution du dépôt et les retenues éventuelles suivent les dispositions légales et les justificatifs.", "حدد الضمان في {deposit} درهم والتسبيق عند التوقيع في {advance} درهم. تثبت المبالغ المقبوضة فعليا بوصل. يخضع إرجاع الضمان والاقتطاعات المحتملة للمقتضيات القانونية والوثائق المثبتة."],
  ["{charges}", "يتحمل المكتري استهلاكه الفردي من الماء والكهرباء والإنترنت. {charges}"],
  ["{garden}", "اتفق الطرفان بخصوص صيانة الحديقة والمسبح على ما يلي: {garden}"],
  ["Le Locataire conserve le bien et ses équipements en bon état d'usage et effectue l'entretien locatif courant. Toute transformation permanente ou intervention technique nécessite l'accord écrit préalable du Bailleur. Les anomalies sont signalées sans délai.", "يلتزم المكتري بالمحافظة على العقار وتجهيزاته في حالة استعمال جيدة وبأعمال الصيانة الكرائية الاعتيادية. يتطلب كل تغيير دائم أو تدخل تقني موافقة كتابية مسبقة من المكري. ويجب الإبلاغ عن الأعطاب دون تأخير."],
  ["Un état des lieux contradictoire, l'inventaire des équipements, les relevés des compteurs et le nombre de clés remis sont établis et signés à l'entrée et à la sortie. Ils sont annexés au bail.", "تنجز معاينة مشتركة لحالة العقار وجرد التجهيزات وقراءة العدادات وعدد المفاتيح المسلمة، وتوقع عند الدخول وعند الخروج، وتلحق بالعقد."],
  ["Le bien est destiné à l'habitation. Le Locataire respecte les règles de sécurité, la tranquillité du voisinage et le règlement communiqué : {rules}. Toute sous-location ou cession reste soumise à la loi et aux stipulations écrites du bail.", "العقار مخصص للسكنى. يلتزم المكتري باحترام قواعد السلامة وراحة الجيران ونظام الإقامة المبلغ إليه: {rules}. يخضع الكراء من الباطن أو التنازل للقانون وللشروط المكتوبة بالعقد."],
  ["À la fin régulière du bail, le Locataire restitue le bien, ses équipements et les clés, sous réserve de l'usure normale. Les loyers, charges et consommations sont régularisés sur justificatifs. Préavis indiqué dans ce modèle : {notice}", "عند انتهاء الكراء بصفة قانونية، يرجع المكتري العقار وتجهيزاته ومفاتيحه مع مراعاة الاستعمال العادي. تتم تسوية الكراء والمصاريف والاستهلاكات بالوثائق المثبتة. أجل الإشعار المذكور في هذا النموذج: {notice}"],
  ["Ce modèle se réfère au droit marocain applicable. Les parties s'engagent à agir de bonne foi et à rechercher une solution amiable, sans renoncer aux droits reconnus par la loi.", "يستند هذا النموذج إلى القانون المغربي الجاري به العمل. ويلتزم الطرفان بحسن النية والسعي إلى حل ودي، دون التنازل عن الحقوق التي يضمنها القانون."],
];

function fill(template: string, data: FormData) {
  const deposit = Number(data.rent || 0) * Number(data.depositMonths || 0);
  const values: Record<string, string> = {
    furnishing: data.furnished ? "meublé" : "vide et non meublé", description: data.description || "[à compléter]",
    from: data.from || "[date de début]", to: data.to || "[date de fin]", rent: data.rent || "[montant]",
    day: data.paymentDay || "[jour]", method: data.paymentMethod || "[mode de paiement]",
    bank: data.bankDetails ? `Coordonnées de paiement : ${data.bankDetails}` : "",
    deposit: deposit ? deposit.toLocaleString("fr-FR") : "[montant]", advance: data.advance || "[montant]",
    charges: data.charges || "Les parties précisent la répartition des consommations et frais locatifs.",
    garden: data.gardenPool || "Les parties précisent la répartition de l'entretien courant, le cas échéant.",
    rules: data.residenceRules || "[règlement de résidence]", notice: data.notice || "[à préciser]",
  };
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block space-y-1.5 ${className}`}><span className="text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}

export default function AdminDocuments() {
  const [kind, setKind] = useState<Kind>("reservation");
  const [language, setLanguage] = useState<Lang>("fr");
  const [data, setData] = useState<FormData>(initial);
  const { data: properties = [] } = useProperties();
  const property = useMemo(() => properties.find((item) => item.id === data.propertyId), [properties, data.propertyId]);
  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => setData((current) => ({ ...current, [key]: value }));
  const selectProperty = (id: string) => {
    const item = properties.find((candidate) => candidate.id === id);
    setData((current) => ({ ...current, propertyId: id, address: item ? [item.titre, item.quartier].filter(Boolean).join(", ") : current.address,
      description: item ? [item.description_longue || item.description_courte, item.chambres ? `${item.chambres} chambres` : "", item.salles_de_bain ? `${item.salles_de_bain} salles de bains` : "", item.equipements?.join(", ")].filter(Boolean).join(". ") : current.description,
      rent: item?.prix_location_longue ? String(item.prix_location_longue) : current.rent }));
  };
  const dateText = new Date(`${data.date}T12:00:00`).toLocaleDateString(language === "ar" ? "ar-MA" : "fr-FR");
  const propertyName = property?.titre || data.address || "[adresse du bien]";
  const rtl = language === "ar";
  const receiptTotal = data.receiptAmount || (Number(data.receiptRent || 0) + Number(data.receiptCharges || 0)).toString();
  const print = () => window.print();

  return <main className="container mx-auto w-full min-w-0 flex-1 space-y-5 px-3 py-4 sm:px-6 sm:py-6 md:px-10 md:py-8">
    <style>{`@media print { body * { visibility:hidden !important; } #generated-document, #generated-document * { visibility:visible !important; } #generated-document { position:absolute; inset:0; width:100%; padding:14mm !important; color:#111 !important; background:#fff !important; border:0 !important; box-shadow:none !important; font-family:Arial,sans-serif; } .no-print { display:none !important; } @page { size:A4; margin:0; } }`}</style>
    <div className="no-print flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><div className="mb-1 flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-bronze/10"><FileText className="h-4 w-4 text-[hsl(30_30%_45%)]" /></span><h2 className="font-serif text-xl sm:text-2xl md:text-3xl">Contrats & reçus</h2></div><p className="ml-[42px] text-sm font-light text-muted-foreground">Remplis les champs, vérifie l’aperçu, puis imprime ou enregistre en PDF.</p></div><Button onClick={print} className="min-h-11 w-full gap-2 sm:w-auto"><Printer size={16} /> Imprimer / Enregistrer PDF</Button></div>

    <div className="grid gap-6 xl:grid-cols-[minmax(330px,0.9fr)_minmax(460px,1.1fr)]">
      <section className="no-print admin-card min-w-0 space-y-4 rounded-xl p-3.5 sm:space-y-5 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2"><Field label="Document"><Select value={kind} onValueChange={(v) => setKind(v as Kind)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="reservation">Bon de réservation</SelectItem><SelectItem value="lease">Contrat de bail</SelectItem><SelectItem value="receipt">Reçu de paiement</SelectItem></SelectContent></Select></Field><Field label="Langue"><Select value={language} onValueChange={(v) => setLanguage(v as Lang)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="fr">Français</SelectItem><SelectItem value="ar">العربية</SelectItem><SelectItem value="both">Français + العربية</SelectItem></SelectContent></Select></Field></div>

        {(kind === "reservation" || kind === "receipt") && <section className="space-y-3 rounded-lg border p-4"><h3 className="text-sm font-medium">Coordonnées agence</h3><div className="grid gap-3 sm:grid-cols-2"><Field label="Nom affiché"><Input value={data.agency} onChange={(e) => update("agency", e.target.value)} /></Field><Field label="Téléphone"><Input value={data.agencyPhone} onChange={(e) => update("agencyPhone", e.target.value)} /></Field><Field label="Adresse"><Input value={data.agencyAddress} onChange={(e) => update("agencyAddress", e.target.value)} /></Field><Field label="RC / ICE"><Input value={data.agencyIds} onChange={(e) => update("agencyIds", e.target.value)} /></Field></div></section>}

        <section className="space-y-3 rounded-lg border p-4"><h3 className="text-sm font-medium">Parties et logement</h3><div className="grid gap-3 sm:grid-cols-2">
          <Field label="Bien du catalogue"><Select value={data.propertyId || "manual"} onValueChange={(v) => selectProperty(v === "manual" ? "" : v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="manual">Saisie manuelle</SelectItem>{properties.map((item) => <SelectItem key={item.id} value={item.id}>{item.titre}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Date du document"><Input type="date" value={data.date} onChange={(e) => update("date", e.target.value)} /></Field>
          <Field label="Adresse du bien"><Input value={data.address} onChange={(e) => update("address", e.target.value)} /></Field>
          <Field label="Propriétaire / bailleur"><Input value={data.landlord} onChange={(e) => update("landlord", e.target.value)} /></Field>
          <Field label="Profession du propriétaire"><Input value={data.landlordProfession} onChange={(e) => update("landlordProfession", e.target.value)} /></Field>
          <Field label="Nationalité / date et lieu de naissance"><Input value={data.landlordNationality} onChange={(e) => update("landlordNationality", e.target.value)} /></Field>
          <Field label="CIN / passeport du propriétaire"><Input value={data.landlordId} onChange={(e) => update("landlordId", e.target.value)} /></Field>
          <Field label="Adresse du propriétaire"><Input value={data.landlordAddress} onChange={(e) => update("landlordAddress", e.target.value)} /></Field>
          <Field label="Mandataire (si applicable)"><Input value={data.agent} onChange={(e) => update("agent", e.target.value)} /></Field>
          <Field label="CIN du mandataire"><Input value={data.agentId} onChange={(e) => update("agentId", e.target.value)} /></Field>
          <Field label="Référence de procuration"><Input value={data.mandate} onChange={(e) => update("mandate", e.target.value)} /></Field>
          <Field label="Client / locataire"><Input value={data.tenant} onChange={(e) => update("tenant", e.target.value)} /></Field>
          <Field label="Profession du client"><Input value={data.tenantProfession} onChange={(e) => update("tenantProfession", e.target.value)} /></Field>
          <Field label="Nationalité / date et lieu de naissance"><Input value={data.tenantNationality} onChange={(e) => update("tenantNationality", e.target.value)} /></Field>
          <Field label="CIN / passeport du client"><Input value={data.tenantId} onChange={(e) => update("tenantId", e.target.value)} /></Field>
          <Field label="Adresse du client"><Input value={data.tenantAddress} onChange={(e) => update("tenantAddress", e.target.value)} /></Field>
          {kind === "lease" && <><Field label="Deuxième locataire (facultatif)"><Input value={data.otherTenant} onChange={(e) => update("otherTenant", e.target.value)} /></Field><Field label="Profession du deuxième locataire"><Input value={data.otherTenantProfession} onChange={(e) => update("otherTenantProfession", e.target.value)} /></Field><Field label="Nationalité / naissance du deuxième locataire"><Input value={data.otherTenantNationality} onChange={(e) => update("otherTenantNationality", e.target.value)} placeholder="Nationalité · date et lieu" /></Field><Field label="CIN / passeport du deuxième locataire"><Input value={data.otherTenantId} onChange={(e) => update("otherTenantId", e.target.value)} /></Field><Field label="Adresse du deuxième locataire"><Input value={data.otherTenantAddress} onChange={(e) => update("otherTenantAddress", e.target.value)} /></Field><Field label="État du logement"><Select value={data.furnished ? "furnished" : "empty"} onValueChange={(v) => update("furnished", v === "furnished")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="furnished">Meublé</SelectItem><SelectItem value="empty">Vide / non meublé</SelectItem></SelectContent></Select></Field><Field label="Description et équipements" className="sm:col-span-2"><Textarea rows={3} value={data.description} onChange={(e) => update("description", e.target.value)} /></Field></>}
        </div></section>

        {kind === "lease" && <section className="space-y-3 rounded-lg border p-4"><h3 className="text-sm font-medium">Conditions du bail</h3><div className="grid gap-3 sm:grid-cols-2"><Field label="Début"><Input type="date" value={data.from} onChange={(e) => update("from", e.target.value)} /></Field><Field label="Fin"><Input type="date" value={data.to} onChange={(e) => update("to", e.target.value)} /></Field><Field label="Loyer mensuel (DH)"><Input type="number" min="0" value={data.rent} onChange={(e) => update("rent", e.target.value)} /></Field><Field label="Jour de paiement"><Input type="number" min="1" max="31" value={data.paymentDay} onChange={(e) => update("paymentDay", e.target.value)} /></Field><Field label="Mois de dépôt de garantie"><Input type="number" min="0" max="2" value={data.depositMonths} onChange={(e) => update("depositMonths", e.target.value)} /></Field><Field label="Avance à la signature (DH)"><Input type="number" min="0" value={data.advance} onChange={(e) => update("advance", e.target.value)} /></Field><Field label="Mode de paiement"><Input value={data.paymentMethod} onChange={(e) => update("paymentMethod", e.target.value)} /></Field><Field label="Coordonnées de paiement"><Input value={data.bankDetails} onChange={(e) => update("bankDetails", e.target.value)} /></Field><Field label="Charges et services"><Textarea value={data.charges} onChange={(e) => update("charges", e.target.value)} /></Field><Field label="Entretien jardin / piscine"><Textarea value={data.gardenPool} onChange={(e) => update("gardenPool", e.target.value)} /></Field><Field label="Délai de préavis du modèle"><Input value={data.notice} onChange={(e) => update("notice", e.target.value)} /></Field><Field label="Règles de la résidence"><Input value={data.residenceRules} onChange={(e) => update("residenceRules", e.target.value)} /></Field></div></section>}

        {kind === "reservation" && <section className="space-y-3 rounded-lg border p-4"><h3 className="text-sm font-medium">Période, loyer et acompte</h3><div className="grid gap-3 sm:grid-cols-2"><Field label="Date de début"><Input type="date" value={data.from} onChange={(e) => update("from", e.target.value)} /></Field><Field label="Date de fin"><Input type="date" value={data.to} onChange={(e) => update("to", e.target.value)} /></Field><Field label="Loyer mensuel (DH)"><Input type="number" min="0" value={data.rent} onChange={(e) => update("rent", e.target.value)} /></Field><Field label="Acompte reçu (DH)"><Input type="number" min="0" value={data.advance} onChange={(e) => update("advance", e.target.value)} /></Field><Field label="Mode de paiement"><Input value={data.paymentMethod} onChange={(e) => update("paymentMethod", e.target.value)} /></Field><Field label="Annulation par le client - français"><Textarea value={data.cancelClient} onChange={(e) => update("cancelClient", e.target.value)} /></Field><Field label="إلغاء من طرف المكتري - العربية"><Textarea dir="rtl" value={data.cancelClientAr} onChange={(e) => update("cancelClientAr", e.target.value)} /></Field><Field label="Annulation par le propriétaire - français"><Textarea value={data.cancelOwner} onChange={(e) => update("cancelOwner", e.target.value)} /></Field><Field label="إلغاء من طرف المالك - العربية"><Textarea dir="rtl" value={data.cancelOwnerAr} onChange={(e) => update("cancelOwnerAr", e.target.value)} /></Field></div></section>}

        {kind === "receipt" && <section className="space-y-3 rounded-lg border p-4"><h3 className="text-sm font-medium">Détails du paiement</h3><div className="grid gap-3 sm:grid-cols-2"><Field label="N° du reçu"><Input value={data.receiptNumber} onChange={(e) => update("receiptNumber", e.target.value)} /></Field><Field label="Montant total reçu (DH)"><Input type="number" min="0" value={data.receiptAmount} onChange={(e) => update("receiptAmount", e.target.value)} placeholder="Vide = loyer + charges" /></Field><Field label="Part loyer (DH)"><Input type="number" min="0" value={data.receiptRent} onChange={(e) => update("receiptRent", e.target.value)} /></Field><Field label="Charges locatives (DH)"><Input type="number" min="0" value={data.receiptCharges} onChange={(e) => update("receiptCharges", e.target.value)} /></Field><Field label="Objet"><Input value={data.receiptPurpose} onChange={(e) => update("receiptPurpose", e.target.value)} /></Field><Field label="Période concernée"><Input value={data.receiptPeriod} onChange={(e) => update("receiptPeriod", e.target.value)} /></Field><Field label="Mode de paiement"><Input value={data.paymentMethod} onChange={(e) => update("paymentMethod", e.target.value)} /></Field></div></section>}
        <Field label="Clause / précision complémentaire"><Textarea rows={3} value={data.extra} onChange={(e) => update("extra", e.target.value)} /></Field>
      </section>

      <article id="generated-document" dir={rtl ? "rtl" : "ltr"} className="admin-card min-h-[500px] min-w-0 overflow-hidden rounded-xl bg-white p-4 text-[12px] leading-6 text-neutral-900 shadow-sm sm:min-h-[760px] sm:p-8 sm:text-[13px]">
        <header className="mb-8 border-b border-neutral-300 pb-4 text-center"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{data.agency}</p><h1 className="mt-3 text-2xl font-bold">{kind === "lease" ? (rtl ? "عقد كراء للسكنى" : "CONTRAT DE BAIL À USAGE D’HABITATION") : kind === "reservation" ? (rtl ? "وصل الحجز" : "BON DE RÉSERVATION") : (rtl ? "وصل الأداء" : "REÇU DE PAIEMENT")}</h1>{language === "both" && <p className="mt-1 text-xl font-bold" dir="rtl">{kind === "lease" ? "عقد كراء للسكنى" : kind === "reservation" ? "وصل الحجز" : "وصل الأداء"}</p>}<p className="mt-2 text-xs">{rtl ? `حرر بمراكش في ${dateText}` : `Fait à Marrakech, le ${dateText}`}</p></header>

        {kind === "lease" ? <>
          <p className="mb-3 text-center font-semibold">{rtl ? "بين الموقعين أسفله" : "Entre les soussignés :"}</p>
          <h2 className="font-bold">{rtl ? "الطرف الأول: المكري" : "PREMIÈRE PARTIE : LE BAILLEUR"}</h2>
          {language !== "ar" && <p className="mb-3">{data.landlord || "[Nom complet]"}, {data.landlordProfession || "[profession]"}, {data.landlordNationality || "[nationalité]"}, né(e) le {data.landlordBirth || "[date et lieu de naissance]"}, titulaire de {data.landlordId || "[CIN / passeport]"}, domicilié(e) à {data.landlordAddress || "[adresse]"}.{data.agent ? ` Représenté(e) par ${data.agent}, CIN ${data.agentId || "[à compléter]"}, procuration ${data.mandate || "[référence]"}.` : ""}</p>}
          {language !== "fr" && <p dir="rtl" className="mb-3">{data.landlord || "[الاسم الكامل]"}، {data.landlordProfession || "[المهنة]"}، {data.landlordNationality || "[الجنسية]"}، من مواليد {data.landlordBirth || "[تاريخ ومكان الازدياد]"}، حامل(ة) {data.landlordId || "[البطاقة الوطنية / جواز السفر]"}، الساكن(ة) ب {data.landlordAddress || "[العنوان]"}.{data.agent ? ` ينوب عنه(ا) ${data.agent}، حامل(ة) ${data.agentId || "[وثيقة الهوية]"}، بموجب الوكالة ${data.mandate || "[المرجع]"}.` : ""}</p>}
          <h2 className="font-bold">{rtl ? "الطرف الثاني: المكتري" : "DEUXIÈME PARTIE : LE LOCATAIRE"}</h2>
          {language !== "ar" && <><p className="mb-3">{data.tenant || "[Nom complet]"}, {data.tenantProfession || "[profession]"}, {data.tenantNationality || "[nationalité]"}, né(e) le {data.tenantBirth || "[date et lieu de naissance]"}, titulaire de {data.tenantId || "[CIN / passeport]"}, domicilié(e) à {data.tenantAddress || "[adresse]"}.</p>{data.otherTenant && <p className="mb-3">Co-locataire : {data.otherTenant}, {data.otherTenantProfession || "[profession]"}, {data.otherTenantNationality || "[nationalité]"}, né(e) le {data.otherTenantBirth || "[date et lieu de naissance]"}, titulaire de {data.otherTenantId || "[CIN / passeport]"}, domicilié(e) à {data.otherTenantAddress || "[adresse]"}.</p>}</>}
          {language !== "fr" && <><p dir="rtl" className="mb-3">{data.tenant || "[الاسم الكامل]"}، {data.tenantProfession || "[المهنة]"}، {data.tenantNationality || "[الجنسية]"}، من مواليد {data.tenantBirth || "[تاريخ ومكان الازدياد]"}، حامل(ة) {data.tenantId || "[البطاقة الوطنية / جواز السفر]"}، الساكن(ة) ب {data.tenantAddress || "[العنوان]"}.</p>{data.otherTenant && <p dir="rtl" className="mb-3">المكتري(ة) الثاني(ة): {data.otherTenant}، {data.otherTenantProfession || "[المهنة]"}، {data.otherTenantNationality || "[الجنسية]"}، من مواليد {data.otherTenantBirth || "[تاريخ ومكان الازدياد]"}، حامل(ة) {data.otherTenantId || "[البطاقة الوطنية / جواز السفر]"}، الساكن(ة) ب {data.otherTenantAddress || "[العنوان]"}.</p>}</>}
          {articleTitles.map(([frTitle, arTitle], i) => <section className="mb-4" key={frTitle}><h3 className="font-bold">{rtl ? `المادة ${i + 1}: ${arTitle}` : `ARTICLE ${i + 1} : ${frTitle}`}</h3>{language !== "ar" && <p>{fill(clauses[i][0], data)}</p>}{language !== "fr" && <p dir="rtl">{fill(clauses[i][1], data)}</p>}</section>)}
          {data.extra && <p className="mb-4">{data.extra}</p>}
          <div className="mt-8 grid grid-cols-2 gap-8 text-center"><div><strong>{rtl ? "المكري" : "Le Bailleur"}</strong><p className="mt-12">Signature : __________________</p></div><div><strong>{rtl ? "المكتري" : "Le Locataire"}</strong><p className="mt-12">Signature : __________________</p><p>{rtl ? "قرئ وصودق عليه" : "Lu et approuvé"}</p></div>{data.otherTenant && <div className="col-start-2 text-center"><strong>{data.otherTenant}</strong><p className="mt-12">Signature : __________________</p><p>{rtl ? "قرئ وصودق عليه" : "Lu et approuvé"}</p></div>}</div>
        </> : kind === "reservation" ? <>
          <p className="mb-4 text-center font-semibold">{rtl ? "كراء طويل الأمد" : "LOCATION LONGUE DURÉE"}</p><table className="w-full border-collapse"><tbody>{[["Date / التاريخ", dateText], ["Bailleur / المالك", data.landlord || "[à compléter]"], ["Locataire / المكتري", data.tenant || "[à compléter]"], ["Passeport / CIN", data.tenantId || "[à compléter]"], ["Bien réservé / العقار", propertyName], ["Type / النوع", rtl ? "كراء طويل الأمد للسكنى" : "Location longue durée à usage d'habitation"], ["Période / المدة", rtl ? `من ${data.from || "[البداية]"} إلى ${data.to || "[النهاية]"}` : `${data.from || "[début]"} au ${data.to || "[fin]"}`], ["Loyer mensuel / الكراء الشهري", `${data.rent || "[montant]"} ${rtl ? "درهم" : "DH"}`], ["Acompte reçu / التسبيق المقبوض", `${data.advance || "[montant]"} ${rtl ? "درهم" : "DH"}`], ["Mode de paiement / طريقة الأداء", data.paymentMethod]].map(([label, value]) => <tr key={label}><th className="w-[39%] border border-neutral-400 bg-neutral-100 px-3 py-2 text-left">{label}</th><td className="border border-neutral-400 px-3 py-2">{value}</td></tr>)}</tbody></table>
          <h2 className="mb-2 mt-7 font-bold">{rtl ? "شروط الإلغاء" : "Conditions d’annulation"}</h2>{language !== "ar" && <><p><strong>Annulation par le client : </strong>{data.cancelClient}</p><p><strong>Annulation par le propriétaire : </strong>{data.cancelOwner}</p></>}{language !== "fr" && <><p dir="rtl"><strong>إلغاء من طرف المكتري: </strong>{data.cancelClientAr}</p><p dir="rtl"><strong>إلغاء من طرف المالك: </strong>{data.cancelOwnerAr}</p></>}<p className="mt-4">{rtl ? "يستكمل هذا الوصل بعقد الكراء طويل الأمد." : "Ce bon sera complété par le contrat de location longue durée."}</p><div className="mt-10 grid grid-cols-2 gap-8 text-center"><div><strong>{data.agency}</strong><p>{data.agencyAddress}</p><p className="mt-10">{rtl ? "ختم وتوقيع" : "Cachet et signature"}</p></div><div><strong>{rtl ? "المكتري" : "Le / La Client(e)"}</strong><p className="mt-10">{rtl ? "قرئ وصودق عليه، التوقيع" : "Lu et approuvé, signature"}</p></div></div>
        </> : <>
          <p className="mb-6 text-center text-lg font-bold">{rtl ? "وصل باستلام مبلغ" : "REÇU DE PAIEMENT"}</p>{[["N° du reçu / رقم الوصل", data.receiptNumber || "[à compléter]"], ["Date / التاريخ", dateText], ["Reçu de / توصلت من", data.tenant || "[nom du payeur]"], ["Part loyer / حصة الكراء", `${data.receiptRent || "0"} DH`], ["Charges / المصاريف", `${data.receiptCharges || "0"} DH`], ["Total reçu / المجموع المقبوض", `${receiptTotal || "[montant]"} dirhams`], ["Objet / السبب", `${data.receiptPurpose}${data.receiptPeriod ? ` - ${data.receiptPeriod}` : ""}`], ["Bien / العقار", propertyName], ["Mode de paiement / طريقة الأداء", data.paymentMethod]].map(([label, value]) => <p key={label} className="mb-4 border-b border-neutral-300 pb-2"><strong>{label} : </strong>{value}</p>)}{data.extra && <p>{data.extra}</p>}<p className="mt-5">{rtl ? "حرر هذا الوصل لإثبات المبلغ المذكور أعلاه." : "Le présent reçu constate le paiement du montant indiqué ci-dessus."}</p><div className="mt-16 text-right">{rtl ? "توقيع المستلم" : "Signature du bénéficiaire"}<p className="mt-12">____________________________</p></div>
        </>}
        <footer className="mt-10 border-t border-neutral-300 pt-3 text-center text-[10px] text-neutral-500">{[data.agency, data.agencyPhone, data.agencyAddress, data.agencyIds].filter(Boolean).join(" · ")}</footer>
      </article>
    </div>
    <p className="no-print text-xs text-muted-foreground">Les champs d’identité et de paiement restent dans l’aperçu et ne sont pas enregistrés dans le CRM. Vérifie les informations et les clauses avant signature; le modèle reprend les rubriques de tes exemples.</p>
  </main>;
}
