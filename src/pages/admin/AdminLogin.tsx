import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast({
        title: t('auth.erreur_auth'),
        description: error.message,
        variant: 'destructive',
      });
    } else {
      navigate('/admin/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 relative overflow-hidden">
      {/* Background décoratif */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03]"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1489493512598-d08130f49bea?w=800)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80" />
      </div>

      <div className="w-full max-w-sm space-y-10 relative z-10">
        {/* Logo / Brand */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-border/60 mb-2">
            <span className="font-serif text-2xl text-foreground/80">DP</span>
          </div>
          <div>
            <h1 className="font-serif text-3xl tracking-wide">{t('auth.titre')}</h1>
            <p className="text-muted-foreground font-light text-sm mt-1 tracking-widest uppercase">
              {t('auth.sous_titre')}
            </p>
          </div>
          <div className="w-8 h-px bg-primary/40 mx-auto" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label
              htmlFor="admin-email"
              className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground"
            >
              {t('auth.email')}
            </Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="h-12 bg-transparent border-border/60 focus:border-primary/60 rounded-none"
            />
            {errors.email && (
              <p className="text-[11px] text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="admin-password"
              className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground"
            >
              {t('auth.mot_de_passe')}
            </Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('password')}
                className="h-12 bg-transparent border-border/60 focus:border-primary/60 rounded-none pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword
                  ? <EyeOff size={16} strokeWidth={1.25} />
                  : <Eye size={16} strokeWidth={1.25} />
                }
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="luxury"
            size="lg"
            className="w-full h-12 gap-2 rounded-none mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                {t('auth.connexion_chargement')}
              </>
            ) : (
              <>
                {t('auth.connexion')}
                <ArrowRight size={16} strokeWidth={1.25} />
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-[10px] tracking-widest uppercase text-muted-foreground/50">
          Accès réservé aux administrateurs
        </p>
      </div>
    </div>
  );
}
