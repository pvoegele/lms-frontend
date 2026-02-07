import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Warehouse as WarehouseIcon, Search } from 'lucide-react';
import { api } from '../config/api';
import type { Warehouse } from '../types/warehouse';
import { DataTable } from '@/components/DataTable';
import type { Column } from '@/components/DataTable';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { handleApiError } from '@/lib/toast';

export default function Warehouses() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  // Fetch warehouses
  const { data: warehouses = [], isLoading, error } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      try {
        const response = await api.get('/warehouses/');
        return response.data as Warehouse[];
      } catch (err) {
        handleApiError(err, 'Failed to fetch warehouses');
        throw err;
      }
    },
  });

  // Filter warehouses
  const filteredWarehouses = warehouses.filter((warehouse) => {
    const matchesSearch =
      searchQuery === '' ||
      warehouse.warehouse_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.warehouse_code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesActive = filterActive === null || warehouse.is_active === filterActive;

    return matchesSearch && matchesActive;
  });

  const columns: Column<Warehouse>[] = [
    {
      key: 'warehouse_code',
      header: 'Code',
      cell: (warehouse) => (
        <span className="font-mono text-sm font-medium">{warehouse.warehouse_code}</span>
      ),
      sortable: true,
      className: 'w-[120px]',
    },
    {
      key: 'warehouse_name',
      header: 'Name',
      cell: (warehouse) => (
        <span className="font-medium text-gray-900">{warehouse.warehouse_name}</span>
      ),
      sortable: true,
    },
    {
      key: 'is_active',
      header: 'Status',
      cell: (warehouse) => (
        <Badge variant={warehouse.is_active ? 'default' : 'secondary'}>
          {warehouse.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
      sortable: true,
      className: 'w-[100px]',
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">
            <WarehouseIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Warehouses</h2>
            <p className="text-sm text-gray-500">Manage warehouse locations</p>
          </div>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Failed to load warehouses. Please try again.</p>
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">
            <WarehouseIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Warehouses</h2>
            <p className="text-sm text-gray-500">
              {filteredWarehouses.length} {filteredWarehouses.length === 1 ? 'warehouse' : 'warehouses'}
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
                placeholder="Search by name or code..."
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
        data={filteredWarehouses}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No warehouses found. Try adjusting your filters."
        getRowKey={(warehouse) => warehouse.warehouse_id}
      />
    </div>
  );
}
