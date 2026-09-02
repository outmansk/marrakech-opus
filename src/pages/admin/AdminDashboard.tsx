import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Building2,
  FileText,
  TrendingUp,
  Plus,
  Sparkles,
  ArrowRight,
  Home,
  BookOpen,
  Eye,
  CalendarCheck,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { Bien } from '@/types/property';
import type { Article } from '@/types/article';
import type { Tables } from '@/integrations/supabase/types';
import OptimizedImage from '@/components/ui/OptimizedImage';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

// ─── Palette olive / bronze / terracotta ────────────────────────────────────
const COLORS = {
  olive:      'hsl(82 15% 37%)',
  bronze:     'hsl(30 30% 45%)',
  terracotta: 'hsl(15 40% 55%)',
  muted:      'hsl(30 10% 75%)',
  soft:       'hsl(40 20% 92%)',
};

const TYPE_COLORS: Record<string, string> = {
  villa:       COLORS.olive,
  riad:        COLORS.bronze,
  appartement: COLORS.terracotta,
  maison:      COLORS.muted,
  terrain:     'hsl(82 15% 60%)',
};

const SERVICE_COLORS: Record<string, string> = {
  vente:                  COLORS.olive,
  'location-longue-duree': COLORS.bronze,
  'location-courte-duree': COLORS.terracotta,
  'sous-location':         COLORS.muted,
};

// ─── Greeting ─────────────────────────────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

