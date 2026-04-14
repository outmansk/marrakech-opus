import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit2, Plus, ArrowLeft, LogOut, CheckCircle, XCircle } from "lucide-react";
import type { Article } from "@/types/article";
import slugify from "slugify";

const AdminBlog = () => {
  const [session, setSession] = useState<any>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState<Partial<Article>>({
    title: "", slug: "", category: "location-longue-duree", excerpt: "", 
    content: "", meta_title: "", meta_description: "", image_url: "", est_publie: false
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/admin");
      setSession(session);
    });
  }, [navigate]);

  useEffect(() => {
    if (session) fetchArticles();
  }, [session]);

  const fetchArticles = async () => {
    setLoading(true);
    const { data } = await supabase.from("articles").select("*").order("created_at", { ascending: false });
    if (data) setArticles(data as Article[]);
    setLoading(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    if (!editingId) {
      setForm({ ...form, title, slug: slugify(title, { lower: true, strict: true }) });
    } else {
      setForm({ ...form, title });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      const { error } = await supabase.from("articles").update(form).eq("id", editingId);
      if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
      else { toast({ title: "Article modifié" }); setEditingId(null); fetchArticles(); resetForm(); }
    } else {
      const { error } = await supabase.from("articles").insert(form);
      if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
      else { toast({ title: "Article créé" }); fetchArticles(); resetForm(); }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer cet article ?")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (!error) { toast({ title: "Article supprimé" }); fetchArticles(); }
  };

  const handleEdit = (article: Article) => {
    setEditingId(article.id);
    setForm(article);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ title: "", slug: "", category: "location-longue-duree", excerpt: "", content: "", meta_title: "", meta_description: "", image_url: "", est_publie: false });
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <Link to="/admin"><Button variant="outline" size="sm"><ArrowLeft size={16} className="mr-2"/> Panel principal</Button></Link>
            <h1 className="text-2xl font-bold">Gestion du Blog SEO</h1>
          </div>
          <Button variant="ghost" onClick={() => supabase.auth.signOut().then(() => navigate('/admin'))}><LogOut size={16} className="mr-2"/> Déconnexion</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des articles */}
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-[calc(100vh-150px)] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-semibold text-lg">Vos articles</h2>
              <Button size="sm" onClick={resetForm} variant="outline"><Plus size={16}/></Button>
            </div>
            
            {loading ? <p className="text-sm text-gray-500">Chargement...</p> : (
              <div className="space-y-3">
                {articles.map(art => (
                  <div key={art.id} className={`p-3 rounded border text-sm transition-colors ${editingId === art.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <p className="font-semibold truncate pr-2">{art.title}</p>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        {art.est_publie ? <CheckCircle size={12} className="text-green-500"/> : <XCircle size={12} className="text-gray-400"/>}
                        {art.category}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(art)} className="hover:text-blue-600"><Edit2 size={14}/></button>
                        <button onClick={() => handleDelete(art.id)} className="hover:text-red-600"><Trash2 size={14}/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulaire CRUD */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="font-semibold text-xl mb-6">{editingId ? "Modifier l'article" : "Nouvel article SEO"}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Titre (H1)</Label>
                  <Input value={form.title} onChange={handleTitleChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Slug (URL)</Label>
                  <Input value={form.slug} onChange={(e) => setForm({...form, slug: e.target.value})} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <select 
                    value={form.category} 
                    onChange={(e) => setForm({...form, category: e.target.value as any})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2"
                  >
                    <option value="location-longue-duree">Location Longue Durée</option>
                    <option value="sous-location">Sous-location</option>
                    <option value="vente">Vente</option>
                    <option value="terrain">Terrain</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>URL de l'image (couverture)</Label>
                  <Input value={form.image_url} onChange={(e) => setForm({...form, image_url: e.target.value})} placeholder="https://..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Meta Title SEO</Label>
                  <Input value={form.meta_title} onChange={(e) => setForm({...form, meta_title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description SEO</Label>
                  <Input value={form.meta_description} onChange={(e) => setForm({...form, meta_description: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Extrait (Résumé visible sur les cards)</Label>
                <Textarea value={form.excerpt} onChange={(e) => setForm({...form, excerpt: e.target.value})} rows={2} required />
              </div>

              <div className="space-y-2">
                <Label>Contenu Markdown (Génère la Table des Matières avec ## et ###)</Label>
                <Textarea value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} rows={12} className="font-mono text-sm" required />
              </div>

              <div className="flex items-center gap-2 pt-2 pb-4">
                <input type="checkbox" id="publie" checked={form.est_publie} onChange={(e) => setForm({...form, est_publie: e.target.checked})} className="w-4 h-4 rounded" />
                <Label htmlFor="publie" className="cursor-pointer font-medium">Publier cet article (Visible en ligne)</Label>
              </div>

              <div className="flex justify-end gap-2">
                {editingId && <Button type="button" variant="outline" onClick={resetForm}>Annuler</Button>}
                <Button type="submit" className="bg-[#C9A96E] hover:bg-[#B39358] text-white">
                  {editingId ? "Mettre à jour l'article" : "Créer l'article"}
                </Button>
              </div>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AdminBlog;
