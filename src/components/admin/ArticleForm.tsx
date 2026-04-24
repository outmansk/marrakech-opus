import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Article } from '@/types/article';
import { useCreateArticle, useUpdateArticle } from '@/hooks/useArticles';
import { Button } from '@/components/ui/button';
import DOMPurify from 'dompurify';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Code } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from 'react';

const articleSchema = z.object({
  title: z.string().min(5, 'Le titre doit faire au moins 5 caractères').transform(v => DOMPurify.sanitize(v)),
  slug: z.string().min(3, 'Le slug est requis (ex: mon-bel-article)').transform(v => DOMPurify.sanitize(v)),
  category: z.enum(['location-longue-duree', 'sous-location', 'vente', 'terrain']),
  content: z.string().min(20, 'Le contenu est trop court').transform(v => DOMPurify.sanitize(v)),
  excerpt: z.string().optional().transform(v => v ? DOMPurify.sanitize(v) : v),
  image_url: z.string().url('URL d\'image invalide').optional().or(z.literal('')).transform(v => v ? DOMPurify.sanitize(v) : v),
  meta_title: z.string().optional().transform(v => v ? DOMPurify.sanitize(v) : v),
  meta_description: z.string().optional().transform(v => v ? DOMPurify.sanitize(v) : v),
  est_publie: z.boolean().default(false),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  article?: Article;
  onSuccess: () => void;
}

export function ArticleForm({ article, onSuccess }: ArticleFormProps) {
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const [isJsonImportOpen, setIsJsonImportOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      form.reset({
        ...form.getValues(),
        ...parsed
      });
      setIsJsonImportOpen(false);
      setJsonInput('');
    } catch (e) {
      alert("JSON invalide. Veuillez vérifier le format.");
    }
  };

  const articleTemplate = JSON.stringify({
    title: "Comment bien vendre son bien à Marrakech",
    slug: "comment-vendre-bien-marrakech",
    category: "vente",
    excerpt: "Découvrez nos conseils d'experts pour vendre rapidement.",
    content: "Voici les étapes clés pour réussir votre vente immobilière...\n\n1. Estimation\n2. Mise en valeur\n3. Visites",
    image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
    meta_title: "Conseils Vente Immobilière Marrakech | Live In Marrakech",
    meta_description: "Guide complet pour vendre votre propriété au meilleur prix à Marrakech.",
    est_publie: true
  }, null, 2);

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: article?.title || '',
      slug: article?.slug || '',
      category: article?.category || 'vente',
      content: article?.content || '',
      excerpt: article?.excerpt || '',
      image_url: article?.image_url || '',
      meta_title: article?.meta_title || '',
      meta_description: article?.meta_description || '',
      est_publie: article?.est_publie || false,
    },
  });

  // Auto-generate slug from title
  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue('title', title);
    if (!article) { // Only auto-slug for new articles
      const slug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      form.setValue('slug', slug);
    }
  };

  const onSubmit = async (data: ArticleFormValues) => {
    if (article) {
      await updateArticle.mutateAsync({ id: article.id, ...data });
    } else {
      await createArticle.mutateAsync(data);
    }
    onSuccess();
  };

  const isPending = createArticle.isPending || updateArticle.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-10">
        <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg border border-border/50">
          <div>
            <h3 className="text-sm font-medium">Saisie rapide</h3>
            <p className="text-xs text-muted-foreground">Importer les données de l'article via un code JSON</p>
          </div>
          <Dialog open={isJsonImportOpen} onOpenChange={setIsJsonImportOpen}>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              onClick={() => setIsJsonImportOpen(true)}
              className="gap-2"
            >
              <Code className="h-4 w-4" />
              Importer JSON
            </Button>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Importer un Article (JSON)</DialogTitle>
                <DialogDescription>
                  Collez le code JSON pour remplir automatiquement les champs de l'article.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Textarea 
                  placeholder='{ "title": "...", "content": "...", ... }'
                  className="font-mono text-xs min-h-[300px]"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                />
                <div className="bg-muted p-2 rounded text-[10px] text-muted-foreground overflow-auto max-h-32">
                  <strong>Format attendu :</strong>
                  <pre className="mt-1">{articleTemplate}</pre>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsJsonImportOpen(false)}>Annuler</Button>
                <Button onClick={handleJsonImport}>Appliquer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre de l'article</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: Guide de l'expatriation à Marrakech" 
                    {...field} 
                    onChange={onTitleChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug (URL)</FormLabel>
                <FormControl>
                  <Input placeholder="ex: guide-expatriation-marrakech" {...field} />
                </FormControl>
                <FormDescription>Utilisé pour l'adresse de l'article</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="location-longue-duree">Location Longue Durée</SelectItem>
                    <SelectItem value="sous-location">Sous-location</SelectItem>
                    <SelectItem value="vente">Vente</SelectItem>
                    <SelectItem value="terrain">Terrain</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL de l'image de couverture</FormLabel>
                <FormControl>
                  <Input placeholder="https://images.unsplash.com/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Résumé court (Extrait)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Bref résumé qui apparaîtra sur la liste du blog..." 
                  className="h-20"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenu de l'article (Markdown supporté)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Rédigez votre article ici..." 
                  className="h-80 font-mono text-sm"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="bg-muted/30 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground border-b pb-2">SEO & Métadonnées</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="meta_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre pour Google" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="meta_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Description pour Google" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="est_publie"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/20">
              <div className="space-y-0.5">
                <FormLabel className="text-base font-semibold">Publier l'article</FormLabel>
                <FormDescription>
                  L'article sera visible immédiatement par tout le monde.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-12 text-lg" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Save className="mr-2 h-5 w-5" />
          )}
          {article ? 'Mettre à jour l\'article' : 'Créer l\'article'}
        </Button>
      </form>
    </Form>
  );
}
