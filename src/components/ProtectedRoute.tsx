import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: checkingRole } = useQuery({
    queryKey: ['adminRole', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false;
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      return !error && data && data.role === 'admin';
    },
    enabled: !!session?.user?.id,
  });

  if (authLoading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-border border-t-primary rounded-full animate-spin" />
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-sans">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
