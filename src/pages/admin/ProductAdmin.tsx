import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { api } from '@/config/api';
import type { Product, UnitOfMeasure } from '@/types/warehouse';

interface ApiError {
  response?: {
    data?: {
      detail?: string;
      errors?: Record<string, string>;
    };
  };
}

export default function ProductAdmin() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category_id: '',
    base_uom_id: '',
    is_active: true,
    track_by_serial: false,
    track_by_lot: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get<Product[]>('/products/');
      return response.data;
    },
  });

  // Fetch UOMs for dropdown
  const { data: uoms = [] } = useQuery({
    queryKey: ['uoms'],
    queryFn: async () => {
      const response = await api.get<UnitOfMeasure[]>('/products/uom');
      return response.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post('/products/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
      handleCloseForm();
    },
    onError: (error: ApiError) => {
      const errorMessage = error.response?.data?.detail || 'Failed to create product';
      toast.error(errorMessage);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: typeof formData }) => {
      const response = await api.put(`/products/${data.id}`, data.updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
      handleCloseForm();
    },
    onError: (error: ApiError) => {
      const errorMessage = error.response?.data?.detail || 'Failed to update product';
      toast.error(errorMessage);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
      setIsDeleteOpen(false);
      setDeletingProduct(null);
    },
    onError: (error: ApiError) => {
      const errorMessage = error.response?.data?.detail || 'Failed to delete product';
      toast.error(errorMessage);
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    } else if (formData.sku.length > 100) {
      newErrors.sku = 'SKU must not exceed 100 characters';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.length > 250) {
      newErrors.name = 'Product name must not exceed 250 characters';
    }
    
    if (!formData.base_uom_id) {
      newErrors.base_uom_id = 'Unit of measure is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.product_id, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      category_id: product.category_id || '',
      base_uom_id: product.base_uom_id,
      is_active: product.is_active,
      track_by_serial: product.track_by_serial,
      track_by_lot: product.track_by_lot,
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setFormData({
      sku: '',
      name: '',
      description: '',
      category_id: '',
      base_uom_id: '',
      is_active: true,
      track_by_serial: false,
      track_by_lot: false,
    });
    setErrors({});
  };

  const getUomName = (uomId: string) => {
    const uom = uoms.find(u => u.unit_id === uomId);
    return uom?.name || 'Unknown';
  };

  const filteredProducts = products.filter(prod =>
    prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg">
          <Package className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-sm text-gray-500">Manage product catalog</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search products..."
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
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-500">Loading products...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-sm text-gray-500">
                {searchTerm ? 'No products found' : 'No products yet'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.product_id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                    {product.name}
                    {product.is_active ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    {product.track_by_serial && (
                      <Badge variant="outline">Serialized</Badge>
                    )}
                    {product.track_by_lot && (
                      <Badge variant="outline">Lot Tracked</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    SKU: {product.sku} | UOM: {getUomName(product.base_uom_id)}
                    {product.description && ` | ${product.description}`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(product)}>
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
                {editingProduct ? 'Edit Product' : 'Create Product'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Update product information' : 'Add a new product to the catalog'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="sku">
                  SKU <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g., PROD001"
                  disabled={!!editingProduct}
                  maxLength={100}
                />
                {errors.sku && (
                  <p className="text-sm text-red-600">{errors.sku}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Widget A"
                  maxLength={250}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="base_uom_id">
                  Unit of Measure <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.base_uom_id}
                  onValueChange={(value) => setFormData({ ...formData, base_uom_id: value })}
                >
                  <SelectTrigger id="base_uom_id">
                    <SelectValue placeholder="Select UOM" />
                  </SelectTrigger>
                  <SelectContent>
                    {uoms.map((uom) => (
                      <SelectItem key={uom.unit_id} value={uom.unit_id}>
                        {uom.name} ({uom.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.base_uom_id && (
                  <p className="text-sm text-red-600">{errors.base_uom_id}</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Active
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="track_by_serial"
                    checked={formData.track_by_serial}
                    onChange={(e) => setFormData({ ...formData, track_by_serial: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <Label htmlFor="track_by_serial" className="cursor-pointer">
                    Track by Serial Number
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="track_by_lot"
                    checked={formData.track_by_lot}
                    onChange={(e) => setFormData({ ...formData, track_by_lot: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <Label htmlFor="track_by_lot" className="cursor-pointer">
                    Track by Lot Number
                  </Label>
                </div>
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
                {editingProduct ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingProduct?.name}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingProduct && deleteMutation.mutate(deletingProduct.product_id)}
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
