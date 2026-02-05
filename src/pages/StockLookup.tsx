import { useState } from 'react';
import { Search, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../config/api';
import { Product } from '../types/warehouse';

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

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Search className="w-7 h-7 text-purple-600" />
          Stock Lookup
        </h2>

        {/* Search Box */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
            placeholder="Search by product name or code..."
          />
        </div>

        {/* Results */}
        {isLoading && (
          <div className="text-center py-8 text-gray-500">
            Loading products...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Error loading products. Check your connection.
          </div>
        )}

        {!isLoading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No products found matching your search' : 'No products available'}
          </div>
        )}

        {!isLoading && !error && filteredProducts.length > 0 && (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <div
                key={product.product_id}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {product.product_name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Code: {product.product_code}
                    </p>
                    {product.description && (
                      <p className="text-sm text-gray-500 mb-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        product.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {product.is_serialized && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          Serialized
                        </span>
                      )}
                      {product.is_lot_tracked && (
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                          Lot Tracked
                        </span>
                      )}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 font-mono">
                        ID: {product.product_id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm mb-1">Total Products</p>
          <p className="text-3xl font-bold text-gray-800">{products.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm mb-1">Active Products</p>
          <p className="text-3xl font-bold text-gray-800">
            {products.filter(p => p.is_active).length}
          </p>
        </div>
      </div>
    </div>
  );
}
