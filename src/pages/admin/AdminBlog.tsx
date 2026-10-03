import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useArticles, useDeleteArticle, useToggleArticleStatus } from '@/hooks/useArticles';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArticleForm } from '@/components/admin/ArticleForm';
import { Article } from '@/types/article';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ExternalLink, 
  FileText,
  Eye,
  EyeOff,
  LayoutGrid
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { cn } from '@/lib/utils';

export default function AdminBlog() {
  const { data: articles, isLoading } = useArticles();
  const deleteArticle = useDeleteArticle();
  const toggleStatus = useToggleArticleStatus();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | undefined>(undefined);

  const filteredArticles = articles?.filter(article => {
    const searchLower = (searchTerm || '').toLowerCase();
    return (
      (article.title?.toLowerCase() || '').includes(searchLower) ||
      (article.category?.toLowerCase() || '').includes(searchLower)
    );
  }) || [];

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setIsSheetOpen(true);
  };

  const handleClose = () => {
    setEditingArticle(undefined);
    setIsSheetOpen(false);
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleStatus.mutate({ id, est_publie: !currentStatus });
  };

  if (isLoading) {
    return (
      <main className="container mx-auto w-full min-w-0 px-3 sm:px-6 md:px-10 py-4 sm:py-6 md:py-8 space-y-5 md:space-y-6 flex-1">
        <div className="flex justify-between items-center">
          <div className="h-10 w-48 rounded-lg shimmer-admin" />
          <div className="h-10 w-32 rounded-lg shimmer-admin" />
        </div>
        <div className="admin-card rounded-xl p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 w-full rounded-lg shimmer-admin" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto w-full min-w-0 px-3 sm:px-6 md:px-10 py-4 sm:py-6 md:py-8 space-y-5 md:space-y-6 flex-1">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-accent/8 flex items-center justify-center">
              <FileText className="h-4 w-4 text-accent" strokeWidth={1.5} />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl">Gestion du Blog</h2>
          </div>
          <p className="text-sm text-muted-foreground font-light ml-[42px]">
            Créez et gérez vos articles SEO pour Live In Marrakech.
          </p>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              onClick={() => setEditingArticle(undefined)}
              className="w-full md:w-auto h-10 px-5 rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm hover:shadow-md transition-all gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="text-[12px] tracking-wide">Nouvel Article</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full max-w-none sm:max-w-2xl overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>
                {editingArticle ? 'Modifier l\'article' : 'Créer un nouvel article'}
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-120px)] pr-4">
              <ArticleForm 
                article={editingArticle} 
                onSuccess={handleClose} 
              />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {/* ── Search ── */}
      <div className="admin-card rounded-xl p-1.5 flex items-center">
        <div className="flex items-center gap-2.5 px-3 flex-1">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Rechercher par titre ou catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0 shadow-none h-10 text-sm"
          />
        </div>
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg mr-1 text-muted-foreground hover:text-foreground"
            onClick={() => setSearchTerm('')}
          >
            <span className="text-xs">✕</span>
          </Button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="space-y-3 md:hidden">
        {filteredArticles?.length === 0 ? <div className="admin-card rounded-xl p-8 text-center text-sm text-muted-foreground">Aucun article trouvé.</div> : filteredArticles?.map((article) => (
          <article key={article.id} className="admin-card min-w-0 space-y-3 rounded-xl p-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted/40">{article.image_url ? <OptimizedImage src={article.image_url} alt={article.title} size="thumb" className="h-full w-full object-cover" wrapperClassName="h-full w-full" /> : <div className="grid h-full w-full place-items-center"><FileText className="h-5 w-5 text-muted-foreground/40" /></div>}</div>
              <div className="min-w-0 flex-1"><h3 className="line-clamp-2 font-medium text-sm">{article.title}</h3><p className="mt-1 truncate text-[11px] text-muted-foreground">/{article.slug}</p><p className="mt-1 text-[11px] text-muted-foreground">{new Date(article.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</p></div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3"><Badge variant="outline" className="max-w-full truncate capitalize text-[10px]">{article.category?.replace(/-/g, ' ')}</Badge><span className={cn("rounded-full px-2.5 py-1 text-[9px] font-medium uppercase tracking-wide", article.est_publie ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground')}>{article.est_publie ? "Publié" : "Brouillon"}</span></div>
            <div className="grid grid-cols-[1fr_1fr_44px_44px] gap-1.5 sm:gap-2">
              <Button type="button" variant="outline" aria-label={article.est_publie ? "Passer en brouillon" : "Publier l’article"} className="min-h-11 min-w-0 gap-1 px-1.5 text-[10px] sm:gap-1.5 sm:px-2 sm:text-xs" onClick={() => handleToggleStatus(article.id, article.est_publie)}>{article.est_publie ? <EyeOff size={14} /> : <Eye size={14} />}<span className="hidden min-[380px]:inline">{article.est_publie ? "Brouillon" : "Publier"}</span></Button>
              <Button type="button" variant="outline" aria-label="Modifier l’article" className="min-h-11 min-w-0 gap-1 px-1.5 text-[10px] sm:gap-1.5 sm:px-2 sm:text-xs" onClick={() => handleEdit(article)}><Edit size={14} /><span className="hidden min-[380px]:inline">Modifier</span></Button>
              <Button type="button" variant="outline" size="icon" className="h-11 w-11" asChild><a aria-label="Voir l’article" href={`/blog/${article.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} /></a></Button>
              <AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="outline" size="icon" className="h-11 w-11 text-destructive" aria-label="Supprimer l’article"><Trash2 size={15} /></Button></AlertDialogTrigger><AlertDialogContent className="w-[calc(100vw-1.5rem)] max-w-lg rounded-xl"><AlertDialogHeader><AlertDialogTitle>Supprimer l'article ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible. L'article "{article.title}" sera supprimé de la base de données.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="min-h-11 rounded-lg">Annuler</AlertDialogCancel><AlertDialogAction className="min-h-11 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteArticle.mutate(article.id)}>Supprimer</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden md:block admin-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/40">
              <TableHead className="w-[450px] text-[10px] tracking-[0.2em] uppercase font-sans py-3.5">Article</TableHead>
              <TableHead className="text-[10px] tracking-[0.2em] uppercase font-sans">Catégorie</TableHead>
              <TableHead className="text-[10px] tracking-[0.2em] uppercase font-sans">Statut</TableHead>
              <TableHead className="text-[10px] tracking-[0.2em] uppercase font-sans">Date</TableHead>
              <TableHead className="text-right text-[10px] tracking-[0.2em] uppercase font-sans pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArticles?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-muted-foreground/40" strokeWidth={1.5} />
                    </div>
                    <p className="text-muted-foreground font-light text-sm">Aucun article trouvé.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredArticles?.map((article) => (
                <TableRow key={article.id} className="hover:bg-muted/20 transition-colors group border-b border-border/30">
                  <TableCell>
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-xl bg-muted/30 flex-shrink-0 overflow-hidden ring-1 ring-border/40 group-hover:ring-primary/20 transition-all">
                        {article.image_url ? (
                          <OptimizedImage 
                            src={article.image_url} 
                            alt={article.title} 
                            size="thumb"
                            className="w-full h-full object-cover"
                            wrapperClassName="w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-muted-foreground/30" strokeWidth={1.5} />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col py-1">
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">{article.title}</span>
                        <span className="text-[11px] text-muted-foreground font-mono mt-0.5">/{article.slug}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize font-medium text-[10px] h-6 px-2.5 rounded-full border-border/40">
                      {article.category?.replace(/-/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 font-medium",
                      article.est_publie
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", article.est_publie ? 'bg-emerald-500' : 'bg-muted-foreground/40')} />
                      {article.est_publie ? "Publié" : "Brouillon"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {new Date(article.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex justify-end items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                        onClick={() => handleToggleStatus(article.id, article.est_publie)}
                        title={article.est_publie ? "Passer en brouillon" : "Publier"}
                      >
                        {article.est_publie ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                        onClick={() => handleEdit(article)}
                      >
                        <Edit className="h-4 w-4" strokeWidth={1.5} />
                      </Button>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                        asChild
                      >
                        <a href={`/blog/${article.slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                        </a>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive/50 hover:text-destructive hover:bg-destructive/8 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer l'article ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. L'article "{article.title}" sera définitivement supprimé de la base de données.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-lg">Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg"
                              onClick={() => deleteArticle.mutate(article.id)}
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
