import { createClient } from '@supabase/supabase-js';

// NOTA: Gantikan nilai ini dengan URL dan Key projek Supabase anda yang sebenar
// Anda boleh mendapatkannya di Settings > API dalam dashboard Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dauegzprzhawsivykuaq.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdWVnenByemhhd3NpdnlrdWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5OTE2NzUsImV4cCI6MjA3OTU2NzY3NX0.PwQp4Jzk09bxgQKFPOAf00t7XAsP4f08elxAb8NV6Pk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);