import React, { useState } from 'react';
import { Plus, Search, Filter, User, MapPin, Phone, Mail, Wifi, Calendar, Edit, Trash2, Eye } from 'lucide-react';
import { useCustomerManagement } from '../../hooks/useCustomerManagement';
import CustomerForm from './CustomerForm';
import CustomerDetail from './CustomerDetail';

const CustomerManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const {
    customers,
    isAddModalOpen,
    isEditModalOpen,
    isViewModalOpen,
    selectedCustomer,
    setIsAddModalOpen,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    openEditModal,
    openViewModal,
    updateCustomerStatus
  } = useCustomerManagement();

  const serviceTypes = ['all', 'residential', 'business'];
  const statuses = ['all', 'active', 'suspended', 'terminated'];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesServiceType = selectedServiceType === 'all' || customer.serviceType === selectedServiceType;
    const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus;
    return matchesSearch && matchesServiceType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-600';
      case 'suspended': return 'bg-yellow-100 text-yellow-600';
      case 'terminated': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getServiceTypeColor = (type: string) => {
    return type === 'business' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Customer Management</h2>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedServiceType}
              onChange={(e) => setSelectedServiceType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {serviceTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="space-y-4">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-600">{customer.packageType}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getServiceTypeColor(customer.serviceType)}`}>
                    {customer.serviceType}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                    {customer.status}
                  </span>
                  <button 
                    onClick={() => openViewModal(customer)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4 text-gray-500" />
                  </button>
                  <button 
                    onClick={() => openEditModal(customer)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Edit Customer"
                  >
                    <Edit className="w-4 h-4 text-gray-500" />
                  </button>
                  <button 
                    onClick={() => deleteCustomer(customer.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Delete Customer"
                  >
                    <Trash2 className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{customer.address}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Installed: {customer.installationDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Wifi className="w-4 h-4" />
                    <span>Devices: {customer.devices.length}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Recent Service</h4>
                  {customer.serviceHistory.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <p>{customer.serviceHistory[0].type} - {customer.serviceHistory[0].date.toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">{customer.serviceHistory[0].description}</p>
                    </div>
                  )}
                </div>
              </div>

              {customer.devices.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Installed Devices</h4>
                  <div className="space-y-1">
                    {customer.devices.map((device) => (
                      <div key={device.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {device.serialNumber} - {device.location}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          device.status === 'active' ? 'bg-green-100 text-green-600' :
                          device.status === 'maintenance' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {device.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No customers found matching your criteria.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <CustomerForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={addCustomer}
        title="Add New Customer"
      />
      
      <CustomerForm
        isOpen={isEditModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={updateCustomer}
        initialData={selectedCustomer}
        title="Edit Customer"
      />

      {/* Customer Detail Modal */}
      <CustomerDetail
        isOpen={isViewModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        customer={selectedCustomer}
        onStatusChange={updateCustomerStatus}
      />
    </div>
  );
};

export default CustomerManagement;