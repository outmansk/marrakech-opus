import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '❌ Missing Supabase environment variables.\n' +
    'Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.\n' +
    'Check your .env file or Vercel environment variables.'
  );
}

// Simple in-memory rate limiting for API endpoints (Supabase calls)
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;
let requestCount = 0;
let windowStartTime = Date.now();

const rateLimitedFetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  const now = Date.now();
  if (now - windowStartTime > RATE_LIMIT_WINDOW_MS) {
    windowStartTime = now;
    requestCount = 0;
  }
  
  if (requestCount >= MAX_REQUESTS_PER_WINDOW) {
    console.warn('Rate limit exceeded for API calls.');
    // You could also throw an error here, but returning a 429 response is standard for APIs
    return new Response(JSON.stringify({ error: 'Too Many Requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  requestCount++;
  return fetch(url, options);
};

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: rateLimitedFetch,
  },
});
