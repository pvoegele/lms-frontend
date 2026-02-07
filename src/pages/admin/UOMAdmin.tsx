import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, Ruler } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { api } from '@/config/api';
import type { UnitOfMeasure } from '@/types/warehouse';

interface ApiError {
  response?: {
    data?: {
      detail?: string;
      errors?: Record<string, string>;
    };
  };
}

export default function UOMAdmin() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingUOM, setEditingUOM] = useState<UnitOfMeasure | null>(null);
  const [deletingUOM, setDeletingUOM] = useState<UnitOfMeasure | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    is_base_unit: false,
    conversion_factor: '1',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch UOMs
  const { data: uoms = [], isLoading } = useQuery({
    queryKey: ['uoms'],
    queryFn: async () => {
      const response = await api.get<UnitOfMeasure[]>('/products/uom');
      return response.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        conversion_factor: parseFloat(data.conversion_factor),
      };
      const response = await api.post('/products/uom', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uoms'] });
      toast.success('Unit of measure created successfully');
      handleCloseForm();
    },
    onError: (error: ApiError) => {
      const errorMessage = error.response?.data?.detail || 'Failed to create unit of measure';
      toast.error(errorMessage);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: typeof formData }) => {
      const payload = {
        ...data.updates,
        conversion_factor: parseFloat(data.updates.conversion_factor),
      };
      const response = await api.put(`/products/uom/${data.id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uoms'] });
      toast.success('Unit of measure updated successfully');
      handleCloseForm();
    },
    onError: (error: ApiError) => {
      const errorMessage = error.response?.data?.detail || 'Failed to update unit of measure';
      toast.error(errorMessage);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/uom/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uoms'] });
      toast.success('Unit of measure deleted successfully');
      setIsDeleteOpen(false);
      setDeletingUOM(null);
    },
    onError: (error: ApiError) => {
      const errorMessage = error.response?.data?.detail || 'Failed to delete unit of measure';
      toast.error(errorMessage);
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'UOM code is required';
    } else if (formData.code.length > 20) {
      newErrors.code = 'UOM code must not exceed 20 characters';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'UOM name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'UOM name must not exceed 100 characters';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    } else if (formData.category.length > 50) {
      newErrors.category = 'Category must not exceed 50 characters';
    }
    
    const conversionFactor = parseFloat(formData.conversion_factor);
    if (isNaN(conversionFactor) || conversionFactor <= 0) {
      newErrors.conversion_factor = 'Conversion factor must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (editingUOM) {
      updateMutation.mutate({ id: editingUOM.unit_id, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (uom: UnitOfMeasure) => {
    setEditingUOM(uom);
    setFormData({
      code: uom.code,
      name: uom.name,
      category: uom.category,
      is_base_unit: uom.is_base_unit,
      conversion_factor: uom.conversion_factor.toString(),
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const handleDelete = (uom: UnitOfMeasure) => {
    setDeletingUOM(uom);
    setIsDeleteOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUOM(null);
    setFormData({ code: '', name: '', category: '', is_base_unit: false, conversion_factor: '1' });
    setErrors({});
  };

  const getBaseUomName = (baseUomId: string | undefined) => {
    if (!baseUomId) return 'Base Unit';
    const uom = uoms.find(u => u.unit_id === baseUomId);
    return uom?.name || 'Unknown';
  };

  const filteredUOMs = uoms.filter(uom =>
    uom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uom.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600 to-red-600 shadow-lg">
          <Ruler className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Unit of Measure Management</h1>
          <p className="text-sm text-gray-500">Manage measurement units and conversions</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add UOM
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search units of measure..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-orange-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-500">Loading units of measure...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredUOMs.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Ruler className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-sm text-gray-500">
                {searchTerm ? 'No units of measure found' : 'No units of measure yet'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredUOMs.map((uom) => (
            <Card key={uom.unit_id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {uom.name} ({uom.code})
                    {uom.is_base_unit && (
                      <Badge variant="default" className="bg-blue-100 text-blue-800">Base Unit</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Category: {uom.category} | Conversion Factor: {uom.conversion_factor}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(uom)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(uom)}>
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
                {editingUOM ? 'Edit Unit of Measure' : 'Create Unit of Measure'}
              </DialogTitle>
              <DialogDescription>
                {editingUOM ? 'Update unit of measure information' : 'Add a new unit of measure'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">
                  UOM Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., EA, BOX, KG"
                  disabled={!!editingUOM}
                />
                {errors.code && (
                  <p className="text-sm text-red-600">{errors.code}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  UOM Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Each, Box, Kilogram"
                  maxLength={100}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., weight, volume, length, each"
                  maxLength={50}
                />
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category}</p>
                )}
                <p className="text-xs text-gray-500">
                  Categorize the unit (e.g., "weight", "volume", "length", "each")
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_base_unit"
                  checked={formData.is_base_unit}
                  onChange={(e) => setFormData({ ...formData, is_base_unit: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <Label htmlFor="is_base_unit" className="cursor-pointer">
                  Base Unit (check if this is the primary unit for its category)
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conversion_factor">
                  Conversion Factor <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="conversion_factor"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={formData.conversion_factor}
                  onChange={(e) => setFormData({ ...formData, conversion_factor: e.target.value })}
                  placeholder="e.g., 1, 12, 0.001"
                />
                {errors.conversion_factor && (
                  <p className="text-sm text-red-600">{errors.conversion_factor}</p>
                )}
                <p className="text-xs text-gray-500">
                  Numeric factor for unit conversion (e.g., 1 for base units, 1000 for kg to g)
                </p>
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
                {editingUOM ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Unit of Measure</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingUOM?.name}</strong>?
              This action cannot be undone and may affect products using this UOM.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingUOM && deleteMutation.mutate(deletingUOM.unit_id)}
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
