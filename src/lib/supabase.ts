import { createClient } from '@supabase/supabase-js';

const getInitialUrl = () => {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('halo_jaspel_custom_supabase_url');
    if (customUrl) return customUrl;
    if (window.__HALO_JAPEL_ENV__?.SUPABASE_URL) return window.__HALO_JAPEL_ENV__.SUPABASE_URL;
  }
  return import.meta.env.VITE_SUPABASE_URL || 'https://zpdnjvusmjrqxzgughbi.supabase.co';
};

const getInitialKey = () => {
  if (typeof window !== 'undefined') {
    const customKey = localStorage.getItem('halo_jaspel_custom_supabase_key');
    if (customKey) return customKey;
    if (window.__HALO_JAPEL_ENV__?.SUPABASE_ANON_KEY) return window.__HALO_JAPEL_ENV__.SUPABASE_ANON_KEY;
  }
  return import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZG5qdnVzbWpycXh6Z3VnaGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMjc5NzUsImV4cCI6MjEwNDYwMzk3NX0.M7v4coByObXDSIvk7NeAPAy-3AIOyJnrD7Rki2s8Wes';
};

export const supabaseUrl = getInitialUrl();
export const supabaseAnonKey = getInitialKey();

export let supabase = createClient(supabaseUrl, supabaseAnonKey);

export const reconfigureSupabase = (newUrl: string, newKey: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('halo_jaspel_custom_supabase_url', newUrl);
    localStorage.setItem('halo_jaspel_custom_supabase_key', newKey);
  }
  supabase = createClient(newUrl, newKey);
  return supabase;
};
