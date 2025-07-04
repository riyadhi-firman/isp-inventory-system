export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'staff';
  avatar?: string;
  createdAt: Date;
}

export interface StockItem {
  id: string;
  name: string;
  category: 'router' | 'switch' | 'cable' | 'modem' | 'antenna' | 'accessory';
  brand: string;
  model: string;
  quantity: number;
  minStock: number;
  unit: string;
  location: string;
  price: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  type: 'installation' | 'maintenance' | 'return' | 'borrow';
  items: TransactionItem[];
  staffId: string;
  customerId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  notes: string;
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface TransactionItem {
  stockId: string;
  quantity: number;
  notes?: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'technician' | 'supervisor' | 'admin';
  team: string;
  area: string;
  skills: string[];
  joinDate: Date;
  performance: {
    completedJobs: number;
    rating: number;
    efficiency: number;
  };
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  serviceType: 'residential' | 'business';
  packageType: string;
  status: 'active' | 'suspended' | 'terminated';
  installationDate: Date;
  devices: CustomerDevice[];
  serviceHistory: ServiceHistory[];
}

export interface CustomerDevice {
  id: string;
  stockId: string;
  serialNumber: string;
  installDate: Date;
  location: string;
  status: 'active' | 'maintenance' | 'replaced';
}

export interface ServiceHistory {
  id: string;
  type: 'installation' | 'maintenance' | 'repair' | 'upgrade';
  description: string;
  technician: string;
  date: Date;
  status: 'completed' | 'pending' | 'cancelled';
  cost: number;
}

export interface DashboardStats {
  totalStock: number;
  lowStockItems: number;
  pendingTransactions: number;
  activeCustomers: number;
  monthlyInstallations: number;
  teamPerformance: number;
}