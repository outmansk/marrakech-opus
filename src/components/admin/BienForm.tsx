import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, X, Plus, Star, Upload, Trash2, MapPin, Code, ArrowLeft, ArrowRight } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';

import { useCreateProperty, useUpdateProperty } from '@/hooks/useBiens';
import {
  BIEN_TYPES,
  BIEN_SERVICES,
  BIEN_STATUTS,
  BIEN_DEVISES,
  QUARTIERS,
  EQUIPEMENTS_LIST,
  type Bien,
  type BienInsert,
} from '@/types/property';
import { cn } from '@/lib/utils';

// ─── Schema Zod ──────────────────────────────────────────────────────────────
const bienSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis'),
  reference: z.string().optional(),
  type: z.enum(['villa', 'appartement', 'riad', 'maison', 'terrain']),
  services: z.array(z.enum(['location-longue-duree', 'location-courte-duree', 'vente', 'sous-location'])).min(1, 'Sélectionnez au moins un service'),
  statut: z.enum(['publie', 'brouillon', 'vendu-loue']).default('brouillon'),
  prix_vente: z.coerce.number().nullable().optional(),
  prix_location_longue: z.coerce.number().nullable().optional(),
  prix_location_courte: z.coerce.number().nullable().optional(),
  prix: z.coerce.number().nullable().optional(),
  devise: z.enum(['MAD', 'EUR']).default('MAD'),
  surface_habitable: z.coerce.number().nullable().optional(),
  surface_terrain: z.coerce.number().nullable().optional(),
  chambres: z.coerce.number().int().nullable().optional(),
  salles_de_bain: z.coerce.number().int().nullable().optional(),
  disponible_le: z.string().nullable().optional(),

  quartier: z.string().nullable().optional(),
  latitude: z.coerce.number().nullable().optional(),
  longitude: z.coerce.number().nullable().optional(),

  description_courte: z.string().max(200, 'Maximum 200 caractères').nullable().optional(),
  description_longue: z.string().nullable().optional(),

  equipements: z.array(z.string()).default([]),

  photos: z.array(z.string()).default([]),
  photo_principale: z.string().nullable().optional(),
  proximites: z.array(z.object({
    place: z.string().min(1, 'Lieu requis'),
    time: z.string().min(1, 'Temps requis'),
  })).default([]),
});

type BienFormValues = z.infer<typeof bienSchema>;

