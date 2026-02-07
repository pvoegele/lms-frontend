import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Search } from 'lucide-react';
import { api } from '../config/api';
import type { StorageLocation } from '../types/warehouse';
import { DataTable } from '@/components/DataTable';
import type { Column } from '@/components/DataTable';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { handleApiError } from '@/lib/toast';

export default function StorageLocations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  // Fetch storage locations
  const { data: locations = [], isLoading, error } = useQuery({
    queryKey: ['storage-locations'],
    queryFn: async () => {
      try {
        const response = await api.get('/storage-locations/');
        return response.data as StorageLocation[];
      } catch (err) {
        handleApiError(err, 'Failed to fetch storage locations');
        throw err;
      }
    },
  });

  // Filter locations
  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      searchQuery === '' ||
      location.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.location_code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesActive = filterActive === null || location.is_active === filterActive;

    return matchesSearch && matchesActive;
  });

  const columns: Column<StorageLocation>[] = [
    {
      key: 'location_code',
      header: 'Code',
      cell: (location) => (
        <span className="font-mono text-sm font-medium">{location.location_code}</span>
      ),
      sortable: true,
      className: 'w-[120px]',
    },
    {
      key: 'location_name',
      header: 'Name',
      cell: (location) => (
        <span className="font-medium text-gray-900">{location.location_name}</span>
      ),
      sortable: true,
    },
    {
      key: 'warehouse_id',
      header: 'Warehouse',
      cell: (location) => (
        <span className="text-sm text-gray-600 font-mono truncate max-w-[200px] block">
          {location.warehouse_id}
        </span>
      ),
      className: 'w-[200px]',
    },
    {
      key: 'is_active',
      header: 'Status',
      cell: (location) => (
        <Badge variant={location.is_active ? 'default' : 'secondary'}>
          {location.is_active ? 'Active' : 'Inactive'}
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Storage Locations</h2>
            <p className="text-sm text-gray-500">Manage storage locations</p>
          </div>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Failed to load storage locations. Please try again.</p>
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Storage Locations</h2>
            <p className="text-sm text-gray-500">
              {filteredLocations.length} {filteredLocations.length === 1 ? 'location' : 'locations'}
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
        data={filteredLocations}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No storage locations found. Try adjusting your filters."
        getRowKey={(location) => location.location_id}
      />
    </div>
  );
}
