import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import {
  SEED_ORGANISATIONS,
  SEED_PROFILES,
  SEED_SUPPLIERS,
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_SUPPLIER_PRODUCTS,
  SEED_PURCHASE_ORDERS,
  SEED_DEMAND_FORECASTS,
  SEED_PROVENANCE_EVENTS
} from '../src/lib/seedData.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gzjdjrawaenqbmxvxioo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding Supabase database at:', supabaseUrl);

  try {
    // 1. Organisations
    console.log('Inserting organisations...');
    for (const org of SEED_ORGANISATIONS) {
      await supabase.from('organisations').upsert({
        id: org.id,
        name: org.name,
        slug: org.slug,
        logo_url: org.logo_url,
        business_registration_no: org.business_registration_no,
        tax_id: org.tax_id,
        industry: org.industry,
        currency: org.currency,
        annual_procurement_budget: org.annual_procurement_budget,
        address: org.address,
        is_verified: org.is_verified
      });
    }

    // 2. Categories
    console.log('Inserting categories...');
    for (const cat of SEED_CATEGORIES) {
      await supabase.from('product_categories').upsert({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon
      });
    }

    // 3. Products
    console.log('Inserting products...');
    for (const prod of SEED_PRODUCTS) {
      await supabase.from('products').upsert({
        id: prod.id,
        category_id: prod.category_id,
        name: prod.name,
        sku: prod.sku,
        gtin: prod.gtin,
        brand: prod.brand,
        model_number: prod.model_number,
        description: prod.description,
        image_url: prod.image_url,
        unit_of_measurement: prod.unit_of_measurement,
        specifications: prod.specifications,
        benchmark_market_price: prod.benchmark_market_price,
        is_active: prod.is_active
      });
    }

    // 4. Suppliers
    console.log('Inserting suppliers...');
    for (const sup of SEED_SUPPLIERS) {
      await supabase.from('suppliers').upsert({
        id: sup.id,
        company_name: sup.company_name,
        legal_name: sup.legal_name,
        gstin_tax_id: sup.gstin_tax_id,
        contact_email: sup.contact_email,
        contact_phone: sup.contact_phone,
        website: sup.website,
        business_category: sup.business_category,
        address: sup.address,
        verification_status: sup.verification_status,
        reliability_score: sup.reliability_score,
        delivery_rating: sup.delivery_rating,
        quality_score: sup.quality_score,
        payment_terms: sup.payment_terms,
        paypal_merchant_id: sup.paypal_merchant_id,
        paypal_email: sup.paypal_email,
        is_provisional: sup.is_provisional
      });
    }

    console.log('✅ Supabase database successfully seeded with master catalogue and supplier records!');
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

seed();

