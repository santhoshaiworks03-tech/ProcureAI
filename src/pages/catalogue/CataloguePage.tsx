import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Package,
  Layers,
  Tag,
  Truck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Eye,
  Building,
  Info
} from 'lucide-react';
import { store } from '../../lib/store';
import { Product, SupplierProduct } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency } from '../../lib/utils';

export const CataloguePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [search, setSearch] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = store.getCategories();
  const products = store.getProducts();

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        (p.gtin && p.gtin.includes(search)) ||
        p.brand.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || p.category_id === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  const supplierListings = useMemo(() => {
    if (!selectedProduct) return [];
    return store.getListingsForProduct(selectedProduct.id);
  }, [selectedProduct]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">Enterprise Product Catalogue</h1>
          <p className="text-xs text-slate-500 mt-1">
            Global master catalog with verified SKU/GTIN records and multi-supplier competitive pricing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info">{products.length} Master Products Listed</Badge>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product name, SKU, GTIN barcode, or brand..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:bg-white"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-navy-900'
              }`}
            >
              All Categories
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                  selectedCategory === c.id
                    ? 'bg-navy-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-navy-900'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredProducts.map(product => {
          const listings = store.getListingsForProduct(product.id);
          const minPrice = listings.length > 0 ? Math.min(...listings.map(l => l.unit_price)) : product.benchmark_market_price;
          const maxPrice = listings.length > 0 ? Math.max(...listings.map(l => l.unit_price)) : product.benchmark_market_price;
          const totalStock = listings.reduce((sum, l) => sum + l.available_stock, 0);

          return (
            <Card
              key={product.id}
              hoverEffect
              className="flex flex-col justify-between overflow-hidden p-0 border border-slate-200/90 group"
            >
              {/* Product Image Header */}
              <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="text-[10px] font-mono font-bold bg-navy-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded">
                    {product.sku}
                  </span>
                </div>
                <div className="absolute bottom-2.5 right-2.5">
                  {totalStock > 0 ? (
                    <Badge variant="success" size="sm">
                      {totalStock} in stock
                    </Badge>
                  ) : (
                    <Badge variant="danger" size="sm">
                      Out of stock
                    </Badge>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>{product.brand}</span>
                    <span className="font-mono text-[10px]">GTIN: {product.gtin || 'N/A'}</span>
                  </div>
                  <h3 className="text-xs font-bold text-navy-900 line-clamp-2 leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                </div>

                {/* Price and Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Supplier Pricing</span>
                    <span className="text-sm font-bold text-navy-900">
                      {listings.length > 1
                        ? `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`
                        : formatCurrency(minPrice)}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProduct(product)}
                    rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  >
                    Compare
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Multi-Supplier Price Comparison Modal */}
      {selectedProduct && (
        <Modal
          isOpen={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          title={selectedProduct.name}
          subtitle={`SKU: ${selectedProduct.sku} | GTIN: ${selectedProduct.gtin || 'N/A'} | Brand: ${selectedProduct.brand}`}
          maxWidth="lg"
        >
          <div className="space-y-5">
            {/* Image & Specifications Overview */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <img
                src={selectedProduct.image_url}
                alt={selectedProduct.name}
                className="w-32 h-32 rounded-lg object-cover border border-slate-200 flex-shrink-0"
              />
              <div className="flex-1 space-y-1.5 text-xs">
                <p className="text-slate-700 leading-relaxed">{selectedProduct.description}</p>
                <div className="pt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600">
                  {Object.entries(selectedProduct.specifications || {}).map(([key, val]) => (
                    <div key={key} className="flex justify-between border-b border-slate-200/60 pb-0.5">
                      <span className="text-slate-400">{key}:</span>
                      <span className="font-medium text-navy-900">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Multi-Supplier Offerings Comparison */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-brand-blue" /> Verified Supplier Listings & Terms
                </h4>
                <span className="text-[11px] text-slate-500">
                  {supplierListings.length} suppliers offering this item
                </span>
              </div>

              {supplierListings.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Supplier Name</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-center">Available Stock</th>
                        <th className="py-2.5 px-3 text-center">Est. Delivery</th>
                        <th className="py-2.5 px-3 text-center">MOQ</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {supplierListings.map(listing => (
                        <tr key={listing.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-semibold text-navy-900 block">{listing.supplier_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">SKU: {listing.supplier_sku}</span>
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-navy-900">
                            {formatCurrency(listing.unit_price)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Badge variant={listing.available_stock > 20 ? 'success' : 'warning'} size="sm">
                              {listing.available_stock} units
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-center text-slate-600">
                            {listing.estimated_delivery_days} Days
                          </td>
                          <td className="py-3 px-3 text-center text-slate-600 font-mono">
                            {listing.min_order_quantity}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(null);
                                window.location.href = `/agent?prompt=${encodeURIComponent(`I need ${listing.min_order_quantity * 5} units of ${selectedProduct.name} from ${listing.supplier_name}`)}`;
                              }}
                            >
                              Procure
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No active supplier listings found for this product.
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
