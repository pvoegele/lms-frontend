export interface Product {
  product_id: string;
  sku: string;
  name: string;
  description?: string;
  category_id?: string;
  base_uom_id: string;
  is_active: boolean;
  track_by_serial: boolean;
  track_by_lot: boolean;
  created_at?: string;
  updated_at?: string;
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
  code: string;
  name: string;
  address?: string;
  manager?: string;
  capacity_notes?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StorageLocation {
  location_id: string;
  code: string;
  name: string;
  warehouse_id: string;
  location_type: 'standard_rack' | 'high_shelf' | 'floor_space' | 'cold_storage' | 'quarantine_zone' | 'receiving_dock' | 'shipping_dock';
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UnitOfMeasure {
  unit_id: string;
  code: string;
  name: string;
  category: string;
  is_base_unit: boolean;
  conversion_factor: number;
  created_at?: string;
  updated_at?: string;
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
