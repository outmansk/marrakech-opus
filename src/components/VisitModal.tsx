import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/useToast";
import DOMPurify from 'dompurify';

interface VisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyTitle: string;
}

const VisitModal = ({ open, onOpenChange, propertyId, propertyTitle }: VisitModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !date) return;

    setLoading(true);
    const { error } = await supabase.from("visit_requests").insert({
      property_id: propertyId,
      client_name: DOMPurify.sanitize(name.trim()),
      client_phone: DOMPurify.sanitize(phone.trim()),
      requested_date: DOMPurify.sanitize(date),
    });
    setLoading(false);

    if (error) {
      toast({ title: "Erreur", description: "Une erreur est survenue. Veuillez reessayer.", variant: "destructive" });
    } else {
      toast({ title: "Demande envoyee", description: "Nous vous recontacterons dans les plus brefs delais." });
      setName("");
      setPhone("");
      setDate("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-border p-8">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-normal">Demander une visite</DialogTitle>
          <p className="text-muted-foreground font-light text-sm mt-1">{propertyTitle}</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs tracking-widest uppercase text-muted-foreground">Nom complet</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="h-12 bg-transparent border-border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs tracking-widest uppercase text-muted-foreground">Telephone</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="h-12 bg-transparent border-border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date" className="text-xs tracking-widest uppercase text-muted-foreground">Date souhaitee</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="h-12 bg-transparent border-border" />
          </div>
          <Button type="submit" variant="luxury" size="lg" className="w-full h-12" disabled={loading}>
            {loading ? "Envoi en cours..." : "Envoyer la demande"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VisitModal;
