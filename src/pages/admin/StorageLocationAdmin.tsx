import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { api } from '@/config/api';
import type { StorageLocation, Warehouse } from '@/types/warehouse';

interface ApiError {
  response?: {
    data?: {
      detail?: string;
      errors?: Record<string, string>;
    };
  };
}

export default function StorageLocationAdmin() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<StorageLocation | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<StorageLocation | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    warehouse_id: '',
    location_type: 'standard_rack' as 'standard_rack' | 'high_shelf' | 'floor_space' | 'cold_storage' | 'quarantine_zone' | 'receiving_dock' | 'shipping_dock',
    is_available: true,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch storage locations
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['storage-locations'],
    queryFn: async () => {
      const response = await api.get<StorageLocation[]>('/storage-locations/');
      return response.data;
    },
  });

  // Fetch warehouses for dropdown
  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const response = await api.get<Warehouse[]>('/warehouses/');
      return response.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post('/storage-locations/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage-locations'] });
      toast.success('Storage location created successfully');
      handleCloseForm();
    },
    onError: (error: ApiError) => {
      const errorMessage = error.response?.data?.detail || 'Failed to create storage location';
      toast.error(errorMessage);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: typeof formData }) => {
      const response = await api.put(`/storage-locations/${data.id}`, data.updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage-locations'] });
      toast.success('Storage location updated successfully');
      handleCloseForm();
    },
    onError: (error: ApiError) => {
      const errorMessage = error.response?.data?.detail || 'Failed to update storage location';
      toast.error(errorMessage);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/storage-locations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage-locations'] });
      toast.success('Storage location deleted successfully');
      setIsDeleteOpen(false);
      setDeletingLocation(null);
    },
    onError: (error: ApiError) => {
      const errorMessage = error.response?.data?.detail || 'Failed to delete storage location';
      toast.error(errorMessage);
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.location_code.trim()) {
      newErrors.location_code = 'Location code is required';
    } else if (formData.location_code.length < 2) {
      newErrors.location_code = 'Location code must be at least 2 characters';
    }
    
    if (!formData.location_name.trim()) {
      newErrors.location_name = 'Location name is required';
    } else if (formData.location_name.length < 3) {
      newErrors.location_name = 'Location name must be at least 3 characters';
    }
    
    if (!formData.warehouse_id) {
      newErrors.warehouse_id = 'Warehouse is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (editingLocation) {
      updateMutation.mutate({ id: editingLocation.location_id, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (location: StorageLocation) => {
    setEditingLocation(location);
    setFormData({
      location_code: location.location_code,
      location_name: location.location_name,
      warehouse_id: location.warehouse_id,
      is_active: location.is_active,
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const handleDelete = (location: StorageLocation) => {
    setDeletingLocation(location);
    setIsDeleteOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingLocation(null);
    setFormData({ location_code: '', location_name: '', warehouse_id: '', is_active: true });
    setErrors({});
  };

  const getWarehouseName = (warehouseId: string) => {
    const warehouse = warehouses.find(w => w.warehouse_id === warehouseId);
    return warehouse?.warehouse_name || 'Unknown';
  };

  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.location_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWarehouse = warehouseFilter === 'all' || loc.warehouse_id === warehouseFilter;
    return matchesSearch && matchesWarehouse;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg">
          <MapPin className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Storage Location Management</h1>
          <p className="text-sm text-gray-500">Manage storage locations within warehouses</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {warehouses.map((wh) => (
                  <SelectItem key={wh.warehouse_id} value={wh.warehouse_id}>
                    {wh.warehouse_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-purple-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-500">Loading storage locations...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredLocations.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-sm text-gray-500">
                {searchTerm || warehouseFilter !== 'all' ? 'No locations found' : 'No storage locations yet'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredLocations.map((location) => (
            <Card key={location.location_id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {location.location_name}
                    {location.is_active ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Code: {location.location_code} | Warehouse: {getWarehouseName(location.warehouse_id)}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(location)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(location)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? 'Edit Storage Location' : 'Create Storage Location'}
              </DialogTitle>
              <DialogDescription>
                {editingLocation ? 'Update storage location information' : 'Add a new storage location'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="location_code">
                  Location Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location_code"
                  value={formData.location_code}
                  onChange={(e) => setFormData({ ...formData, location_code: e.target.value })}
                  placeholder="e.g., A-01-01"
                  disabled={!!editingLocation}
                />
                {errors.location_code && (
                  <p className="text-sm text-red-600">{errors.location_code}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_name">
                  Location Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location_name"
                  value={formData.location_name}
                  onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                  placeholder="e.g., Aisle A, Rack 1, Shelf 1"
                />
                {errors.location_name && (
                  <p className="text-sm text-red-600">{errors.location_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="warehouse_id">
                  Warehouse <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.warehouse_id}
                  onValueChange={(value) => setFormData({ ...formData, warehouse_id: value })}
                >
                  <SelectTrigger id="warehouse_id">
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh.warehouse_id} value={wh.warehouse_id}>
                        {wh.warehouse_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.warehouse_id && (
                  <p className="text-sm text-red-600">{errors.warehouse_id}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Active
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                )}
                {editingLocation ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Storage Location</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingLocation?.location_name}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingLocation && deleteMutation.mutate(deletingLocation.location_id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
