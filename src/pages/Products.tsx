import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, Search } from 'lucide-react';
import { api } from '../config/api';
import type { Product } from '../types/warehouse';
import { DataTable } from '@/components/DataTable';
import type { Column } from '@/components/DataTable';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { handleApiError } from '@/lib/toast';

export default function Products() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  // Fetch products
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const response = await api.get('/products/');
        return response.data as Product[];
      } catch (err) {
        handleApiError(err, 'Failed to fetch products');
        throw err;
      }
    },
  });

  // Filter products based on search and active filter
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === '' ||
      product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.product_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesActive = filterActive === null || product.is_active === filterActive;

    return matchesSearch && matchesActive;
  });

  const columns: Column<Product>[] = [
    {
      key: 'product_code',
      header: 'Code',
      cell: (product) => (
        <span className="font-mono text-sm font-medium">{product.product_code}</span>
      ),
      sortable: true,
      className: 'w-[120px]',
    },
    {
      key: 'product_name',
      header: 'Name',
      cell: (product) => (
        <div>
          <div className="font-medium text-gray-900">{product.product_name}</div>
          {product.description && (
            <div className="text-sm text-gray-500 truncate max-w-md">
              {product.description}
            </div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'is_active',
      header: 'Status',
      cell: (product) => (
        <Badge variant={product.is_active ? 'default' : 'secondary'}>
          {product.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
      sortable: true,
      className: 'w-[100px]',
    },
    {
      key: 'is_serialized',
      header: 'Tracking',
      cell: (product) => (
        <div className="flex gap-1 flex-wrap">
          {product.is_serialized && (
            <Badge variant="outline" className="text-xs">
              Serial
            </Badge>
          )}
          {product.is_lot_tracked && (
            <Badge variant="outline" className="text-xs">
              Lot
            </Badge>
          )}
          {!product.is_serialized && !product.is_lot_tracked && (
            <span className="text-sm text-gray-400">None</span>
          )}
        </div>
      ),
      className: 'w-[120px]',
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Products</h2>
            <p className="text-sm text-gray-500">Manage product catalog</p>
          </div>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Failed to load products. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Products</h2>
            <p className="text-sm text-gray-500">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, code, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterActive(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterActive === null
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterActive(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterActive === true
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterActive(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterActive === false
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        data={filteredProducts}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No products found. Try adjusting your filters."
        getRowKey={(product) => product.product_id}
      />
    </div>
  );
}
