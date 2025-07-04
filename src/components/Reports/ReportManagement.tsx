import React, { useState } from 'react';
import { Download, Calendar, BarChart3, TrendingUp, Package, Users, ArrowLeftRight, FileText, Printer } from 'lucide-react';
import { mockStockItems, mockTransactions, mockCustomers, mockStaff } from '../../data/mockData';

const ReportManagement: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('stock');
  const [dateRange, setDateRange] = useState('month');
  const [isExporting, setIsExporting] = useState(false);

  const reportTypes = [
    { id: 'stock', name: 'Stock Report', icon: Package },
    { id: 'transactions', name: 'Transaction Report', icon: ArrowLeftRight },
    { id: 'customers', name: 'Customer Report', icon: Users },
    { id: 'performance', name: 'Performance Report', icon: TrendingUp }
  ];

  const stockStats = {
    totalItems: mockStockItems.length,
    totalValue: mockStockItems.reduce((sum, item) => sum + (item.quantity * item.price), 0),
    lowStockItems: mockStockItems.filter(item => item.quantity <= item.minStock).length,
    categories: [...new Set(mockStockItems.map(item => item.category))].length
  };

  const transactionStats = {
    totalTransactions: mockTransactions.length,
    pendingTransactions: mockTransactions.filter(t => t.status === 'pending').length,
    completedTransactions: mockTransactions.filter(t => t.status === 'completed').length,
    installationCount: mockTransactions.filter(t => t.type === 'installation').length
  };

  const customerStats = {
    totalCustomers: mockCustomers.length,
    activeCustomers: mockCustomers.filter(c => c.status === 'active').length,
    businessCustomers: mockCustomers.filter(c => c.serviceType === 'business').length,
    residentialCustomers: mockCustomers.filter(c => c.serviceType === 'residential').length
  };

  const performanceStats = {
    totalStaff: mockStaff.length,
    averageRating: mockStaff.reduce((sum, staff) => sum + staff.performance.rating, 0) / mockStaff.length,
    totalCompletedJobs: mockStaff.reduce((sum, staff) => sum + staff.performance.completedJobs, 0),
    averageEfficiency: mockStaff.reduce((sum, staff) => sum + staff.performance.efficiency, 0) / mockStaff.length
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleExportReport = async (format: 'excel' | 'pdf') => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const reportName = reportTypes.find(t => t.id === selectedReport)?.name || 'Report';
    const fileName = `${reportName}_${dateRange}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    
    alert(`${reportName} exported successfully as ${fileName}`);
    setIsExporting(false);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const renderStockReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-600">Total Items</h3>
          <p className="text-2xl font-bold text-blue-900">{stockStats.totalItems}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-600">Total Value</h3>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(stockStats.totalValue)}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-600">Low Stock</h3>
          <p className="text-2xl font-bold text-red-900">{stockStats.lowStockItems}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-600">Categories</h3>
          <p className="text-2xl font-bold text-purple-900">{stockStats.categories}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Stock by Category</h3>
        <div className="space-y-4">
          {[...new Set(mockStockItems.map(item => item.category))].map(category => {
            const categoryItems = mockStockItems.filter(item => item.category === category);
            const categoryValue = categoryItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
            
            return (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium capitalize">{category}</p>
                  <p className="text-sm text-gray-600">{categoryItems.length} items</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(categoryValue)}</p>
                  <p className="text-sm text-gray-600">
                    {categoryItems.reduce((sum, item) => sum + item.quantity, 0)} units
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderTransactionReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-600">Total Transactions</h3>
          <p className="text-2xl font-bold text-blue-900">{transactionStats.totalTransactions}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-600">Pending</h3>
          <p className="text-2xl font-bold text-yellow-900">{transactionStats.pendingTransactions}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-600">Completed</h3>
          <p className="text-2xl font-bold text-green-900">{transactionStats.completedTransactions}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-600">Installations</h3>
          <p className="text-2xl font-bold text-purple-900">{transactionStats.installationCount}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Transaction Types</h3>
        <div className="space-y-4">
          {['installation', 'maintenance', 'return', 'borrow'].map(type => {
            const typeTransactions = mockTransactions.filter(t => t.type === type);
            
            return (
              <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium capitalize">{type}</p>
                  <p className="text-sm text-gray-600">{typeTransactions.length} transactions</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {Math.round((typeTransactions.length / mockTransactions.length) * 100)}%
                  </p>
                  <p className="text-sm text-gray-600">of total</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderCustomerReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-600">Total Customers</h3>
          <p className="text-2xl font-bold text-blue-900">{customerStats.totalCustomers}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-600">Active</h3>
          <p className="text-2xl font-bold text-green-900">{customerStats.activeCustomers}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-600">Business</h3>
          <p className="text-2xl font-bold text-purple-900">{customerStats.businessCustomers}</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-indigo-600">Residential</h3>
          <p className="text-2xl font-bold text-indigo-900">{customerStats.residentialCustomers}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Customer Distribution</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Business Customers</p>
              <p className="text-sm text-gray-600">Enterprise packages</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{customerStats.businessCustomers}</p>
              <p className="text-sm text-gray-600">
                {Math.round((customerStats.businessCustomers / customerStats.totalCustomers) * 100)}%
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Residential Customers</p>
              <p className="text-sm text-gray-600">Home packages</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{customerStats.residentialCustomers}</p>
              <p className="text-sm text-gray-600">
                {Math.round((customerStats.residentialCustomers / customerStats.totalCustomers) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformanceReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-600">Total Staff</h3>
          <p className="text-2xl font-bold text-blue-900">{performanceStats.totalStaff}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-600">Average Rating</h3>
          <p className="text-2xl font-bold text-green-900">{performanceStats.averageRating.toFixed(1)}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-600">Completed Jobs</h3>
          <p className="text-2xl font-bold text-purple-900">{performanceStats.totalCompletedJobs}</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-indigo-600">Avg Efficiency</h3>
          <p className="text-2xl font-bold text-indigo-900">{performanceStats.averageEfficiency.toFixed(0)}%</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Team Performance</h3>
        <div className="space-y-4">
          {mockStaff.map(staff => (
            <div key={staff.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{staff.name}</p>
                <p className="text-sm text-gray-600">{staff.team} - {staff.role}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">Rating: {staff.performance.rating}/5</p>
                <p className="text-sm text-gray-600">
                  {staff.performance.completedJobs} jobs, {staff.performance.efficiency}% efficiency
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'stock': return renderStockReport();
      case 'transactions': return renderTransactionReport();
      case 'customers': return renderCustomerReport();
      case 'performance': return renderPerformanceReport();
      default: return renderStockReport();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Reports & Analytics</h2>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintReport}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-5 h-5" />
              <span>Print</span>
            </button>
            <div className="relative group">
              <button
                disabled={isExporting}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                <span>{isExporting ? 'Exporting...' : 'Export'}</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button
                  onClick={() => handleExportReport('excel')}
                  disabled={isExporting}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm disabled:opacity-50"
                >
                  Export Excel
                </button>
                <button
                  onClick={() => handleExportReport('pdf')}
                  disabled={isExporting}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm disabled:opacity-50"
                >
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {reportTypes.map(type => {
            const Icon = type.icon;
            const isSelected = selectedReport === type.id;
            
            return (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="font-medium">{type.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {reportTypes.find(t => t.id === selectedReport)?.name}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
        
        {renderReportContent()}
      </div>
    </div>
  );
};

export default ReportManagement;