// ─── Props ───────────────────────────────────────────────────────────────────
interface BienFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bien?: Bien | null;
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">{children}</h3>
      <Separator className="flex-1" />
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export function BienForm({ open, onOpenChange, bien }: BienFormProps) {
  const isEditing = !!bien;
  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isJsonImportOpen, setIsJsonImportOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(null);

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      
      // Merge with current values to preserve defaults
      const currentValues = form.getValues();
      const newValues = {
        ...currentValues,
        ...parsed,
      };

      // Specific handling for arrays to avoid nulls
      if (parsed.services) newValues.services = parsed.services;
      if (parsed.equipements) newValues.equipements = parsed.equipements;
      if (parsed.photos) newValues.photos = parsed.photos;
      else newValues.photos = currentValues.photos; // Explicitly preserve

      if (parsed.photo_principale) newValues.photo_principale = parsed.photo_principale;
      else newValues.photo_principale = currentValues.photo_principale; // Explicitly preserve

      if (parsed.proximites) newValues.proximites = parsed.proximites;

      form.reset(newValues);
      setIsJsonImportOpen(false);
      setJsonInput('');
    } catch (error) {
      console.error('JSON Parse Error:', error);
      alert('Format JSON invalide. Veuillez vérifier votre code.');
    }
  };

  const jsonTemplate = JSON.stringify({
    titre: "Nom du bien",
    reference: "REF-123",
    type: "villa",
    services: ["vente"],
    prix_vente: 5000000,
    surface_habitable: 250,
    surface_terrain: 500,
    chambres: 4,
    salles_de_bain: 3,
    quartier: "Hivernage",
    description_courte: "Une superbe villa...",
    description_longue: "Description détaillée...",
    equipements: ["Piscine", "Jardin", "Garage"],
    proximites: [{ place: "Aéroport", time: "15 min" }],
    photos: ["https://url-image-1.jpg", "https://url-image-2.jpg"],
    photo_principale: "https://url-image-1.jpg"
  }, null, 2);

  const form = useForm<BienFormValues>({
    resolver: zodResolver(bienSchema),
    defaultValues: {
      titre: '',
      reference: '',
      type: 'villa',
      services: ['vente'],
      statut: 'brouillon',
      prix_vente: null,
      prix_location_longue: null,
      prix_location_courte: null,
      prix: null,
      devise: 'MAD',
      surface_habitable: null,
      surface_terrain: null,
      chambres: null,
      salles_de_bain: null,
      disponible_le: null,
      quartier: null,
      latitude: null,
      longitude: null,
      description_courte: null,
      description_longue: null,
      equipements: [],
      photos: [],
      photo_principale: null,
      proximites: [],
    },
  });

  // Reset form when bien changes
  useEffect(() => {
    if (bien) {
      form.reset({
        titre: bien.titre ?? '',
        reference: bien.reference ?? '',
        type: bien.type ?? 'villa',
        statut: bien.statut ?? 'brouillon',
        services: bien.services ?? (bien.service ? [bien.service] : []),
        prix_vente: bien.prix_vente,
        prix_location_longue: bien.prix_location_longue,
        prix_location_courte: bien.prix_location_courte,
        prix: bien.prix,
        devise: bien.devise,
        surface_habitable: bien.surface_habitable,
        surface_terrain: bien.surface_terrain,
        chambres: bien.chambres,
        salles_de_bain: bien.salles_de_bain,
        disponible_le: bien.disponible_le,
        quartier: bien.quartier,
        latitude: bien.latitude,
        longitude: bien.longitude,
        description_courte: bien.description_courte,
        description_longue: bien.description_longue,
        equipements: bien.equipements ?? [],
        photos: bien.photos ?? [],
        photo_principale: bien.photo_principale,
        proximites: (bien.proximites as any) ?? [],
      });
    } else {
      form.reset({
        titre: '',
        reference: '',
        type: 'villa',
        services: ['vente'],
        statut: 'brouillon',
        prix_vente: null,
        prix_location_longue: null,
        prix_location_courte: null,
        prix: null,
        devise: 'MAD',
        surface_habitable: null,
        surface_terrain: null,
        chambres: null,
        salles_de_bain: null,
        disponible_le: null,
        quartier: null,
        latitude: null,
        longitude: null,
        description_courte: null,
        description_longue: null,
        equipements: [],
        photos: [],
        photo_principale: null,
        proximites: [],
      });
    }
  }, [bien, form]);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    const totalFiles = files.length;
    let uploadedCount = 0;

    const currentPhotos = form.getValues('photos') ?? [];
    const newPhotos = [...currentPhotos];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('property_images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('property_images')
          .getPublicUrl(filePath);

        newPhotos.push(publicUrl);
        uploadedCount++;
        setUploadProgress((uploadedCount / totalFiles) * 100);
      }

      form.setValue('photos', newPhotos);
      if (!form.getValues('photo_principale') && newPhotos.length > 0) {
        form.setValue('photo_principale', newPhotos[0]);
      }
    } catch (error: any) {
      console.error('Error uploading images:', error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const proximites = form.watch('proximites') ?? [];
  const [newProxPlace, setNewProxPlace] = useState('');
  const [newProxTime, setNewProxTime] = useState('');

  const handleAddProximite = () => {
    if (!newProxPlace.trim() || !newProxTime.trim()) return;
    const current = form.getValues('proximites') ?? [];
    form.setValue('proximites', [...current, { place: newProxPlace, time: newProxTime }]);
    setNewProxPlace('');
    setNewProxTime('');
  };

  const handleRemoveProximite = (index: number) => {
    const current = form.getValues('proximites') ?? [];
    form.setValue('proximites', current.filter((_, i) => i !== index));
  };

  const movePhoto = (index: number, direction: 'left' | 'right') => {
    const current = form.getValues('photos') ?? [];
    if (direction === 'left' && index > 0) {
      const next = [...current];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      form.setValue('photos', next, { shouldDirty: true });
    } else if (direction === 'right' && index < current.length - 1) {
      const next = [...current];
      [next[index + 1], next[index]] = [next[index], next[index + 1]];
      form.setValue('photos', next, { shouldDirty: true });
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedPhotoIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedPhotoIndex !== null && draggedPhotoIndex !== targetIndex) {
      const currentPhotos = form.getValues('photos') ?? [];
      const newPhotos = [...currentPhotos];
      const draggedPhoto = newPhotos[draggedPhotoIndex];
      
      newPhotos.splice(draggedPhotoIndex, 1);
      newPhotos.splice(targetIndex, 0, draggedPhoto);
      
      form.setValue('photos', newPhotos, { shouldDirty: true });
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedPhotoIndex(null);
    e.currentTarget.style.opacity = '1';
  };

  const onSubmit = async (values: BienFormValues) => {
    const payload: BienInsert = {
      titre: values.titre,
      reference: values.reference || null,
      type: values.type,
      services: values.services,
      service: values.services[0], // Keep for legacy
      statut: values.statut,
      prix_vente: values.prix_vente ?? null,
      prix_location_longue: values.prix_location_longue ?? null,
      prix_location_courte: values.prix_location_courte ?? null,
      prix: values.prix ?? null,
      devise: values.devise,
      surface_habitable: values.surface_habitable ?? null,
      surface_terrain: values.surface_terrain ?? null,
      chambres: values.chambres ?? null,
      salles_de_bain: values.salles_de_bain ?? null,
      disponible_le: values.disponible_le ?? null,
      quartier: values.quartier ?? null,
      latitude: values.latitude ?? null,
      longitude: values.longitude ?? null,
      description_courte: values.description_courte ?? null,
      description_longue: values.description_longue ?? null,
      equipements: values.equipements,
      photos: values.photos,
      photo_principale: values.photo_principale ?? null,
      proximites: values.proximites,
    };

    if (isEditing && bien) {
      await updateMutation.mutateAsync({ id: bien.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl p-0 flex flex-col"
      >
        <SheetHeader>
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
            <div>
              <SheetTitle className="font-serif text-xl">
                {isEditing ? 'Modifier le bien' : 'Ajouter un bien'}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                {isEditing ? `Référence : ${bien?.reference ?? '—'}` : 'Tous les champs marqués * sont obligatoires'}
              </SheetDescription>
            </div>
            {!isEditing && (
              <Dialog open={isJsonImportOpen} onOpenChange={setIsJsonImportOpen}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsJsonImportOpen(true)}
                  className="gap-2 text-xs h-8"
                >
                  <Code className="h-3.5 w-3.5" />
                  Code JSON
                </Button>
                <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Importer depuis un Code JSON</DialogTitle>
                    <DialogDescription>
                      Collez le code JSON du bien pour remplir le formulaire automatiquement. 
                      Les photos importées manuellement seront conservées si le JSON n'en contient pas.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Textarea 
                      placeholder='{ "titre": "...", "prix": 1000, ... }'
                      className="font-mono text-xs min-h-[300px]"
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                    />
                    <div className="bg-muted p-2 rounded text-[10px] text-muted-foreground overflow-auto max-h-32">
                      <strong>Exemple de format :</strong>
                      <pre className="mt-1">{jsonTemplate}</pre>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsJsonImportOpen(false)}>Annuler</Button>
                    <Button onClick={handleJsonImport}>Appliquer le code</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} id="bien-form" className="space-y-6 py-6">

              {/* ── Section 1 : Informations générales ── */}
              <SectionTitle>Informations générales</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <FormField control={form.control} name="titre" render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Titre *</FormLabel>
                    <FormControl><Input placeholder="Villa avec piscine à la Palmeraie" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="reference" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Référence <span className="text-muted-foreground text-xs">(auto si vide)</span></FormLabel>
                    <FormControl><Input placeholder="DP-26-XXXXX" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="statut" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="brouillon">Brouillon</SelectItem>
                        <SelectItem value="publie">Publié</SelectItem>
                        <SelectItem value="vendu-loue">Vendu / Loué</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de bien *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {BIEN_TYPES.map((t) => (
                          <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="services" render={() => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Services (plusieurs choix possibles) *</FormLabel>
                    <div className="flex flex-wrap gap-4 pt-2">
                      {BIEN_SERVICES.map((serv) => (
                        <FormField
                          key={serv}
                          control={form.control}
                          name="services"
                          render={({ field }) => {
                            const checked = (field.value ?? []).includes(serv);
                            return (
                              <FormItem className="flex items-center space-x-2 space-y-0 bg-muted/30 px-3 py-2 rounded-md border border-border">
                                <FormControl>
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(val) => {
                                      const current = field.value ?? [];
                                      field.onChange(
                                        val ? [...current, serv] : current.filter((s) => s !== serv)
                                      );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer text-sm capitalize">
                                  {serv.replace(/-/g, ' ')}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* ── Section 2 : Tarification ── */}
              <SectionTitle>Tarification</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-muted/20 p-4 rounded-lg border border-border/50">
                
                {form.watch('services')?.includes('vente') && (
                  <FormField control={form.control} name="prix_vente" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-accent font-semibold">Prix de Vente</FormLabel>
                      <FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} className="bg-background" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                {form.watch('services')?.includes('location-longue-duree') && (
                  <FormField control={form.control} name="prix_location_longue" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-accent font-semibold">Loyer Longue Durée / mois</FormLabel>
                      <FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} className="bg-background" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                {form.watch('services')?.includes('location-courte-duree') && (
                  <FormField control={form.control} name="prix_location_courte" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-accent font-semibold">Loyer Courte Durée / nuit</FormLabel>
                      <FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} className="bg-background" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                {form.watch('services')?.includes('sous-location') && (
                  <FormField control={form.control} name="prix" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-accent font-semibold">Prix Sous-location</FormLabel>
                      <FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} className="bg-background" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                <FormField control={form.control} name="devise" render={({ field }) => (
                  <FormItem className="lg:col-start-3">
                    <FormLabel className="font-semibold text-foreground">Devise *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="bg-background"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {BIEN_DEVISES.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* ── Section 3 : Caractéristiques du bien ── */}
              <SectionTitle>Caractéristiques du bien</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <FormField control={form.control} name="surface_habitable" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surface habitable (m²)</FormLabel>
                    <FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="surface_terrain" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surface terrain (m²)</FormLabel>
                    <FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="chambres" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chambres</FormLabel>
                    <FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="salles_de_bain" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salles de bain</FormLabel>
                    <FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* ── Section 4 : Localisation & Disponibilité ── */}
              <SectionTitle>Localisation & Disponibilité</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="quartier" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quartier</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        {QUARTIERS.map((q) => (
                          <SelectItem key={q} value={q}>{q}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="disponible_le" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disponible le</FormLabel>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn('w-full justify-start text-left font-normal bg-transparent', !field.value && 'text-muted-foreground')}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(new Date(field.value), 'dd MMMM yyyy', { locale: fr })
                              : 'Sélectionner une date'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            field.onChange(date ? format(date, 'yyyy-MM-dd') : null);
                            setCalendarOpen(false);
                          }}
                          locale={fr}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="sm:col-span-2 grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="latitude" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl><Input type="number" step="any" placeholder="31.628674" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="longitude" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl><Input type="number" step="any" placeholder="-7.992047" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* ── Section 5 : Description ── */}
              <SectionTitle>Description</SectionTitle>
              <div className="space-y-4">

                <FormField control={form.control} name="description_courte" render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Description courte</FormLabel>
                      <span className={cn('text-xs tabular-nums', (field.value || '').length > 200 ? 'text-destructive' : 'text-muted-foreground')}>
                        {(field.value || '').length} / 200
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Superbe villa avec piscine au cœur de la Palmeraie..."
                        rows={3}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description_longue" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description longue</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description détaillée du bien..."
                        rows={6}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* ── Section 6 : Équipements ── */}
              <SectionTitle>Équipements</SectionTitle>
              <FormField control={form.control} name="equipements" render={() => (
                <FormItem>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {EQUIPEMENTS_LIST.map((equip) => (
                      <FormField
                        key={equip}
                        control={form.control}
                        name="equipements"
                        render={({ field }) => {
                          const checked = (field.value ?? []).includes(equip);
                          return (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(val) => {
                                    const current = field.value ?? [];
                                    field.onChange(
                                      val ? [...current, equip] : current.filter((e) => e !== equip)
                                    );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer text-sm">{equip}</FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />

              {/* ── Section 7 : Proximités ── */}
              <SectionTitle>Proximités</SectionTitle>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Lieu / Point d'intérêt</Label>
                    <Input 
                      placeholder="Ex: Aéroport" 
                      value={newProxPlace} 
                      onChange={(e) => setNewProxPlace(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Temps / Distance</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Ex: 15 min" 
                        value={newProxTime} 
                        onChange={(e) => setNewProxTime(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddProximite(); } }}
                      />
                      <Button type="button" variant="outline" size="icon" onClick={handleAddProximite}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {proximites.map((prox, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-md group">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-primary" strokeWidth={1.5} />
                        <span className="font-medium text-sm">{prox.place}</span>
                        <span className="text-muted-foreground text-sm font-light">— {prox.time}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProximite(index)}
                        className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {proximites.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4 italic">
                      Aucune proximité renseignée (ex: Aéroport : 15 min)
                    </p>
                  )}
                </div>
              </div>

              {/* ── Section 8 : Photos ── */}
              <SectionTitle>Photos</SectionTitle>
              <div className="space-y-4">
                {/* Upload Section */}
                <div className="space-y-4">
                  <div 
                    className={cn(
                      "relative border-2 border-dashed border-border rounded-lg p-8 transition-colors flex flex-col items-center justify-center gap-2 text-center",
                      uploading ? "bg-muted/50" : "hover:bg-muted/30 cursor-pointer"
                    )}
                    onClick={() => !uploading && document.getElementById('photo-upload')?.click()}
                  >
                    <input 
                      id="photo-upload" 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Upload size={24} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Cliquer pour importer des photos</p>
                      <p className="text-xs text-muted-foreground">Format JPG, PNG ou WEBP conseillé</p>
                    </div>
                  </div>

                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                        <span>Importation en cours...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-1" />
                    </div>
                  )}
                </div>

                {/* Liste des photos */}
                {form.watch('photos')?.length > 0 && (
                  <RadioGroup
                    value={form.watch('photo_principale') ?? ''}
                    onValueChange={(val) => form.setValue('photo_principale', val)}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {form.watch('photos').map((url, index) => (
                        <div 
                          key={url} 
                          className={cn(
                            "relative group rounded-md overflow-hidden border border-border aspect-square cursor-grab active:cursor-grabbing",
                            draggedPhotoIndex === index ? "ring-2 ring-primary border-primary opacity-50" : ""
                          )}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDrop={(e) => handleDrop(e, index)}
                          onDragEnd={handleDragEnd}
                        >
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <div className="flex justify-between items-start">
                              <div className="flex gap-1">
                                {index > 0 && (
                                  <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); movePhoto(index, 'left'); }}
                                    className="p-1 rounded bg-black/60 text-white hover:bg-black/90 transition-colors backdrop-blur-sm"
                                  >
                                    <ArrowLeft className="h-3 w-3" />
                                  </button>
                                )}
                                {index < form.watch('photos').length - 1 && (
                                  <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); movePhoto(index, 'right'); }}
                                    className="p-1 rounded bg-black/60 text-white hover:bg-black/90 transition-colors backdrop-blur-sm"
                                  >
                                    <ArrowRight className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  const current = form.getValues('photos') ?? [];
                                  const next = current.filter(p => p !== url);
                                  form.setValue('photos', next, { shouldDirty: true });
                                  if (form.getValues('photo_principale') === url) {
                                    form.setValue('photo_principale', next[0] ?? null, { shouldDirty: true });
                                  }
                                }}
                                className="p-1 rounded bg-destructive text-white hover:bg-destructive/80 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                            <Label className="flex items-center gap-2 cursor-pointer text-white text-xs bg-black/40 p-2 rounded backdrop-blur-sm">
                              <RadioGroupItem value={url} className="border-white text-white" />
                              <div className="flex items-center gap-1">
                                <Star className={cn('h-3 w-3', form.watch('photo_principale') === url ? 'fill-yellow-400 text-yellow-400' : 'text-white')} />
                                <span>Principale</span>
                              </div>
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </div>

              {/* Spacer bottom */}
              <div className="h-4" />
            </form>
          </Form>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t border-border flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending} className="flex-1">
            Annuler
          </Button>
          <Button form="bien-form" type="submit" disabled={isPending} className="flex-1">
            {isPending ? 'Enregistrement...' : isEditing ? 'Enregistrer les modifications' : 'Créer le bien'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default BienForm;
