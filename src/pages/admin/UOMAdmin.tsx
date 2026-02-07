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
    uom_code: '',
    uom_name: '',
    base_uom_id: '',
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
        base_uom_id: data.base_uom_id || undefined,
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
        base_uom_id: data.updates.base_uom_id || undefined,
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
    
    if (!formData.uom_code.trim()) {
      newErrors.uom_code = 'UOM code is required';
    }
    
    if (!formData.uom_name.trim()) {
      newErrors.uom_name = 'UOM name is required';
    } else if (formData.uom_name.length < 2) {
      newErrors.uom_name = 'UOM name must be at least 2 characters';
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
      updateMutation.mutate({ id: editingUOM.uom_id, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (uom: UnitOfMeasure) => {
    setEditingUOM(uom);
    setFormData({
      uom_code: uom.uom_code,
      uom_name: uom.uom_name,
      base_uom_id: uom.base_uom_id || '',
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
    setFormData({ uom_code: '', uom_name: '', base_uom_id: '', conversion_factor: '1' });
    setErrors({});
  };

  const getBaseUomName = (baseUomId: string | undefined) => {
    if (!baseUomId) return 'Base Unit';
    const uom = uoms.find(u => u.uom_id === baseUomId);
    return uom?.uom_name || 'Unknown';
  };

  const filteredUOMs = uoms.filter(uom =>
    uom.uom_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uom.uom_code.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Card key={uom.uom_id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {uom.uom_name} ({uom.uom_code})
                    {!uom.base_uom_id && (
                      <Badge variant="default" className="bg-blue-100 text-blue-800">Base Unit</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {uom.base_uom_id ? (
                      <>
                        Conversion: {uom.conversion_factor} × {getBaseUomName(uom.base_uom_id)}
                      </>
                    ) : (
                      <>Base unit of measure</>
                    )}
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
                <Label htmlFor="uom_code">
                  UOM Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="uom_code"
                  value={formData.uom_code}
                  onChange={(e) => setFormData({ ...formData, uom_code: e.target.value })}
                  placeholder="e.g., EA, BOX, KG"
                  disabled={!!editingUOM}
                />
                {errors.uom_code && (
                  <p className="text-sm text-red-600">{errors.uom_code}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="uom_name">
                  UOM Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="uom_name"
                  value={formData.uom_name}
                  onChange={(e) => setFormData({ ...formData, uom_name: e.target.value })}
                  placeholder="e.g., Each, Box, Kilogram"
                />
                {errors.uom_name && (
                  <p className="text-sm text-red-600">{errors.uom_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="base_uom_id">Base UOM (Optional)</Label>
                <Select
                  value={formData.base_uom_id}
                  onValueChange={(value) => setFormData({ ...formData, base_uom_id: value })}
                >
                  <SelectTrigger id="base_uom_id">
                    <SelectValue placeholder="Select base UOM (leave empty for base unit)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (This is a base unit)</SelectItem>
                    {uoms
                      .filter(u => u.uom_id !== editingUOM?.uom_id)
                      .map((uom) => (
                        <SelectItem key={uom.uom_id} value={uom.uom_id}>
                          {uom.uom_name} ({uom.uom_code})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  If this UOM is derived from another (e.g., Box = 12 × Each), select the base UOM
                </p>
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
                  How many base units equals one of this unit? (e.g., if 1 Box = 12 Each, enter 12)
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
              Are you sure you want to delete <strong>{deletingUOM?.uom_name}</strong>?
              This action cannot be undone and may affect products using this UOM.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingUOM && deleteMutation.mutate(deletingUOM.uom_id)}
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
