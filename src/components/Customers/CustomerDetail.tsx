import React from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, Wifi, Settings, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Customer } from '../../types';

interface CustomerDetailProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onStatusChange: (id: string, status: Customer['status']) => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ 
  isOpen, 
  onClose, 
  customer,
  onStatusChange 
}) => {
  if (!isOpen || !customer) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-600';
      case 'suspended': return 'bg-yellow-100 text-yellow-600';
      case 'terminated': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getDeviceStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'maintenance': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'replaced': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Settings className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{customer.name}</h2>
              <p className="text-sm text-gray-600">{customer.packageType}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{customer.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{customer.phone}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-700">{customer.address}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    Installed: {customer.installationDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Service Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Service Type:</span>
                  <span className="font-medium capitalize">{customer.serviceType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Package:</span>
                  <span className="font-medium">{customer.packageType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                      {customer.status}
                    </span>
                    <select
                      value={customer.status}
                      onChange={(e) => onStatusChange(customer.id, e.target.value as Customer['status'])}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Devices:</span>
                  <span className="font-medium">{customer.devices.length} installed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Installed Devices */}
          {customer.devices.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Installed Devices</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.devices.map((device) => (
                  <div key={device.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Wifi className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">{device.serialNumber}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getDeviceStatusIcon(device.status)}
                        <span className="text-sm capitalize">{device.status}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Location: {device.location}</p>
                      <p>Installed: {device.installDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service History */}
          {customer.serviceHistory.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service History</h3>
              <div className="space-y-3">
                {customer.serviceHistory.map((service) => (
                  <div key={service.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium capitalize">{service.type}</span>
                        <span className="text-sm text-gray-600 ml-2">
                          by {service.technician}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          service.status === 'completed' ? 'bg-green-100 text-green-600' :
                          service.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {service.status}
                        </span>
                        <span className="text-sm text-gray-600">
                          {service.date.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{service.description}</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      Cost: {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0
                      }).format(service.cost)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;