import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Building,
  ChevronRight,
  ChevronLeft,
  Package,
  Layers,
  ArrowRight,
  LayoutGrid,
  Table2
} from 'lucide-react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { store } from '../../lib/store';
import { Product, SupplierProduct } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency } from '../../lib/utils';

interface ProductViewModel {
  product: Product;
  listings: SupplierProduct[];
  minPrice: number;
  maxPrice: number;
  totalStock: number;
  categoryName: string;
}

const ITEMS_PER_PAGE = 12;

export const CataloguePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [search, setSearch] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'aggrid'>('cards');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const categories = useMemo(() => store.getCategories(), []);
  const products = useMemo(() => store.getProducts(), []);

  // Reset pagination to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  // High-performance single-pass filtered view model calculation
  const filteredViewModels = useMemo<ProductViewModel[]>(() => {
    const searchLower = search.trim().toLowerCase();

    return products
      .filter(p => {
        const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
        if (!matchesCategory) return false;

        if (!searchLower) return true;
        return (
          p.name.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower) ||
          (p.gtin && p.gtin.includes(searchLower)) ||
          p.brand.toLowerCase().includes(searchLower)
        );
      })
      .map(p => {
        const listings = store.getListingsForProduct(p.id);
        const minPrice = listings.length > 0 ? Math.min(...listings.map(l => l.unit_price)) : p.benchmark_market_price;
        const maxPrice = listings.length > 0 ? Math.max(...listings.map(l => l.unit_price)) : p.benchmark_market_price;
        const totalStock = listings.reduce((sum, l) => sum + l.available_stock, 0);
        const category = categories.find(c => c.id === p.category_id)?.name || 'General';

        return {
          product: p,
          listings,
          minPrice,
          maxPrice,
          totalStock,
          categoryName: category
        };
      });
  }, [products, categories, search, selectedCategory]);

  // Paginated chunk for cards view
  const totalPages = Math.max(1, Math.ceil(filteredViewModels.length / ITEMS_PER_PAGE));
  const paginatedViewModels = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredViewModels.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredViewModels, currentPage]);

  const supplierListings = useMemo(() => {
    if (!selectedProduct) return [];
    return store.getListingsForProduct(selectedProduct.id);
  }, [selectedProduct]);

  // AG Grid Row Data preparation (memoized)
  const rowData = useMemo(() => {
    return filteredViewModels.map(vm => {
      const { product: p, listings, minPrice, maxPrice, totalStock, categoryName } = vm;
      return {
        id: p.id,
        sku: p.sku,
        gtin: p.gtin || '—',
        brand: p.brand,
        name: p.name,
        category_name: categoryName,
        benchmark_market_price: p.benchmark_market_price,
        minPrice,
        maxPrice,
        priceRange: listings.length > 1 ? `${formatCurrency(minPrice)} – ${formatCurrency(maxPrice)}` : formatCurrency(minPrice),
        totalStock,
        supplierCount: listings.length,
        rawProduct: p
      };
    });
  }, [filteredViewModels]);

  // AG Grid Column Definitions
  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'sku',
      headerName: 'SKU',
      width: 110,
      cellClass: 'font-mono text-xs font-medium text-slate-800'
    },
    {
      field: 'name',
      headerName: 'Product name',
      flex: 2,
      minWidth: 200,
      cellClass: 'font-medium text-ink-950 text-xs'
    },
    {
      field: 'brand',
      headerName: 'Brand',
      width: 120,
      cellClass: 'text-xs text-slate-600'
    },
    {
      field: 'category_name',
      headerName: 'Category',
      width: 140,
      cellClass: 'text-xs text-slate-600'
    },
    {
      field: 'benchmark_market_price',
      headerName: 'Benchmark',
      width: 130,
      valueFormatter: params => formatCurrency(params.value),
      cellClass: 'text-xs text-slate-500 font-mono tabular-nums'
    },
    {
      field: 'priceRange',
      headerName: 'Contracted pricing',
      width: 160,
      cellClass: 'text-xs font-semibold text-emerald-700 font-mono tabular-nums'
    },
    {
      field: 'totalStock',
      headerName: 'Stock',
      width: 110,
      cellRenderer: (params: any) => {
        const stock = params.value;
        return (
          <span className={`inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded ${stock > 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
            {stock > 0 ? `${stock} units` : 'Out of stock'}
          </span>
        );
      }
    },
    {
      field: 'supplierCount',
      headerName: 'Vendors',
      width: 90,
      cellClass: 'text-center font-mono text-xs text-slate-600'
    },
    {
      headerName: 'Action',
      width: 110,
      cellRenderer: (params: any) => {
        return (
          <button
            onClick={() => setSelectedProduct(params.data.rawProduct)}
            className="px-2.5 py-1 text-[11px] font-medium text-[#13110F] hover:text-[#6B6560] border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
          >
            Compare
          </button>
        );
      }
    }
  ], []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink-950">Product catalogue</h1>
          <p className="text-xs text-slate-500 mt-1">
            Verified master catalogue of commercial equipment across contracted suppliers
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'cards' ? 'bg-white text-ink-950 shadow-xs' : 'text-slate-600 hover:text-ink-950'
              }`}
              title="Cards view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('aggrid')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'aggrid' ? 'bg-white text-ink-950 shadow-xs' : 'text-slate-600 hover:text-ink-950'
              }`}
              title="AG Grid table"
            >
              <Table2 className="w-3.5 h-3.5" />
              <span className="text-[11px]">AG Grid</span>
            </button>
          </div>

          <Badge variant="neutral">
            <span className="tabular-nums font-mono font-medium">{filteredViewModels.length}</span> items listed
          </Badge>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by product name, category, or brand"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#13110F] focus:bg-white"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 md:pb-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-ink-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === c.id
                    ? 'bg-ink-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* AG Grid Enterprise View */}
      {viewMode === 'aggrid' ? (
        <Card className="p-0 overflow-hidden border border-slate-200/80">
          <div className="ag-theme-quartz w-full" style={{ height: 480 }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={10}
              rowHeight={44}
              headerHeight={40}
              animateRows={false}
              suppressCellFocus={true}
            />
          </div>
        </Card>
      ) : (
        /* Cards View with Pagination */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedViewModels.map(vm => {
              const { product, listings, minPrice, maxPrice, totalStock, categoryName } = vm;

              return (
                <Card
                  key={product.id}
                  className="flex flex-col justify-between overflow-hidden p-0 border border-slate-200/80"
                >
                  {/* Product Image Header with Lazy Loading */}
                  <div className="h-40 w-full bg-slate-100 relative overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-medium bg-[#13110F]/85 backdrop-blur-sm text-[#FAF7F2] px-2.5 py-0.5 rounded-full capitalize">
                        {categoryName || product.brand}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5">
                      {totalStock > 0 ? (
                        <Badge variant="success" dot size="sm">
                          <span className="tabular-nums">{totalStock}</span> in stock
                        </Badge>
                      ) : (
                        <Badge variant="danger" dot size="sm">
                          Out of stock
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span>{product.brand}</span>
                        <span className="font-mono text-[10px] text-slate-400">GTIN: {product.gtin || 'N/A'}</span>
                      </div>
                      <h3 className="text-xs font-semibold text-ink-950 line-clamp-2 leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Price and Action */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Unit range</span>
                        <span className="text-xs font-semibold text-ink-950 tabular-nums">
                          {listings.length > 1
                            ? `${formatCurrency(minPrice)} – ${formatCurrency(maxPrice)}`
                            : formatCurrency(minPrice)}
                        </span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProduct(product)}
                        rightIcon={<ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                      >
                        Compare
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Cards View Pagination Controls */}
          {filteredViewModels.length > ITEMS_PER_PAGE && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                Showing{' '}
                <span className="font-medium text-slate-900 font-mono">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium text-slate-900 font-mono">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredViewModels.length)}
                </span>{' '}
                of{' '}
                <span className="font-medium text-slate-900 font-mono">
                  {filteredViewModels.length}
                </span>{' '}
                products
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 text-xs rounded-md font-mono transition-colors ${
                          currentPage === pageNum
                            ? 'bg-ink-900 text-white font-medium shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Multi-Supplier Price Comparison Modal */}
      {selectedProduct && (
        <Modal
          isOpen={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          title={selectedProduct.name}
          subtitle={`Brand: ${selectedProduct.brand} · ${selectedProduct.category_name || 'Commercial Grade'}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            {/* Image & Specifications Overview */}
            <div className="flex flex-col sm:flex-row gap-4 p-3.5 rounded-lg bg-slate-50/80 border border-slate-200/80">
              <img
                src={selectedProduct.image_url}
                alt={selectedProduct.name}
                loading="lazy"
                decoding="async"
                className="w-28 h-28 rounded-md object-cover border border-slate-200 flex-shrink-0"
              />
              <div className="flex-1 space-y-1.5 text-xs">
                <p className="text-slate-700 leading-relaxed">{selectedProduct.description}</p>
                <div className="pt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600">
                  {Object.entries(selectedProduct.specifications || {}).map(([key, val]) => (
                    <div key={key} className="flex justify-between border-b border-slate-200/50 pb-0.5">
                      <span className="text-slate-400">{key}:</span>
                      <span className="font-medium text-slate-800">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Multi-Supplier Offerings Comparison */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-ink-950 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-500" /> Contracted supplier quotations
                </h4>
                <span className="text-[11px] text-slate-500 tabular-nums">
                  {supplierListings.length} suppliers available
                </span>
              </div>

              {supplierListings.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200/80 rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200/80">
                      <tr>
                        <th className="py-2 px-3 font-medium">Supplier</th>
                        <th className="py-2 px-3 font-medium text-right">Unit price</th>
                        <th className="py-2 px-3 font-medium text-center">Stock</th>
                        <th className="py-2 px-3 font-medium text-center">Lead time</th>
                        <th className="py-2 px-3 font-medium text-center">MOQ</th>
                        <th className="py-2 px-3 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {supplierListings.map(listing => (
                        <tr key={listing.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3">
                            <span className="font-medium text-ink-950 block">{listing.supplier_name}</span>
                            <span className="text-[10px] text-slate-400">Verified Supplier Partner</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-ink-950 tabular-nums">
                            {formatCurrency(listing.unit_price)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <Badge variant={listing.available_stock > 20 ? 'neutral' : 'warning'} size="sm" dot>
                              <span className="tabular-nums">{listing.available_stock}</span>
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-600 tabular-nums">
                            {listing.estimated_delivery_days} days
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-600 font-mono tabular-nums">
                            {listing.min_order_quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right">
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
                <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  No active supplier listings found for this product
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
