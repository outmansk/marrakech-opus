import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogOut } from "lucide-react";

export default function AdminLayout() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

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
    navigate("/admin");
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

  // Determine active tab based on route
  const isBiens = location.pathname.includes('/admin/biens');
  const isBlog = location.pathname.includes('/admin/blog');
  const isVisites = location.pathname.includes('/admin/visites');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-20">
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <h1
              className="font-serif text-xl cursor-pointer select-none"
              onClick={() => navigate("/admin/biens")}
            >
              Administration
            </h1>
            <nav className="hidden md:flex items-center gap-4">
              <button
                onClick={() => navigate("/admin/biens")}
                className={`text-xs tracking-widest uppercase font-sans transition-colors ${isBiens ? 'text-foreground font-semibold border-b-2 border-foreground pb-0.5' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Biens
              </button>
              <button
                onClick={() => navigate("/admin/blog")}
                className={`text-xs tracking-widest uppercase font-sans transition-colors ${isBlog ? 'text-foreground font-semibold border-b-2 border-foreground pb-0.5' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Blog
              </button>
              <button
                onClick={() => navigate("/admin/visites")}
                className={`text-xs tracking-widest uppercase font-sans transition-colors ${isVisites ? 'text-foreground font-semibold border-b-2 border-foreground pb-0.5' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Demandes de Visite
              </button>
            </nav>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut size={16} strokeWidth={1.25} />
            <span className="hidden sm:inline">Déconnexion</span>
          </Button>
        </div>
      </header>
      
      {/* Mobile nav fallback (if needed) */}
      <div className="md:hidden border-b border-border bg-muted/20">
        <div className="flex px-4 overflow-x-auto gap-4 py-3">
          <button
            onClick={() => navigate("/admin/biens")}
            className={`text-[10px] tracking-widest uppercase whitespace-nowrap ${isBiens ? 'font-bold' : 'text-muted-foreground'}`}
          >
            Biens
          </button>
          <button
            onClick={() => navigate("/admin/blog")}
            className={`text-[10px] tracking-widest uppercase whitespace-nowrap ${isBlog ? 'font-bold' : 'text-muted-foreground'}`}
          >
            Blog
          </button>
          <button
            onClick={() => navigate("/admin/visites")}
            className={`text-[10px] tracking-widest uppercase whitespace-nowrap ${isVisites ? 'font-bold' : 'text-muted-foreground'}`}
          >
            Visites
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
