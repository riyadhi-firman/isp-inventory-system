import { StockItem, Transaction, Staff, Customer, DashboardStats } from '../types';

export const mockStockItems: StockItem[] = [
  {
    id: '1',
    name: 'Cisco RV160 Router',
    category: 'router',
    brand: 'Cisco',
    model: 'RV160',
    quantity: 15,
    minStock: 10,
    unit: 'pcs',
    location: 'Warehouse A-1',
    price: 1500000,
    description: 'VPN Router with 4 Gigabit Ethernet ports',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    name: 'UTP Cable Cat6',
    category: 'cable',
    brand: 'Belden',
    model: 'Cat6',
    quantity: 500,
    minStock: 100,
    unit: 'meters',
    location: 'Warehouse B-2',
    price: 12000,
    description: 'High-quality UTP cable for network installations',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '3',
    name: 'Mikrotik hEX S',
    category: 'router',
    brand: 'Mikrotik',
    model: 'hEX S',
    quantity: 8,
    minStock: 15,
    unit: 'pcs',
    location: 'Warehouse A-2',
    price: 800000,
    description: 'Gigabit Ethernet router with SFP port',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: '4',
    name: 'Ubiquiti UniFi Switch',
    category: 'switch',
    brand: 'Ubiquiti',
    model: 'US-8-60W',
    quantity: 12,
    minStock: 8,
    unit: 'pcs',
    location: 'Warehouse A-3',
    price: 2200000,
    description: '8-port managed switch with PoE',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-21')
  },
  {
    id: '5',
    name: 'Fiber Optic Cable',
    category: 'cable',
    brand: 'Corning',
    model: 'Single Mode',
    quantity: 1000,
    minStock: 200,
    unit: 'meters',
    location: 'Warehouse B-1',
    price: 15000,
    description: 'Single mode fiber optic cable for long distance',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-22')
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'installation',
    items: [
      { stockId: '1', quantity: 1, notes: 'Customer router installation' },
      { stockId: '2', quantity: 50, notes: 'Indoor wiring' }
    ],
    staffId: '1',
    customerId: '1',
    status: 'pending',
    notes: 'New customer installation at Jl. Sudirman 123',
    createdAt: new Date('2024-01-22'),
  },
  {
    id: '2',
    type: 'maintenance',
    items: [
      { stockId: '4', quantity: 1, notes: 'Replacement switch' }
    ],
    staffId: '2',
    customerId: '2',
    status: 'approved',
    notes: 'Switch replacement due to port failure',
    createdAt: new Date('2024-01-21'),
    approvedBy: 'admin',
    approvedAt: new Date('2024-01-21')
  },
  {
    id: '3',
    type: 'return',
    items: [
      { stockId: '3', quantity: 1, notes: 'Defective unit' }
    ],
    staffId: '3',
    status: 'completed',
    notes: 'Router returned due to hardware failure',
    createdAt: new Date('2024-01-20'),
    approvedBy: 'admin',
    approvedAt: new Date('2024-01-20')
  }
];

export const mockStaff: Staff[] = [
  {
    id: '1',
    name: 'Ahmad Rizki',
    email: 'ahmad.rizki@isp.com',
    phone: '+62812345678',
    role: 'technician',
    team: 'Team Alpha',
    area: 'Jakarta Pusat',
    skills: ['Network Configuration', 'Fiber Installation', 'Troubleshooting'],
    joinDate: new Date('2023-06-15'),
    performance: {
      completedJobs: 45,
      rating: 4.8,
      efficiency: 92
    }
  },
  {
    id: '2',
    name: 'Sari Dewi',
    email: 'sari.dewi@isp.com',
    phone: '+62812345679',
    role: 'technician',
    team: 'Team Beta',
    area: 'Jakarta Selatan',
    skills: ['Router Configuration', 'Customer Support', 'Network Security'],
    joinDate: new Date('2023-03-10'),
    performance: {
      completedJobs: 38,
      rating: 4.6,
      efficiency: 87
    }
  },
  {
    id: '3',
    name: 'Budi Santoso',
    email: 'budi.santoso@isp.com',
    phone: '+62812345680',
    role: 'supervisor',
    team: 'Team Alpha',
    area: 'Jakarta Pusat',
    skills: ['Team Management', 'Project Planning', 'Quality Control'],
    joinDate: new Date('2022-11-20'),
    performance: {
      completedJobs: 62,
      rating: 4.9,
      efficiency: 95
    }
  }
];

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'PT. Teknologi Maju',
    email: 'admin@tekno-maju.com',
    phone: '+62215551234',
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    serviceType: 'business',
    packageType: 'Enterprise 100 Mbps',
    status: 'active',
    installationDate: new Date('2023-12-15'),
    devices: [
      {
        id: '1',
        stockId: '1',
        serialNumber: 'CSC001234',
        installDate: new Date('2023-12-15'),
        location: 'Server Room',
        status: 'active'
      }
    ],
    serviceHistory: [
      {
        id: '1',
        type: 'installation',
        description: 'Initial installation of Enterprise package',
        technician: 'Ahmad Rizki',
        date: new Date('2023-12-15'),
        status: 'completed',
        cost: 5000000
      }
    ]
  },
  {
    id: '2',
    name: 'Keluarga Wijaya',
    email: 'wijaya.family@gmail.com',
    phone: '+62812345555',
    address: 'Jl. Kemang Raya No. 45, Jakarta Selatan',
    serviceType: 'residential',
    packageType: 'Home 50 Mbps',
    status: 'active',
    installationDate: new Date('2024-01-10'),
    devices: [
      {
        id: '2',
        stockId: '3',
        serialNumber: 'MKT567890',
        installDate: new Date('2024-01-10'),
        location: 'Living Room',
        status: 'active'
      }
    ],
    serviceHistory: [
      {
        id: '2',
        type: 'installation',
        description: 'Residential internet installation',
        technician: 'Sari Dewi',
        date: new Date('2024-01-10'),
        status: 'completed',
        cost: 1500000
      }
    ]
  }
];

export const mockDashboardStats: DashboardStats = {
  totalStock: 1535,
  lowStockItems: 3,
  pendingTransactions: 5,
  activeCustomers: 124,
  monthlyInstallations: 18,
  teamPerformance: 91
};