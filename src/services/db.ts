import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { store } from '../lib/store';

export { supabase, isSupabaseConfigured };

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