// ─── Stat Card — Premium ────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'olive',
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  color?: 'olive' | 'bronze' | 'terracotta';
  delay?: number;
}) {
  const gradients = {
    olive:      'from-[hsl(82_15%_37%)] to-[hsl(82_15%_47%)]',
    bronze:     'from-[hsl(30_30%_45%)] to-[hsl(30_30%_55%)]',
    terracotta: 'from-[hsl(15_40%_55%)] to-[hsl(15_40%_65%)]',
  };

  const bgGlow = {
    olive:      'bg-[hsl(82_15%_37%/0.08)]',
    bronze:     'bg-[hsl(30_30%_45%/0.08)]',
    terracotta: 'bg-[hsl(15_40%_55%/0.08)]',
  };

  return (
    <div
      className="admin-card admin-stat rounded-xl p-5 flex items-start gap-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn(
        "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 admin-icon-glow",
        bgGlow[color]
      )}>
        <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center", gradients[color])}>
          <Icon size={16} strokeWidth={1.5} className="text-white" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1.5 font-sans">{label}</p>
        <p className="font-serif text-3xl leading-none admin-count-up">{value}</p>
        {sub && (
          <p className="text-[11px] text-muted-foreground mt-1.5 font-light flex items-center gap-1">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Recent Table Row — Card style ──────────────────────────────────────────
function RecentBienRow({ bien }: { bien: Bien }) {
  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    publie:      { bg: 'bg-emerald-500/10', text: 'text-emerald-600', dot: 'bg-emerald-500' },
    brouillon:   { bg: 'bg-amber-500/10', text: 'text-amber-600', dot: 'bg-amber-500' },
    'vendu-loue': { bg: 'bg-rose-500/10', text: 'text-rose-600', dot: 'bg-rose-500' },
  };

  const status = statusConfig[bien.statut] ?? statusConfig.brouillon;
  const main = bien.prix_vente ?? bien.prix_location_longue ?? bien.prix_location_courte ?? null;

  return (
    <Link
      to="/manage-xk92p/biens"
      className="flex items-center gap-4 p-3.5 hover:bg-muted/30 transition-all duration-200 group rounded-lg"
    >
      <div className="w-14 h-11 bg-muted/50 shrink-0 overflow-hidden rounded-lg ring-1 ring-border/50">
        {bien.photo_principale ? (
          <OptimizedImage src={bien.photo_principale} alt={bien.titre} size="thumb" className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home size={14} className="text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{bien.titre}</p>
        <p className="text-xs text-muted-foreground capitalize">{bien.type} · {bien.quartier}</p>
      </div>
      {main && (
        <p className="text-xs font-medium shrink-0 tabular-nums">
          {main.toLocaleString('fr-MA')} {bien.devise}
        </p>
      )}
      <span className={cn(
        "text-[10px] tracking-widest uppercase px-2.5 py-1 shrink-0 rounded-full flex items-center gap-1.5 font-medium",
        status.bg, status.text
      )}>
        <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
        {bien.statut === 'vendu-loue' ? 'Vendu' : bien.statut}
      </span>
      <ArrowRight size={14} className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
    </Link>
  );
}

function RecentArticleRow({ article }: { article: Article }) {
  return (
    <Link
      to="/manage-xk92p/blog"
      className="flex items-center gap-4 p-3.5 hover:bg-muted/30 transition-all duration-200 group rounded-lg"
    >
      <div className="w-14 h-11 bg-muted/50 shrink-0 overflow-hidden rounded-lg ring-1 ring-border/50">
        {article.image_url ? (
          <OptimizedImage src={article.image_url} alt={article.title} size="thumb" className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={14} className="text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{article.title}</p>
        <p className="text-xs text-muted-foreground capitalize">{article.category}</p>
      </div>
      <span className={cn(
        "text-[10px] tracking-widest uppercase px-2.5 py-1 shrink-0 rounded-full flex items-center gap-1.5 font-medium",
        article.est_publie
          ? 'bg-emerald-500/10 text-emerald-600'
          : 'bg-muted text-muted-foreground'
      )}>
        <span className={cn("w-1.5 h-1.5 rounded-full", article.est_publie ? 'bg-emerald-500' : 'bg-muted-foreground/40')} />
        {article.est_publie ? 'Publié' : 'Brouillon'}
      </span>
      <ArrowRight size={14} className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
    </Link>
  );
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
interface TooltipEntry {
  name?: string;
  value?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="admin-tooltip px-4 py-3">
      <p className="text-[11px] font-medium text-foreground capitalize mb-1">{payload[0]?.name || label}</p>
      <p className="text-lg font-serif text-foreground">{payload[0]?.value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">biens</p>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [biens, setBiens] = useState<Bien[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [visites, setVisites] = useState<Pick<Tables<'visit_requests'>, 'id' | 'status'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: b, error: bErr }, { data: a, error: aErr }, { data: v, error: vErr }] = await Promise.all([
          supabase.from('properties_v2').select('*').order('created_at', { ascending: false }),
          supabase.from('articles').select('*').order('created_at', { ascending: false }),
          supabase.from('visit_requests').select('id, status').order('created_at', { ascending: false }),
        ]);
        if (bErr) throw bErr;
        if (aErr) throw aErr;
        if (vErr) throw vErr;
        if (b) setBiens(b as Bien[]);
        if (a) setArticles(a as Article[]);
        if (v) setVisites(v);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        toast.error('Erreur lors du chargement des données.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalBiens    = biens.length;
  const publies       = biens.filter(b => b.statut === 'publie').length;
  const totalArticles = articles.length;
  const articlesPubl  = articles.filter(a => a.est_publie).length;
  const visitesEnAttente = visites.filter(v => v.status === 'en-attente').length;

  // ── Chart data: répartition par type ───────────────────────────────────────
  const typeCount: Record<string, number> = {};
  biens.forEach(b => { typeCount[b.type] = (typeCount[b.type] ?? 0) + 1; });
  const typeData = Object.entries(typeCount).map(([name, value]) => ({ name, value }));

  // ── Chart data: répartition par service ────────────────────────────────────
  const serviceCount: Record<string, number> = {};
  biens.forEach(b => {
    b.services?.forEach(s => {
      serviceCount[s] = (serviceCount[s] ?? 0) + 1;
    });
  });
  const serviceData = Object.entries(serviceCount).map(([name, value]) => ({
    name: name.replace('location-', 'loc. ').replace('-duree', ''),
    fullName: name,
    value,
  }));

  const recentBiens    = biens.slice(0, 5);
  const recentArticles = articles.slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-6 md:px-10 py-8 space-y-8 flex-1 overflow-y-auto">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-sans">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground">
            {getGreeting()} 👋
          </h2>
          <p className="text-sm text-muted-foreground font-light mt-1">
            Voici un aperçu de votre activité
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button
            size="sm"
            className="gap-2 rounded-lg h-9 px-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm hover:shadow-md transition-all"
            onClick={() => navigate('/manage-xk92p/biens')}
          >
            <Plus size={14} />
            <span className="text-[11px] tracking-wide">{t('admin.ajouter_bien')}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-lg h-9 px-4 border-border/60 hover:bg-muted/50 hover:border-primary/30 transition-all"
            onClick={() => navigate('/manage-xk92p/blog')}
          >
            <Sparkles size={14} />
            <span className="text-[11px] tracking-wide">{t('admin.generer_article')}</span>
          </Button>
        </div>
      </div>

      {/* ── Stats Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Building2}
          label={t('admin.stats.total_biens')}
          value={totalBiens}
          color="olive"
          delay={0}
        />
        <StatCard
          icon={Eye}
          label={t('admin.stats.biens_publies')}
          value={publies}
          sub={`${totalBiens > 0 ? Math.round((publies / totalBiens) * 100) : 0}% du total`}
          color="bronze"
          delay={80}
        />
        <StatCard
          icon={CalendarCheck}
          label={t('admin.stats.visites') || "Demandes de visites"}
          value={visites.length}
          sub={visitesEnAttente > 0 ? `${visitesEnAttente} en attente` : 'Aucune en attente'}
          color="bronze"
          delay={160}
        />
        <StatCard
          icon={FileText}
          label={t('admin.stats.total_articles')}
          value={totalArticles}
          color="terracotta"
          delay={240}
        />
        <StatCard
          icon={TrendingUp}
          label={t('admin.stats.articles_publies')}
          value={articlesPubl}
          sub={`${totalArticles > 0 ? Math.round((articlesPubl / totalArticles) * 100) : 0}% du total`}
          color="olive"
          delay={320}
        />
      </div>

      {/* ── Charts ──────────────────────────────────────────────────────── */}
      {biens.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Donut: types de biens */}
          <div className="admin-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-sans">
                Répartition par type
              </p>
              <span className="text-[10px] text-muted-foreground/60 tabular-nums">{totalBiens} biens</span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={typeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={50}
                  paddingAngle={4}
                  strokeWidth={0}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {typeData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={TYPE_COLORS[entry.name] ?? COLORS.muted}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar: services */}
          <div className="admin-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-sans">
                Répartition par service
              </p>
              <span className="text-[10px] text-muted-foreground/60 tabular-nums">{Object.values(serviceCount).reduce((a, b) => a + b, 0)} total</span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={serviceData} margin={{ left: -20, right: 10, top: 5, bottom: 5 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: 'hsl(0 0% 45%)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(0 0% 45%)' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" maxBarSize={44} radius={[6, 6, 0, 0]}>
                  {serviceData.map((entry) => (
                    <Cell
                      key={entry.fullName}
                      fill={SERVICE_COLORS[entry.fullName] ?? COLORS.muted}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Recents ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Derniers biens */}
        <div className="admin-card rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
                <Building2 size={13} strokeWidth={1.5} className="text-primary" />
              </div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-sans">
                Derniers biens
              </p>
            </div>
            <Link
              to="/manage-xk92p/biens"
              className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors group"
            >
              Voir tout 
              <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          <div className="divide-y divide-border/30 px-2">
            {recentBiens.length > 0
              ? recentBiens.map(b => <RecentBienRow key={b.id} bien={b} />)
              : <p className="py-10 text-center text-sm text-muted-foreground font-light">Aucun bien</p>
            }
          </div>
        </div>

        {/* Derniers articles */}
        <div className="admin-card rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-accent/8 flex items-center justify-center">
                <FileText size={13} strokeWidth={1.5} className="text-accent" />
              </div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-sans">
                Derniers articles
              </p>
            </div>
            <Link
              to="/manage-xk92p/blog"
              className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors group"
            >
              Voir tout 
              <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          <div className="divide-y divide-border/30 px-2">
            {recentArticles.length > 0
              ? recentArticles.map(a => <RecentArticleRow key={a.id} article={a} />)
              : <p className="py-10 text-center text-sm text-muted-foreground font-light">Aucun article</p>
            }
          </div>
        </div>
      </div>
    </main>
  );
}
