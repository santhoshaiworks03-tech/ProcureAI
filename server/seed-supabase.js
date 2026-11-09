import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gzjdjrawaenqbmxvxioo.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_gdpo0fVVEuPaMOy-kAq0JA_lYI_RH_4';

console.log('Connecting to Supabase:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndSeed() {
  const { data, error } = await supabase.from('products').select('*').limit(5);
  if (error) {
    console.error('Tables not created yet in Supabase schema:', error.message);
    console.log('\nPlease run the migration script in your Supabase SQL Editor:');
    console.log('File path: supabase/migrations/20261109000000_procureai_core_schema.sql');
    return;
  }
  console.log(`Connected! Current products in database: ${data.length}`);
}

checkAndSeed();
