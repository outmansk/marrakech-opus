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
  LogOut,
  LayoutGrid
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

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
      <main className="container mx-auto px-6 md:px-12 py-8 space-y-6 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="border border-border bg-card rounded-lg p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full mb-4" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-6 md:px-12 py-8 space-y-8 flex-1 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
            <div>
              <h2 className="font-serif text-2xl">Gestion du Blog</h2>
              <p className="text-sm text-muted-foreground">Créez et gérez vos articles SEO pour Live In Marrakech.</p>
            </div>
          </div>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button onClick={() => setEditingArticle(undefined)} className="w-full md:w-auto h-11 px-6">
                <Plus className="mr-2 h-4 w-4" />
                Nouvel Article
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
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

        <div className="flex items-center space-x-2 bg-muted/30 p-2 rounded-lg border focus-within:ring-1 focus-within:ring-ring transition-all">
          <Search className="h-4 w-4 text-muted-foreground ml-2" />
          <Input
            placeholder="Rechercher par titre ou catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0 shadow-none h-10"
          />
        </div>

        <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[450px] text-xs uppercase tracking-widest py-4">Article</TableHead>
                <TableHead className="text-xs uppercase tracking-widest">Catégorie</TableHead>
                <TableHead className="text-xs uppercase tracking-widest">Statut</TableHead>
                <TableHead className="text-xs uppercase tracking-widest">Date</TableHead>
                <TableHead className="text-right text-xs uppercase tracking-widest pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Aucun article trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                filteredArticles?.map((article) => (
                  <TableRow key={article.id} className="hover:bg-muted/30 transition-colors group">
                    <TableCell>
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-lg bg-muted flex-shrink-0 overflow-hidden border shadow-sm group-hover:scale-105 transition-transform">
                          {article.image_url ? (
                            <img 
                              src={article.image_url} 
                              alt={article.title} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-100">
                              <FileText className="w-6 h-6 text-zinc-400" strokeWidth={1.5} />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col py-1">
                          <span className="font-semibold text-zinc-900 group-hover:text-primary transition-colors line-clamp-1">{article.title}</span>
                          <span className="text-[11px] text-muted-foreground font-mono mt-0.5">/{article.slug}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize font-medium text-[11px] h-6 px-2.5">
                        {article.category?.replace(/-/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={article.est_publie ? "default" : "secondary"}
                        className={`text-[11px] font-semibold h-6 px-2.5 ${
                          article.est_publie 
                          ? "bg-green-50 text-green-700 hover:bg-green-100 border-green-200" 
                          : "bg-zinc-100 text-zinc-600 border-zinc-200"
                        }`}
                      >
                        {article.est_publie ? "Publié" : "Brouillon"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground tabular-nums">
                      {new Date(article.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex justify-end items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:text-foreground"
                          onClick={() => handleToggleStatus(article.id, article.est_publie)}
                          title={article.est_publie ? "Passer en brouillon" : "Publier"}
                        >
                          {article.est_publie ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-muted-foreground hover:text-foreground"
                          onClick={() => handleEdit(article)}
                        >
                          <Edit className="h-4 w-4" strokeWidth={1.5} />
                        </Button>

                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-muted-foreground hover:text-foreground"
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
                              className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer l'article ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. L'article "{article.title}" sera définitivement supprimé de la base de données.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
