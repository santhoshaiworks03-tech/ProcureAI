import { createClient } from '@supabase/supabase-js';
import { store } from '../lib/store';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-supabase')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Unified Database Gateway:
 * Reads from Supabase when configured, or transparently falls back to local reactive store.
 */
export const db = {
  isLive: isSupabaseConfigured,

  async getProducts() {
    if (supabase) {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data && data.length > 0) return data;
    }
    return store.getProducts();
  },

  async getSuppliers() {
    if (supabase) {
      const { data, error } = await supabase.from('suppliers').select('*');
      if (!error && data && data.length > 0) return data;
    }
    return store.getSuppliers();
  },

  async getPurchaseOrders() {
    if (supabase) {
      const { data, error } = await supabase.from('purchase_orders').select('*, items:purchase_order_items(*)');
      if (!error && data && data.length > 0) return data;
    }
    return store.getPurchaseOrders();
  },

  async getProvenanceEvents() {
    if (supabase) {
      const { data, error } = await supabase.from('provenance_events').select('*').order('event_number', { ascending: false });
      if (!error && data && data.length > 0) return data;
    }
    return store.getProvenanceEvents();
  }
};

