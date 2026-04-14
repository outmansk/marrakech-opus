import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Property, VisitRequest } from "@/types/property";
import { Trash2, Plus, LogOut, Eye, EyeOff, Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const Admin = () => {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [visits, setVisits] = useState<(VisitRequest & { properties?: { title: string } })[]>([]);
  const [tab, setTab] = useState<"properties" | "visits" | "add">("properties");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form state for new property
  const [form, setForm] = useState({
    title: "", description: "",
    price_vente: "", price_location_courte: "", price_location_longue: "",
    transaction_types: ["vente"],
    property_type: "Villa", bedrooms: "", secure_parking: false,
    environment_type: "", proximities: "[]", is_available: true,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    const [propRes, visitRes] = await Promise.all([
      supabase.from("properties").select("*").order("created_at", { ascending: false }),
      supabase.from("visit_requests").select("*, properties(title)").order("created_at", { ascending: false }),
    ]);
    if (propRes.data) setProperties(propRes.data as Property[]);
    if (visitRes.data) setVisits(visitRes.data as any);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthLoading(false);
    if (error) {
      toast({ title: "Erreur d'authentification", description: error.message, variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Upload images
    const imageUrls: string[] = [];
    for (const file of imageFiles) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("property_images").upload(fileName, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from("property_images").getPublicUrl(fileName);
        imageUrls.push(urlData.publicUrl);
      }
    }

    let proximities: any[] = [];
    try { proximities = JSON.parse(form.proximities); } catch {}

    const { error } = await supabase.from("properties").insert({
      title: form.title,
      description: form.description,
      price: 0, // Legacy
      price_vente: form.price_vente ? parseFloat(form.price_vente) : 0,
      price_location_courte: form.price_location_courte ? parseFloat(form.price_location_courte) : 0,
      price_location_longue: form.price_location_longue ? parseFloat(form.price_location_longue) : 0,
      transaction_types: form.transaction_types,
      property_type: form.property_type,
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
      secure_parking: form.secure_parking,
      environment_type: form.environment_type || null,
      proximities,
      image_urls: imageUrls,
      is_available: form.is_available,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Bien ajoute avec succes" });
      setForm({ title: "", description: "", price_vente: "", price_location_courte: "", price_location_longue: "", transaction_types: ["vente"], property_type: "Villa", bedrooms: "", secure_parking: false, environment_type: "", proximities: "[]", is_available: true });
      setImageFiles([]);
      setTab("properties");
      fetchData();
    }
  };

  const handleDeleteProperty = async (id: string) => {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (!error) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Bien supprime" });
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h1 className="font-serif text-3xl mb-2">Administration</h1>
            <p className="text-muted-foreground font-light text-sm">Dar Prestige</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs tracking-widest uppercase text-muted-foreground">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 bg-transparent" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs tracking-widest uppercase text-muted-foreground">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-transparent pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff size={18} strokeWidth={1.25} /> : <Eye size={18} strokeWidth={1.25} />}
                </button>
              </div>
            </div>
            <Button type="submit" variant="luxury" size="lg" className="w-full h-12" disabled={authLoading}>
              {authLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h2 className="font-serif text-xl cursor-pointer" onClick={() => navigate("/admin")}>Administration</h2>
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => navigate("/admin")} className={`text-xs tracking-widest uppercase font-sans ${tab !== 'visits' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>Immobilier</button>
              <button onClick={() => navigate("/admin/blog")} className="text-xs tracking-widest uppercase font-sans text-muted-foreground hover:text-foreground">Blog</button>
            </nav>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut size={16} strokeWidth={1.25} />
            Deconnexion
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 py-8">
        <div className="flex gap-1 mb-8 border-b border-border">
          {([["properties", "Biens"], ["visits", "Demandes de visite"], ["add", "Ajouter un bien"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-6 py-3 text-xs tracking-widest uppercase font-sans font-medium transition-colors border-b-2 -mb-px ${
                tab === key ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "properties" && (
          <div className="space-y-4">
            {properties.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 border border-border">
                <div className="flex items-center gap-4">
                  {p.image_urls?.[0] && (
                    <img src={p.image_urls[0]} alt="" className="w-16 h-12 object-cover" />
                  )}
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-sm text-muted-foreground font-light">{p.property_type} — {(p.transaction_types || []).join(', ')}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteProperty(p.id)}>
                  <Trash2 size={16} strokeWidth={1.25} />
                </Button>
              </div>
            ))}
            {properties.length === 0 && <p className="text-muted-foreground font-light text-center py-12">Aucun bien enregistre.</p>}
          </div>
        )}

        {tab === "visits" && (
          <div className="space-y-4">
            {visits.map((v) => (
              <div key={v.id} className="p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{v.client_name}</p>
                  <span className="text-xs tracking-widest uppercase px-3 py-1 bg-secondary text-muted-foreground">{v.status}</span>
                </div>
                <p className="text-sm text-muted-foreground font-light">
                  {(v as any).properties?.title} — {v.requested_date} — {v.client_phone}
                </p>
              </div>
            ))}
            {visits.length === 0 && <p className="text-muted-foreground font-light text-center py-12">Aucune demande de visite.</p>}
          </div>
        )}

        {tab === "add" && (
          <form onSubmit={handleAddProperty} className="max-w-2xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">Titre</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="h-12 bg-transparent" />
              </div>
              <div className="space-y-4 md:col-span-2">
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">Types de transactions & Prix</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* VENTE */}
                  <div className="flex flex-col gap-3 p-4 border border-border">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.transaction_types.includes("vente")} onChange={(e) => {
                        const types = e.target.checked 
                          ? [...form.transaction_types, "vente"]
                          : form.transaction_types.filter(t => t !== "vente");
                        setForm({ ...form, transaction_types: types });
                      }} className="accent-olive" />
                      <span className="text-sm font-medium uppercase tracking-widest">En Vente</span>
                    </label>
                    <Input type="number" placeholder="Prix Vente (MAD)" value={form.price_vente} onChange={(e) => setForm({ ...form, price_vente: e.target.value })} disabled={!form.transaction_types.includes("vente")} className="h-10 bg-transparent" />
                  </div>

                  {/* LOCATION LONGUE */}
                  <div className="flex flex-col gap-3 p-4 border border-border">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.transaction_types.includes("location_longue")} onChange={(e) => {
                        const types = e.target.checked 
                          ? [...form.transaction_types, "location_longue"]
                          : form.transaction_types.filter(t => t !== "location_longue");
                        setForm({ ...form, transaction_types: types });
                      }} className="accent-olive" />
                      <span className="text-sm font-medium uppercase tracking-widest">Loc. Longue</span>
                    </label>
                    <Input type="number" placeholder="Prix par mois (MAD)" value={form.price_location_longue} onChange={(e) => setForm({ ...form, price_location_longue: e.target.value })} disabled={!form.transaction_types.includes("location_longue")} className="h-10 bg-transparent" />
                  </div>

                  {/* LOCATION COURTE */}
                  <div className="flex flex-col gap-3 p-4 border border-border">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.transaction_types.includes("location_courte")} onChange={(e) => {
                        const types = e.target.checked 
                          ? [...form.transaction_types, "location_courte"]
                          : form.transaction_types.filter(t => t !== "location_courte");
                        setForm({ ...form, transaction_types: types });
                      }} className="accent-olive" />
                      <span className="text-sm font-medium uppercase tracking-widest">Loc. Courte</span>
                    </label>
                    <Input type="number" placeholder="Prix par nuit (MAD)" value={form.price_location_courte} onChange={(e) => setForm({ ...form, price_location_courte: e.target.value })} disabled={!form.transaction_types.includes("location_courte")} className="h-10 bg-transparent" />
                  </div>

                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">Type de bien</Label>
                <Input value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })} className="h-12 bg-transparent" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">Chambres</Label>
                <Input type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} className="h-12 bg-transparent" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">Environnement</Label>
                <Input value={form.environment_type} onChange={(e) => setForm({ ...form, environment_type: e.target.value })} placeholder="Ex: Palmeraie, Gueliz..." className="h-12 bg-transparent" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} className="bg-transparent" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">Proximites (JSON)</Label>
              <Textarea value={form.proximities} onChange={(e) => setForm({ ...form, proximities: e.target.value })} rows={3} className="bg-transparent font-mono text-xs" placeholder='[{"place": "Aeroport", "time": "20 min"}]' />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.secure_parking} onChange={(e) => setForm({ ...form, secure_parking: e.target.checked })} className="accent-olive" />
                <span className="text-sm font-light">Parking securise</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} className="accent-olive" />
                <span className="text-sm font-light">Disponible</span>
              </label>
            </div>
            <div className="space-y-2">
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">Images</Label>
              <label className="flex items-center justify-center gap-2 h-24 border-2 border-dashed border-border cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload size={20} strokeWidth={1.25} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-light">
                  {imageFiles.length > 0 ? `${imageFiles.length} fichier(s) selectionne(s)` : "Cliquer pour ajouter des images"}
                </span>
                <input type="file" multiple accept="image/*" onChange={(e) => setImageFiles(Array.from(e.target.files || []))} className="hidden" />
              </label>
            </div>
            <Button type="submit" variant="luxury" size="lg" className="h-12 px-10" disabled={submitting}>
              {submitting ? "Enregistrement..." : "Enregistrer le bien"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Admin;
