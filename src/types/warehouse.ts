export interface Product {
  product_id: string;
  product_code: string;
  product_name: string;
  description?: string;
  category_id?: string;
  uom_id: string;
  is_active: boolean;
  is_serialized: boolean;
  is_lot_tracked: boolean;
}

export interface StockDocument {
  doc_id: string;
  doc_number: string;
  doc_type: 'receiving' | 'shipping' | 'transfer' | 'adjustment';
  doc_status: 'draft' | 'posted' | 'cancelled';
  doc_date: string;
  source_warehouse_id?: string;
  dest_warehouse_id?: string;
  notes?: string;
  lines?: StockDocumentLine[];
}

export interface StockDocumentLine {
  line_id?: string;
  line_number: string;
  product_id: string;
  source_location_id?: string;
  dest_location_id?: string;
  quantity: number;
  uom_id: string;
  lot_number?: string;
  serial_number?: string;
}

export interface Warehouse {
  warehouse_id: string;
  warehouse_code: string;
  warehouse_name: string;
  is_active: boolean;
}

export interface StorageLocation {
  location_id: string;
  location_code: string;
  location_name: string;
  warehouse_id: string;
  is_active: boolean;
}

export interface UnitOfMeasure {
  uom_id: string;
  uom_code: string;
  uom_name: string;
  base_uom_id?: string;
  conversion_factor: number;
}

export interface InventoryBalance {
  balance_id: string;
  product_id: string;
  warehouse_id: string;
  location_id: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
}

export interface CreateStockDocumentPayload {
  doc_number: string;
  doc_type: 'receiving' | 'shipping' | 'transfer' | 'adjustment';
  doc_date: string;
  source_warehouse_id?: string;
  dest_warehouse_id?: string;
  notes?: string;
  lines: {
    line_number: string;
    product_id: string;
    source_location_id?: string;
    dest_location_id?: string;
    quantity: number;
    uom_id: string;
    lot_number?: string;
    serial_number?: string;
  }[];
}
