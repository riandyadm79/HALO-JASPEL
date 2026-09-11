import { supabase } from '../lib/supabase';

export const seedDatabase = async () => {
  try {
    const { data, error } = await supabase.from('alokasi_jaspel').select('id').limit(1);
    if (error) {
      console.warn('Supabase query note:', error.message);
    } else {
      console.log('Connected to Supabase. Total records check:', data?.length);
    }
  } catch (err) {
    console.error('Seed/Check error:', err);
  }
};
