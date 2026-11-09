import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gzjdjrawaenqbmxvxioo.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_gdpo0fVVEuPaMOy-kAq0JA_lYI_RH_4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing connection to Supabase:', supabaseUrl);
  const { data, error } = await supabase.from('products').select('count');
  if (error) {
    console.error('Error querying products table:', error);
  } else {
    console.log('Successfully connected! Products table verified:', data);
  }
}

testConnection();

