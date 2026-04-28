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
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import type { Bien } from '@/types/property';
import type { Article } from '@/types/article';
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

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'olive',
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  color?: 'olive' | 'bronze' | 'terracotta';
}) {
  const accent = {
    olive:      'border-l-[hsl(82_15%_37%)]',
    bronze:     'border-l-[hsl(30_30%_45%)]',
    terracotta: 'border-l-[hsl(15_40%_55%)]',
  }[color];

  return (
    <div className={`bg-card border border-border border-l-4 ${accent} p-6 flex items-start gap-4`}>
      <div className="w-10 h-10 bg-secondary flex items-center justify-center shrink-0">
        <Icon size={18} strokeWidth={1.25} className="text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">{label}</p>
        <p className="font-serif text-3xl leading-none">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1 font-light">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Recent Table Row ─────────────────────────────────────────────────────────
function RecentBienRow({ bien }: { bien: Bien }) {
  const statusColors: Record<string, string> = {
    publie:      'bg-[hsl(82_15%_37%)/15] text-[hsl(82_15%_37%)]',
    brouillon:   'bg-secondary text-muted-foreground',
    'vendu-loue':'bg-[hsl(15_40%_55%)/15] text-[hsl(15_40%_55%)]',
  };

  const main = bien.prix_vente ?? bien.prix_location_longue ?? bien.prix_location_courte ?? null;

  return (
    <Link
      to="/manage-xk92p/biens"
      className="flex items-center gap-4 p-3 hover:bg-muted/40 transition-colors group"
    >
      <div className="w-12 h-10 bg-muted shrink-0 overflow-hidden">
        {bien.photo_principale ? (
          <OptimizedImage src={bien.photo_principale} alt={bien.titre} size="thumb" className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home size={14} className="text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{bien.titre}</p>
        <p className="text-xs text-muted-foreground capitalize">{bien.type} · {bien.quartier}</p>
      </div>
      {main && (
        <p className="text-xs font-medium shrink-0">
          {main.toLocaleString('fr-MA')} {bien.devise}
        </p>
      )}
      <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 shrink-0 ${statusColors[bien.statut] ?? 'bg-secondary text-muted-foreground'}`}>
        {bien.statut}
      </span>
      <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </Link>
  );
}

function RecentArticleRow({ article }: { article: Article }) {
  return (
    <Link
      to="/manage-xk92p/blog"
      className="flex items-center gap-4 p-3 hover:bg-muted/40 transition-colors group"
    >
      <div className="w-12 h-10 bg-muted shrink-0 overflow-hidden">
        {article.image_url ? (
          <OptimizedImage src={article.image_url} alt={article.title} size="thumb" className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={14} className="text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{article.title}</p>
        <p className="text-xs text-muted-foreground capitalize">{article.category}</p>
      </div>
      <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 shrink-0 ${
        article.est_publie
          ? 'bg-[hsl(82_15%_37%)/15] text-[hsl(82_15%_37%)]'
          : 'bg-secondary text-muted-foreground'
      }`}>
        {article.est_publie ? 'Publié' : 'Brouillon'}
      </span>
      <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </Link>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [biens, setBiens] = useState<Bien[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [{ data: b }, { data: a }] = await Promise.all([
        supabase.from('properties_v2').select('*').order('created_at', { ascending: false }),
        supabase.from('articles').select('*').order('created_at', { ascending: false }),
      ]);
      if (b) setBiens(b as Bien[]);
      if (a) setArticles(a as Article[]);
      setLoading(false);
    };
    fetch();
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalBiens    = biens.length;
  const publies       = biens.filter(b => b.statut === 'publie').length;
  const totalArticles = articles.length;
  const articlesPubl  = articles.filter(a => a.est_publie).length;

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
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-6 md:px-12 py-8 space-y-10 flex-1 overflow-y-auto">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LayoutDashboard size={20} className="text-muted-foreground" strokeWidth={1.5} />
          <div>
            <h2 className="font-serif text-2xl">{t('admin.tableau_bord')}</h2>
            <p className="text-sm text-muted-foreground font-light">Vue d'ensemble de l'activité</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="luxury"
            size="sm"
            className="gap-2"
            onClick={() => navigate('/manage-xk92p/biens')}
          >
            <Plus size={14} />
            {t('admin.ajouter_bien')}
          </Button>
          <Button
            variant="luxury-ghost"
            size="sm"
            className="gap-2"
            onClick={() => navigate('/manage-xk92p/blog')}
          >
            <Sparkles size={14} />
            {t('admin.generer_article')}
          </Button>
        </div>
      </div>

      {/* ── Stats Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label={t('admin.stats.total_biens')}
          value={totalBiens}
          color="olive"
        />
        <StatCard
          icon={Eye}
          label={t('admin.stats.biens_publies')}
          value={publies}
          sub={`${totalBiens > 0 ? Math.round((publies / totalBiens) * 100) : 0}% du total`}
          color="bronze"
        />
        <StatCard
          icon={FileText}
          label={t('admin.stats.total_articles')}
          value={totalArticles}
          color="terracotta"
        />
        <StatCard
          icon={TrendingUp}
          label={t('admin.stats.articles_publies')}
          value={articlesPubl}
          sub={`${totalArticles > 0 ? Math.round((articlesPubl / totalArticles) * 100) : 0}% du total`}
          color="olive"
        />
      </div>

      {/* ── Charts ──────────────────────────────────────────────────────── */}
      {biens.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie: types de biens */}
          <div className="bg-card border border-border p-6">
            <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-6">
              Répartition par type de bien
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={typeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={3}
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
                <Tooltip
                  contentStyle={{ border: '1px solid hsl(30 15% 88%)', borderRadius: 0 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar: services */}
          <div className="bg-card border border-border p-6">
            <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-6">
              Répartition par service
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={serviceData} margin={{ left: -20, right: 10 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, textTransform: 'uppercase', fill: 'hsl(0 0% 40%)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(0 0% 40%)' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ border: '1px solid hsl(30 15% 88%)', borderRadius: 0 }}
                  cursor={{ fill: 'hsl(30 10% 94%)' }}
                />
                <Bar dataKey="value" maxBarSize={40} radius={0}>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Derniers biens */}
        <div className="bg-card border border-border">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
              5 derniers biens
            </p>
            <Link
              to="/manage-xk92p/biens"
              className="flex items-center gap-1 text-[10px] tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentBiens.length > 0
              ? recentBiens.map(b => <RecentBienRow key={b.id} bien={b} />)
              : <p className="py-8 text-center text-sm text-muted-foreground font-light">Aucun bien</p>
            }
          </div>
        </div>

        {/* Derniers articles */}
        <div className="bg-card border border-border">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
              5 derniers articles
            </p>
            <Link
              to="/manage-xk92p/blog"
              className="flex items-center gap-1 text-[10px] tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentArticles.length > 0
              ? recentArticles.map(a => <RecentArticleRow key={a.id} article={a} />)
              : <p className="py-8 text-center text-sm text-muted-foreground font-light">Aucun article</p>
            }
          </div>
        </div>
      </div>
    </main>
  );
}
