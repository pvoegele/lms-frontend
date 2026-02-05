import { useState } from 'react';
import { Plus, Trash2, TruckIcon, CheckCircle2 } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../config/api';
import type { CreateStockDocumentPayload } from '../types/warehouse';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ShipStock() {
  const [docNumber, setDocNumber] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Array<{
    id: number;
    productId: string;
    quantity: string;
    uomId: string;
  }>>([{ id: 1, productId: '', quantity: '', uomId: '' }]);
  const [success, setSuccess] = useState(false);

  // Fetch products (future use)
  // @ts-expect-error - will be used in future dropdown implementation
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/products/');
      return response.data;
    },
  });

  // Create stock document mutation
  const createDocument = useMutation({
    mutationFn: async (payload: CreateStockDocumentPayload) => {
      const response = await api.post('/stock-documents/', payload);
      return response.data;
    },
    onSuccess: () => {
      setSuccess(true);
      setDocNumber('');
      setWarehouse('');
      setLocation('');
      setNotes('');
      setLines([{ id: Date.now(), productId: '', quantity: '', uomId: '' }]);
      setTimeout(() => setSuccess(false), 4000);
    },
  });

  const addLine = () => {
    setLines([...lines, { id: Date.now(), productId: '', quantity: '', uomId: '' }]);
  };

  const removeLine = (id: number) => {
    if (lines.length > 1) {
      setLines(lines.filter(line => line.id !== id));
    }
  };

  const updateLine = (id: number, field: string, value: string) => {
    setLines(lines.map(line => 
      line.id === id ? { ...line, [field]: value } : line
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload: CreateStockDocumentPayload = {
      doc_number: docNumber || `SHP-${Date.now()}`,
      doc_type: 'shipping',
      doc_date: new Date().toISOString().split('T')[0],
      source_warehouse_id: warehouse,
      notes,
      lines: lines.map((line, index) => ({
        line_number: String(index + 1),
        product_id: line.productId,
        source_location_id: location,
        quantity: parseFloat(line.quantity),
        uom_id: line.uomId,
      })),
    };

    createDocument.mutate(payload);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <TruckIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ship Stock</h2>
            <p className="text-sm text-gray-500">Process outbound shipments and update stock levels</p>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {success && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">Shipment created successfully!</p>
                <p className="text-sm text-blue-700">Document has been created in draft status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
            <CardDescription>Basic information for the shipping document</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">
                Document Number <span className="text-gray-400">(optional)</span>
              </label>
              <Input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="Auto-generated if empty"
                className="h-12"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">
                Warehouse ID <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                required
                placeholder="Enter warehouse UUID"
                className="h-12 font-mono text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">
                Storage Location ID <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder="Enter location UUID"
                className="h-12 font-mono text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional notes..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Line Items Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Items to Ship</CardTitle>
                <CardDescription>Products to ship from inventory</CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {lines.length} {lines.length === 1 ? 'item' : 'items'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {lines.map((line, index) => (
              <div key={line.id}>
                {index > 0 && <Separator className="my-4" />}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-sm font-semibold text-blue-700">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-700">Item #{index + 1}</span>
                    </div>
                    {lines.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLine(line.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-2 block">
                      Product ID <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={line.productId}
                      onChange={(e) => updateLine(line.id, 'productId', e.target.value)}
                      required
                      placeholder="Enter product UUID"
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-900 mb-2 block">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={line.quantity}
                        onChange={(e) => updateLine(line.id, 'quantity', e.target.value)}
                        required
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-900 mb-2 block">
                        UOM ID <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={line.uomId}
                        onChange={(e) => updateLine(line.id, 'uomId', e.target.value)}
                        required
                        placeholder="Enter UOM UUID"
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addLine}
              className="w-full border-dashed border-2 h-12 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={createDocument.isPending}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
        >
          <TruckIcon className="h-5 w-5 mr-2" />
          {createDocument.isPending ? 'Creating...' : 'Create Shipping Document'}
        </Button>
      </form>
    </div>
  );
}
