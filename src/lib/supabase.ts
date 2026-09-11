import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zpdnjvusmjrqxzgughbi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZG5qdnVzbWpycXh6Z3VnaGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMjc5NzUsImV4cCI6MjEwNDYwMzk3NX0.M7v4coByObXDSIvk7NeAPAy-3AIOyJnrD7Rki2s8Wes';

if (supabaseUrl === 'https://zpdnjvusmjrqxzgughbi.supabase.co') {
  console.warn('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
