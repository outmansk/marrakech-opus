import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Building2,
  FileText,
  CalendarCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

// ─── Nav item type ────────────────────────────────────────────────────────────
interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  badge?: number;
}

// ─── Sidebar Nav Link ─────────────────────────────────────────────────────────
function SidebarLink({ item, collapsed, onClick }: { item: NavItem; collapsed: boolean; onClick?: () => void }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => { navigate(item.path); onClick?.(); }}
      title={collapsed ? item.label : undefined}
      className={cn(
        "relative w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-200 group rounded-sm",
        item.active
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
      )}
    >
      {/* Active indicator */}
      {item.active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
      )}

      <item.icon
        size={16}
        strokeWidth={item.active ? 2 : 1.5}
        className={cn(
          "shrink-0 transition-colors",
          item.active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
      />

      {!collapsed && (
        <>
          <span className="text-[11px] tracking-[0.18em] uppercase font-sans flex-1 transition-colors">
            {item.label}
          </span>
          {item.badge !== undefined && item.badge > 0 && (
            <span className="text-[9px] bg-terracotta text-white px-1.5 py-0.5 rounded-full font-medium">
              {item.badge}
            </span>
          )}
          {item.active && (
            <ChevronRight size={12} className="text-primary/60 shrink-0" />
          )}
        </>
      )}
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminLayout() {
  const [session, setSession] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) navigate("/manage-xk92p/login", { replace: true });
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) navigate("/manage-xk92p/login", { replace: true });
    });
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/manage-xk92p/login", { replace: true });
  };

  const navItems: NavItem[] = [
    {
      path: "/manage-xk92p/dashboard",
      label: t("admin.tableau_bord"),
      icon: LayoutDashboard,
      active: location.pathname.includes("/manage-xk92p/dashboard"),
    },
    {
      path: "/manage-xk92p/biens",
      label: t("admin.biens"),
      icon: Building2,
      active: location.pathname.includes("/manage-xk92p/biens"),
    },
    {
      path: "/manage-xk92p/blog",
      label: t("admin.blog"),
      icon: FileText,
      active: location.pathname.includes("/manage-xk92p/blog"),
    },
    {
      path: "/manage-xk92p/visites",
      label: t("admin.visites"),
      icon: CalendarCheck,
      active: location.pathname.includes("/manage-xk92p/visites"),
    },
  ];

  if (!session) return null;

  // ── Sidebar content (shared desktop + mobile) ──
  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={cn("px-4 py-6 border-b border-border/60", sidebarCollapsed && !mobile && "px-3")}>
        <button
          onClick={() => navigate("/manage-xk92p/dashboard")}
          className="flex items-center gap-3 w-full group"
        >
          {/* Logo mark */}
          <div className={cn(
            "shrink-0 flex items-center justify-center border border-primary/30 bg-primary/5 transition-all",
            sidebarCollapsed && !mobile ? "w-8 h-8" : "w-9 h-9"
          )}>
            <span className="font-serif text-base text-primary leading-none">L</span>
          </div>
          {(!sidebarCollapsed || mobile) && (
            <div className="text-left min-w-0">
              <p className="font-serif text-sm leading-tight text-foreground truncate">
                Live In Marrakech
              </p>
              <p className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground font-sans mt-0.5">
                Administration
              </p>
            </div>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 px-3 py-5 space-y-1 overflow-y-auto", sidebarCollapsed && !mobile && "px-2")}>
        {navItems.map((item) => (
          <SidebarLink
            key={item.path}
            item={item}
            collapsed={sidebarCollapsed && !mobile}
            onClick={mobile ? () => setSidebarOpen(false) : undefined}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className={cn(
        "px-3 py-4 border-t border-border/60 space-y-2",
        sidebarCollapsed && !mobile && "px-2"
      )}>
        {/* Lien site public */}
        {(!sidebarCollapsed || mobile) && (
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 text-[10px] tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground transition-colors group rounded-sm hover:bg-muted/40"
          >
            <ExternalLink size={13} strokeWidth={1.5} className="shrink-0" />
            Voir le site
          </a>
        )}
        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 w-full text-[10px] tracking-[0.18em] uppercase text-muted-foreground hover:text-destructive transition-colors rounded-sm hover:bg-destructive/5",
            sidebarCollapsed && !mobile && "justify-center px-2"
          )}
          title={sidebarCollapsed && !mobile ? t("auth.deconnexion") : undefined}
        >
          <LogOut size={14} strokeWidth={1.5} className="shrink-0" />
          {(!sidebarCollapsed || mobile) && <span>{t("auth.deconnexion")}</span>}
        </button>

        {/* User email */}
        {(!sidebarCollapsed || mobile) && session?.user?.email && (
          <p className="px-3 text-[9px] text-muted-foreground/60 tracking-wide truncate">
            {session.user.email}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/20 flex">

      {/* ── Desktop Sidebar ── */}
      <aside
        className={cn(
          "hidden md:flex flex-col sticky top-0 h-screen bg-background border-r border-border/70 transition-all duration-300 shrink-0 z-30",
          sidebarCollapsed ? "w-[60px]" : "w-[220px]"
        )}
      >
        <SidebarContent />

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm z-10"
          title={sidebarCollapsed ? "Déployer" : "Réduire"}
        >
          <ChevronRight
            size={12}
            className={cn("transition-transform duration-300", sidebarCollapsed ? "rotate-0" : "rotate-180")}
          />
        </button>
      </aside>

      {/* ── Mobile: slide-in overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-[260px] bg-background border-r border-border z-50 flex flex-col transition-transform duration-300 md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-border/60 shrink-0">
          <span className="font-serif text-sm">Menu Admin</span>
          <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarContent mobile />
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar — mobile only */}
        <header className="md:hidden sticky top-0 bg-background/95 backdrop-blur border-b border-border z-20 px-4 h-14 flex items-center justify-between shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-foreground p-1">
            <Menu size={20} />
          </button>
          <span className="font-serif text-base">Live In Marrakech</span>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive p-1">
            <LogOut size={16} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
