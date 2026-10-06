import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import {
  Building2,
  CalendarCheck,
  CalendarClock,
  ExternalLink,
  FileText,
  Files,
  Home,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PenLine,
  Plus,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useAdminCounts } from "@/hooks/useAdminCounts";
import { CountBadge } from "@/components/admin/StatusBadge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const BASE = "/manage-xk92p";
const COLLAPSE_KEY = "lim-admin-sidebar-collapsed";

interface NavItem {
  path: string;
  label: string;
  short: string;
  icon: React.ElementType;
  count?: number;
}

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

export default function AdminLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [sheet, setSheet] = useState<"add" | "more" | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: counts } = useAdminCounts();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) navigate(`${BASE}/login`, { replace: true });
    });
    supabase.auth.getSession().then(({ data: { session: current } }) => {
      setSession(current);
      if (!current) navigate(`${BASE}/login`, { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Les jetons du back-office s'appliquent aussi aux fenêtres (Sheet, Dialog) rendues hors de la page.
  useEffect(() => {
    document.body.classList.add("admin");
    return () => document.body.classList.remove("admin");
  }, []);

  useEffect(() => setSheet(null), [location.pathname, location.search]);

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, value ? "0" : "1");
      } catch {
        // Préférence non mémorisée : sans conséquence.
      }
      return !value;
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(`${BASE}/login`, { replace: true });
  };

  const nav: NavItem[] = [
    { path: `${BASE}/dashboard`, label: "Tableau de bord", short: "Accueil", icon: LayoutDashboard },
    { path: `${BASE}/agenda`, label: "Agenda & contacts", short: "Agenda", icon: CalendarClock, count: counts?.tasksDue },
    { path: `${BASE}/biens`, label: "Biens", short: "Biens", icon: Building2 },
    { path: `${BASE}/blog`, label: "Blog", short: "Blog", icon: FileText },
    { path: `${BASE}/visites`, label: "Demandes de visite", short: "Visites", icon: CalendarCheck, count: counts?.pendingVisits },
    { path: `${BASE}/clients`, label: "Clients & demandes", short: "Clients", icon: UsersRound, count: counts?.followUps },
    { path: `${BASE}/documents`, label: "Contrats & reçus", short: "Contrats", icon: Files },
  ];
  const isActive = (path: string) => location.pathname.startsWith(path);
  const current = nav.find((item) => isActive(item.path));
  // nav : 0 accueil, 1 agenda, 2 biens, 3 blog, 4 visites, 5 clients, 6 contrats
  const tabs = [nav[0], nav[1], nav[2], nav[5]];
  const moreActive = !tabs.some((item) => isActive(item.path));

  const addActions = [
    { label: "Nouvelle tâche", icon: ListTodo, to: `${BASE}/agenda?new=1` },
    { label: "Nouveau contact", icon: UserPlus, to: `${BASE}/agenda?vue=contacts&contact=new` },
    { label: "Ajouter un bien", icon: Building2, to: `${BASE}/biens?new=1` },
    { label: "Ajouter un client", icon: UserPlus, to: `${BASE}/clients?new=1` },
    { label: "Nouvel article", icon: PenLine, to: `${BASE}/blog?new=1` },
  ];

  if (!session) return null;

  const email = session.user?.email ?? "";
  const initials = email ? email.split("@")[0].slice(0, 2).toUpperCase() : "LM";

  return (
    <div className="admin flex min-h-[100svh] bg-background text-foreground">
      {/* ── Desktop : barre latérale ── */}
      <aside className={cn("sticky top-0 hidden h-[100svh] shrink-0 flex-col border-r border-border bg-muted transition-[width] duration-200 lg:flex", collapsed ? "w-[72px]" : "w-[260px]")}>
        <Link to={`${BASE}/dashboard`} className={cn("flex h-[76px] shrink-0 items-center font-serif font-semibold text-foreground", collapsed ? "justify-center text-xl" : "px-6 text-2xl")}>
          {collapsed ? "LM" : "Live In Marrakech"}
        </Link>
        <nav aria-label="Navigation principale" className={cn("flex flex-1 flex-col gap-1 overflow-y-auto", collapsed ? "items-center px-2" : "px-3.5")}>
          {nav.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "relative flex min-h-11 items-center gap-3 rounded-md text-sm transition-colors",
                  collapsed ? "w-11 justify-center" : "px-2.5",
                  active ? "bg-[hsl(72_17%_87%)] font-semibold text-foreground" : "font-medium text-[hsl(36_8%_21%)] hover:bg-[hsl(39_35%_90%)]",
                )}
              >
                <item.icon size={18} strokeWidth={1.7} className="shrink-0" aria-hidden="true" />
                {collapsed ? (
                  !!item.count && <span className="absolute -right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-muted" aria-label={`${item.count} à traiter`} />
                ) : (
                  <>
                    <span className="flex-1">{item.label}</span>
                    <CountBadge count={item.count ?? 0} />
                  </>
                )}
              </Link>
            );
          })}
        </nav>
        <div className={cn("flex flex-col gap-1 border-t border-border py-3", collapsed ? "items-center px-2" : "px-3.5")}>
          <a href="/" target="_blank" rel="noopener noreferrer" title={collapsed ? "Voir le site" : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-md text-sm font-medium text-[hsl(36_8%_21%)] hover:bg-[hsl(39_35%_90%)]", collapsed ? "w-11 justify-center" : "px-2.5")}>
            <ExternalLink size={18} strokeWidth={1.7} aria-hidden="true" />{!collapsed && "Voir le site"}
          </a>
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-2.5 py-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-[hsl(72_19%_23%)]">{initials}</span>
              <span className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground" title={email}>{email}</span>
            </div>
          )}
          <button type="button" onClick={handleLogout} title={collapsed ? "Déconnexion" : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-md text-sm font-medium text-[hsl(36_8%_21%)] hover:bg-[hsl(39_35%_90%)] hover:text-destructive", collapsed ? "w-11 justify-center" : "px-2.5")}>
            <LogOut size={18} strokeWidth={1.7} aria-hidden="true" />{!collapsed && "Déconnexion"}
          </button>
          <button type="button" onClick={toggleCollapsed} aria-label={collapsed ? "Déplier le menu" : "Replier le menu"} className={cn("flex min-h-10 items-center gap-3 rounded-md text-[13px] font-medium text-muted-foreground hover:bg-[hsl(39_35%_90%)]", collapsed ? "w-11 justify-center" : "px-2.5")}>
            {collapsed ? <PanelLeftOpen size={18} strokeWidth={1.7} aria-hidden="true" /> : <><PanelLeftClose size={18} strokeWidth={1.7} aria-hidden="true" />Replier le menu</>}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ── Mobile : en-tête compact ── */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 pl-4 pr-1 backdrop-blur lg:hidden">
          <span className="truncate font-serif text-[22px] font-semibold leading-none">{current?.label ?? "Live In Marrakech"}</span>
          <a href="/" target="_blank" rel="noopener noreferrer" aria-label="Voir le site" className="grid h-11 w-11 shrink-0 place-items-center rounded-md text-[hsl(36_8%_21%)]">
            <ExternalLink size={20} strokeWidth={1.7} aria-hidden="true" />
          </a>
        </header>

        <main className="min-w-0 flex-1 pb-[calc(88px+env(safe-area-inset-bottom))] lg:pb-0">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile : bouton « + » (masqué sur les contrats, qui ont leur propre barre) ── */}
      {!location.pathname.startsWith(`${BASE}/documents`) && !location.pathname.startsWith(`${BASE}/agenda`) && <button
        type="button"
        onClick={() => setSheet("add")}
        aria-label="Ajouter"
        className="fixed bottom-[calc(80px+env(safe-area-inset-bottom))] right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-primary text-white shadow-[0_10px_24px_-10px_rgba(61,70,40,0.7)] lg:hidden"
      >
        <Plus size={24} strokeWidth={2} aria-hidden="true" />
      </button>}

      {/* ── Mobile : barre d'onglets ── */}
      <nav aria-label="Navigation principale" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
        {tabs.map((item) => {
          const active = isActive(item.path);
          return (
            <Link key={item.path} to={item.path} aria-current={active ? "page" : undefined} className={cn("relative flex h-16 flex-col items-center justify-center gap-1 text-xs", active ? "font-semibold text-primary" : "font-medium text-muted-foreground")}>
              {item.path.endsWith("dashboard") ? <Home size={22} strokeWidth={1.7} aria-hidden="true" /> : <item.icon size={22} strokeWidth={1.7} aria-hidden="true" />}
              {item.short}
              {!!item.count && <span className="absolute left-[calc(50%+6px)] top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold leading-none text-white">{item.count}</span>}
            </Link>
          );
        })}
        <button type="button" onClick={() => setSheet("more")} aria-expanded={sheet === "more"} className={cn("flex h-16 flex-col items-center justify-center gap-1 text-xs", moreActive ? "font-semibold text-primary" : "font-medium text-muted-foreground")}>
          <span className="relative">
            <Menu size={22} strokeWidth={1.7} aria-hidden="true" />
            {!!counts?.pendingVisits && <span className="absolute -right-1.5 -top-1 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-card" aria-label={`${counts.pendingVisits} visites en attente`} />}
          </span>
          Plus
        </button>
      </nav>

      <Sheet open={sheet !== null} onOpenChange={(open) => !open && setSheet(null)}>
        <SheetContent side="bottom" className="rounded-t-[14px] border-border bg-card px-4 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 lg:hidden [&>button]:hidden">
          <span aria-hidden="true" className="mx-auto mb-3 block h-1 w-10 rounded-full bg-input" />
          <SheetHeader className="mb-2 flex-row items-center justify-between space-y-0 text-left">
            <SheetTitle className="font-serif text-[22px] font-semibold">{sheet === "add" ? "Ajouter" : "Plus"}</SheetTitle>
            <button type="button" onClick={() => setSheet(null)} aria-label="Fermer" className="grid h-11 w-11 place-items-center rounded-md"><X size={20} aria-hidden="true" /></button>
          </SheetHeader>
          <SheetDescription className="sr-only">{sheet === "add" ? "Choisissez ce que vous voulez créer." : "Autres sections du back-office."}</SheetDescription>
          <div className="flex flex-col gap-1">
            {sheet === "add" && addActions.map((action) => (
              <Link key={action.to} to={action.to} className="flex min-h-[52px] items-center gap-3 rounded-md px-3 text-[15px] font-semibold hover:bg-muted">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-primary-soft text-[hsl(72_19%_23%)]"><action.icon size={18} strokeWidth={1.7} aria-hidden="true" /></span>{action.label}
              </Link>
            ))}
            {sheet === "more" && (
              <>
                {[nav[4], nav[3], nav[6]].map((item) => (
                  <Link key={item.path} to={item.path} className={cn("flex min-h-[52px] items-center gap-3 rounded-md px-3 text-[15px] hover:bg-muted", isActive(item.path) ? "font-semibold text-primary" : "font-medium")}>
                    <item.icon size={20} strokeWidth={1.7} aria-hidden="true" /><span className="flex-1">{item.label}</span><CountBadge count={item.count ?? 0} />
                  </Link>
                ))}
                <a href="/" target="_blank" rel="noopener noreferrer" className="flex min-h-[52px] items-center gap-3 rounded-md px-3 text-[15px] font-medium hover:bg-muted">
                  <ExternalLink size={20} strokeWidth={1.7} aria-hidden="true" />Voir le site
                </a>
                <div className="my-1 h-px bg-border" />
                <p className="truncate px-3 py-1 text-[13px] text-muted-foreground">{email}</p>
                <button type="button" onClick={handleLogout} className="flex min-h-[52px] items-center gap-3 rounded-md px-3 text-left text-[15px] font-semibold text-destructive hover:bg-muted">
                  <LogOut size={20} strokeWidth={1.7} aria-hidden="true" />Déconnexion
                </button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
