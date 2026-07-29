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
        "relative w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-300 group rounded-lg",
        item.active
          ? "bg-primary/8 text-primary font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      {/* Active indicator — animated bar */}
      {item.active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-gradient-to-b from-primary to-primary/60 rounded-r-full admin-nav-indicator" />
      )}

      <div className={cn(
        "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
        item.active
          ? "bg-primary/12 text-primary"
          : "bg-transparent text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
      )}>
        <item.icon
          size={16}
          strokeWidth={item.active ? 2 : 1.5}
        />
      </div>

      {!collapsed && (
        <>
          <span className="text-[11px] tracking-[0.18em] uppercase font-sans flex-1 transition-colors">
            {item.label}
          </span>
          {item.badge !== undefined && item.badge > 0 && (
            <span className="text-[9px] bg-gradient-to-r from-terracotta to-terracotta/80 text-white px-2 py-0.5 rounded-full font-medium shadow-sm">
              {item.badge}
            </span>
          )}
          {item.active && (
            <ChevronRight size={12} className="text-primary/50 shrink-0" />
          )}
        </>
      )}
    </button>
  );
}

// ─── User Avatar ──────────────────────────────────────────────────────────────
function UserAvatar({ email, size = 'md' }: { email: string; size?: 'sm' | 'md' }) {
  const initials = email
    ? email.split('@')[0].slice(0, 2).toUpperCase()
    : 'AD';
  
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-8 h-8 text-[11px]';
  
  return (
    <div className={cn(
      sizeClass,
      "rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-medium text-primary/80 shrink-0 ring-1 ring-primary/10"
    )}>
      {initials}
    </div>
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
      <div className={cn("px-4 py-6 border-b border-border/40", sidebarCollapsed && !mobile && "px-3")}>
        <button
          onClick={() => navigate("/manage-xk92p/dashboard")}
          className="flex items-center gap-3 w-full group"
        >
          {/* Logo mark — gradient accent */}
          <div className={cn(
            "shrink-0 flex items-center justify-center rounded-xl transition-all duration-300 bg-gradient-to-br from-primary/10 to-accent/10 ring-1 ring-primary/15 group-hover:ring-primary/30 group-hover:shadow-md",
            sidebarCollapsed && !mobile ? "w-9 h-9" : "w-10 h-10"
          )}>
            <span className="font-serif text-lg text-primary leading-none font-medium">L</span>
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
        {!sidebarCollapsed && !mobile && (
          <p className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground/60 font-sans px-3 mb-3">
            Navigation
          </p>
        )}
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
        "px-3 py-4 border-t border-border/40 space-y-2",
        sidebarCollapsed && !mobile && "px-2"
      )}>
        {/* Lien site public */}
        {(!sidebarCollapsed || mobile) && (
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 text-[10px] tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground transition-all duration-200 group rounded-lg hover:bg-muted/40"
          >
            <ExternalLink size={13} strokeWidth={1.5} className="shrink-0" />
            Voir le site
          </a>
        )}
        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 w-full text-[10px] tracking-[0.18em] uppercase text-muted-foreground hover:text-destructive transition-all duration-200 rounded-lg hover:bg-destructive/5",
            sidebarCollapsed && !mobile && "justify-center px-2"
          )}
          title={sidebarCollapsed && !mobile ? t("auth.deconnexion") : undefined}
        >
          <LogOut size={14} strokeWidth={1.5} className="shrink-0" />
          {(!sidebarCollapsed || mobile) && <span>{t("auth.deconnexion")}</span>}
        </button>

        {/* User info */}
        {(!sidebarCollapsed || mobile) && session?.user?.email && (
          <div className="flex items-center gap-2.5 px-3 py-2">
            <UserAvatar email={session.user.email} size="sm" />
            <p className="text-[10px] text-muted-foreground/70 tracking-wide truncate flex-1">
              {session.user.email}
            </p>
          </div>
        )}
        {sidebarCollapsed && !mobile && session?.user?.email && (
          <div className="flex justify-center py-1" title={session.user.email}>
            <UserAvatar email={session.user.email} size="sm" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20 flex">

      {/* ── Desktop Sidebar ── */}
      <aside
        className={cn(
          "hidden md:flex flex-col sticky top-0 h-screen admin-sidebar border-r border-border/50 transition-all duration-300 shrink-0 z-30",
          sidebarCollapsed ? "w-[64px]" : "w-[232px]"
        )}
      >
        <SidebarContent />

        {/* Collapse toggle — floating pill */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-background border border-border/60 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 hover:shadow-md transition-all duration-300 shadow-sm z-10"
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
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-[272px] admin-sidebar border-r border-border/50 z-50 flex flex-col transition-transform duration-300 md:hidden shadow-2xl",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-border/40 shrink-0">
          <span className="font-serif text-sm">Menu Admin</span>
          <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/50 transition-colors">
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
        <header className="md:hidden sticky top-0 bg-background/90 backdrop-blur-lg border-b border-border/50 z-20 px-4 h-14 flex items-center justify-between shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
            <Menu size={20} />
          </button>
          <span className="font-serif text-base">Live In Marrakech</span>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/5 transition-colors">
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
