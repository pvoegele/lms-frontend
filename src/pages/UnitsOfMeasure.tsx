import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Scale, Search } from 'lucide-react';
import { api } from '../config/api';
import type { UnitOfMeasure } from '../types/warehouse';
import { DataTable } from '@/components/DataTable';
import type { Column } from '@/components/DataTable';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { handleApiError } from '@/lib/toast';

export default function UnitsOfMeasure() {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch UOMs
  const { data: uoms = [], isLoading, error } = useQuery({
    queryKey: ['uoms'],
    queryFn: async () => {
      try {
        const response = await api.get('/products/uom');
        return response.data as UnitOfMeasure[];
      } catch (err) {
        handleApiError(err, 'Failed to fetch units of measure');
        throw err;
      }
    },
  });

  // Filter UOMs based on search
  const filteredUoms = uoms.filter((uom) => {
    return (
      searchQuery === '' ||
      uom.uom_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uom.uom_code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const columns: Column<UnitOfMeasure>[] = [
    {
      key: 'uom_code',
      header: 'Code',
      cell: (uom) => (
        <span className="font-mono text-sm font-medium">{uom.uom_code}</span>
      ),
      sortable: true,
      className: 'w-[120px]',
    },
    {
      key: 'uom_name',
      header: 'Name',
      cell: (uom) => (
        <span className="font-medium text-gray-900">{uom.uom_name}</span>
      ),
      sortable: true,
    },
    {
      key: 'base_uom_id',
      header: 'Type',
      cell: (uom) => (
        <Badge variant={uom.base_uom_id ? 'outline' : 'default'}>
          {uom.base_uom_id ? 'Derived' : 'Base'}
        </Badge>
      ),
      sortable: true,
      className: 'w-[100px]',
    },
    {
      key: 'conversion_factor',
      header: 'Conversion Factor',
      cell: (uom) => (
        <span className="text-sm text-gray-700 font-mono">
          {uom.conversion_factor}
        </span>
      ),
      sortable: true,
      className: 'w-[150px]',
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Units of Measure</h2>
            <p className="text-sm text-gray-500">Manage measurement units</p>
          </div>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Failed to load units of measure. Please try again.</p>
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Units of Measure</h2>
            <p className="text-sm text-gray-500">
              {filteredUoms.length} {filteredUoms.length === 1 ? 'unit' : 'units'}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        data={filteredUoms}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No units of measure found."
        getRowKey={(uom) => uom.uom_id}
      />
    </div>
  );
}
