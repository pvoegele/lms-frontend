import { useState } from 'react';
import { Search, Package, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../config/api';
import type { Product } from '../types/warehouse';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function StockLookup() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/products/');
      return response.data;
    },
  });

  const filteredProducts = products.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeProducts = products.filter(p => p.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
            <Search className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Stock Lookup</h2>
            <p className="text-sm text-gray-500">Search products and view inventory status</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{products.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{activeProducts}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Box */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-14 pl-12 pr-4 text-lg border-2 focus:ring-2 focus:ring-purple-500"
              placeholder="Search by product name or code..."
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-2">
              Found {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin mb-3" />
              <p>Loading products...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="font-semibold text-red-900">Error loading products</p>
              <p className="text-sm text-red-700 mt-1">Check your connection and try again</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && filteredProducts.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">
                {searchTerm ? 'No products found matching your search' : 'No products available'}
              </p>
              {searchTerm && (
                <p className="text-sm mt-1">Try a different search term</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && filteredProducts.length > 0 && (
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <Card key={product.product_id} className="transition-all hover:shadow-md hover:border-gray-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{product.product_name}</CardTitle>
                    <CardDescription className="text-sm">
                      Code: <span className="font-mono">{product.product_code}</span>
                    </CardDescription>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <Package className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardHeader>
              
              {product.description && (
                <>
                  <Separator />
                  <CardContent className="pt-4 pb-3">
                    <p className="text-sm text-gray-600">{product.description}</p>
                  </CardContent>
                </>
              )}
              
              <Separator />
              
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge 
                    variant={product.is_active ? "default" : "secondary"}
                    className={product.is_active 
                      ? "bg-green-100 text-green-700 hover:bg-green-200" 
                      : "bg-gray-100 text-gray-700"
                    }
                  >
                    {product.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {product.is_serialized && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Serialized
                    </Badge>
                  )}
                  {product.is_lot_tracked && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                      Lot Tracked
                    </Badge>
                  )}
                </div>
                
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Product ID</p>
                  <p className="text-xs font-mono text-gray-700 break-all">{product.product_id}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
