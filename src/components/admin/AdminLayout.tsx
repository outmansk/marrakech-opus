import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Building2, FileText, CalendarCheck, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AdminLayout() {
  const [session, setSession] = useState<any>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/admin/login", { replace: true });
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/admin/login", { replace: true });
      }
    });
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  // Determine active tab based on route
  const isDashboard = location.pathname.includes('/admin/dashboard');
  const isBiens     = location.pathname.includes('/admin/biens');
  const isBlog      = location.pathname.includes('/admin/blog');
  const isVisites   = location.pathname.includes('/admin/visites');

  const navItems = [
    { path: '/admin/dashboard', label: t('admin.tableau_bord'), icon: LayoutDashboard, active: isDashboard },
    { path: '/admin/biens',     label: t('admin.biens'),        icon: Building2,        active: isBiens     },
    { path: '/admin/blog',      label: t('admin.blog'),         icon: FileText,         active: isBlog      },
    { path: '/admin/visites',   label: t('admin.visites'),      icon: CalendarCheck,    active: isVisites   },
  ];

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-20">
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <h1
              className="font-serif text-xl cursor-pointer select-none"
              onClick={() => navigate("/admin/dashboard")}
            >
              Live In Marrakech
            </h1>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ path, label, icon: Icon, active }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-widest uppercase font-sans transition-colors rounded-sm
                    ${active
                      ? 'text-foreground font-semibold bg-secondary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <Icon size={13} strokeWidth={1.5} />
                  {label}
                </button>
              ))}
            </nav>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut size={16} strokeWidth={1.25} />
            <span className="hidden sm:inline">{t('auth.deconnexion')}</span>
          </Button>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="md:hidden border-b border-border bg-muted/20">
        <div className="flex overflow-x-auto gap-1 px-4 py-2">
          {navItems.map(({ path, label, icon: Icon, active }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex items-center gap-1 px-3 py-1.5 text-[10px] tracking-widest uppercase whitespace-nowrap rounded-sm transition-colors
                ${active ? 'font-bold bg-secondary text-foreground' : 'text-muted-foreground'}`}
            >
              <Icon size={12} strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
