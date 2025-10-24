export interface Equipment {
  id: string;
  name: string;
  type: 'desktop' | 'laptop' | 'server' | 'printer' | 'other';
  brand: string;
  model: string;
  serialNumber: string;
  processor?: string;
  ram?: string;
  storage?: string;
  
  // Periféricos
  peripherals: string[];
  
  // Proveedor y garantía
  supplier: string;
  purchaseDate: string;
  warrantyExpiration: string;
  
  // Ubicación y usuario
  location: string;
  assignedUser: string;
  
  // Estado
  status: 'active' | 'maintenance' | 'inactive';
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface HistoryEntry {
  id: string;
  equipmentId: string;
  equipmentName: string;
  action: 'create' | 'update' | 'delete';
  changes: string;
  user: string;
  timestamp: string;
}
