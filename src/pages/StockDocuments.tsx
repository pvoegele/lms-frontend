import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Eye, Edit, Trash2, Filter } from 'lucide-react';
import { api } from '../config/api';
import type { StockDocument } from '../types/warehouse';
import { DataTable } from '@/components/DataTable';
import type { Column, RowAction } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { showToast, handleApiError } from '@/lib/toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DOC_TYPE_LABELS = {
  receiving: 'Receiving',
  shipping: 'Shipping',
  transfer: 'Transfer',
  adjustment: 'Adjustment',
};

const STATUS_COLORS = {
  draft: 'secondary',
  posted: 'default',
  cancelled: 'destructive',
} as const;

export default function StockDocuments() {
  const [docTypeFilter, setDocTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<StockDocument | null>(null);

  const queryClient = useQueryClient();

  // Fetch stock documents
  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ['stock-documents', docTypeFilter, statusFilter],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (docTypeFilter !== 'all') params.append('doc_type', docTypeFilter);
        if (statusFilter !== 'all') params.append('doc_status', statusFilter);
        
        const response = await api.get(`/stock-documents/?${params.toString()}`);
        return response.data as StockDocument[];
      } catch (err) {
        handleApiError(err, 'Failed to fetch stock documents');
        throw err;
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      await api.delete(`/stock-documents/${docId}`);
    },
    onSuccess: () => {
      showToast.success('Document deleted', 'Stock document has been deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['stock-documents'] });
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    },
    onError: (err) => {
      handleApiError(err, 'Failed to delete document');
    },
  });

  const handleDelete = (document: StockDocument) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (documentToDelete) {
      deleteMutation.mutate(documentToDelete.doc_id);
    }
  };

  const handleView = (document: StockDocument) => {
    // TODO: Navigate to document detail view
    showToast.info('View Document', `Opening document ${document.doc_number}`);
  };

  const handleEdit = (document: StockDocument) => {
    // TODO: Navigate to document edit page
    showToast.info('Edit Document', `Opening editor for ${document.doc_number}`);
  };

  const columns: Column<StockDocument>[] = [
    {
      key: 'doc_number',
      header: 'Document #',
      cell: (doc) => (
        <span className="font-mono text-sm font-medium">{doc.doc_number}</span>
      ),
      sortable: true,
      className: 'w-[140px]',
    },
    {
      key: 'doc_type',
      header: 'Type',
      cell: (doc) => (
        <Badge variant="outline">
          {DOC_TYPE_LABELS[doc.doc_type]}
        </Badge>
      ),
      sortable: true,
      className: 'w-[120px]',
    },
    {
      key: 'doc_status',
      header: 'Status',
      cell: (doc) => (
        <Badge variant={STATUS_COLORS[doc.doc_status]}>
          {doc.doc_status.charAt(0).toUpperCase() + doc.doc_status.slice(1)}
        </Badge>
      ),
      sortable: true,
      className: 'w-[100px]',
    },
    {
      key: 'doc_date',
      header: 'Date',
      cell: (doc) => (
        <span className="text-sm text-gray-700">
          {new Date(doc.doc_date).toLocaleDateString()}
        </span>
      ),
      sortable: true,
      className: 'w-[120px]',
    },
    {
      key: 'notes',
      header: 'Notes',
      cell: (doc) => (
        <span className="text-sm text-gray-600 truncate max-w-md block">
          {doc.notes || '-'}
        </span>
      ),
    },
  ];

  const actions: RowAction<StockDocument>[] = [
    {
      label: 'View',
      onClick: handleView,
      icon: <Eye className="h-4 w-4" />,
    },
    {
      label: 'Edit',
      onClick: handleEdit,
      icon: <Edit className="h-4 w-4" />,
    },
    {
      label: 'Delete',
      onClick: handleDelete,
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive',
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Stock Documents</h2>
            <p className="text-sm text-gray-500">Manage stock transactions</p>
          </div>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Failed to load stock documents. Please try again.</p>
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Stock Documents</h2>
            <p className="text-sm text-gray-500">
              {documents.length} {documents.length === 1 ? 'document' : 'documents'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by:</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <Select value={docTypeFilter} onValueChange={setDocTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Document Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="receiving">Receiving</SelectItem>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="posted">Posted</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        data={documents}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        emptyMessage="No stock documents found. Create your first document to get started."
        getRowKey={(doc) => doc.doc_id}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Stock Document"
        description={`Are you sure you want to delete document ${documentToDelete?.doc_number}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
