import { useState } from 'react';
import { Plus, Trash2, Save, CheckCircle, Package } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../config/api';
import type { CreateStockDocumentPayload } from '../types/warehouse';

export default function ReceiveStock() {
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

  // Fetch products for dropdown (future use)
  // @ts-expect-error - will be used in future dropdown implementation
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/products/');
      return response.data;
    },
  });

  // Fetch UOMs (future use)
  // @ts-expect-error - will be used in future dropdown implementation
  const { data: uoms = [] } = useQuery({
    queryKey: ['uoms'],
    queryFn: async () => {
      const response = await api.get('/products/uom');
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
      // Reset form
      setDocNumber('');
      setWarehouse('');
      setLocation('');
      setNotes('');
      setLines([{ id: Date.now(), productId: '', quantity: '', uomId: '' }]);
      setTimeout(() => setSuccess(false), 3000);
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
      doc_number: docNumber || `RCV-${Date.now()}`,
      doc_type: 'receiving',
      doc_date: new Date().toISOString().split('T')[0],
      dest_warehouse_id: warehouse,
      notes,
      lines: lines.map((line, index) => ({
        line_number: String(index + 1),
        product_id: line.productId,
        dest_location_id: location,
        quantity: parseFloat(line.quantity),
        uom_id: line.uomId,
      })),
    };

    createDocument.mutate(payload);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Package className="w-7 h-7 text-green-600" />
          Receive Stock
        </h2>

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">Stock received successfully!</p>
              <p className="text-sm text-green-700">Document has been created in draft status</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Number (optional)
              </label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                placeholder="Auto-generated if empty"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warehouse ID *
              </label>
              <input
                type="text"
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                placeholder="Enter warehouse UUID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storage Location ID *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                placeholder="Enter location UUID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Optional notes..."
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Items</h3>
              <button
                type="button"
                onClick={addLine}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {lines.map((line, index) => (
                <div key={line.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-700">Item #{index + 1}</span>
                    {lines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product ID *
                    </label>
                    <input
                      type="text"
                      value={line.productId}
                      onChange={(e) => updateLine(line.id, 'productId', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter product UUID"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={line.quantity}
                        onChange={(e) => updateLine(line.id, 'quantity', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        UOM ID *
                      </label>
                      <input
                        type="text"
                        value={line.uomId}
                        onChange={(e) => updateLine(line.id, 'uomId', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter UOM UUID"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={createDocument.isPending}
            className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Save className="w-6 h-6" />
            {createDocument.isPending ? 'Creating...' : 'Create Receiving Document'}
          </button>
        </form>
      </div>
    </div>
  );
}
