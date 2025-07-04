import { useState } from 'react';
import { Customer } from '../types';
import { mockCustomers } from '../data/mockData';

export const useCustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const addCustomer = (newCustomer: Omit<Customer, 'id' | 'installationDate' | 'devices' | 'serviceHistory'>) => {
    const customer: Customer = {
      ...newCustomer,
      id: Date.now().toString(),
      installationDate: new Date(),
      devices: [],
      serviceHistory: []
    };
    setCustomers(prev => [...prev, customer]);
    setIsAddModalOpen(false);
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers(prev => 
      prev.map(customer => 
        customer.id === updatedCustomer.id ? updatedCustomer : customer
      )
    );
    setIsEditModalOpen(false);
    setSelectedCustomer(null);
  };

  const deleteCustomer = (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setCustomers(prev => prev.filter(customer => customer.id !== id));
    }
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const openViewModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  const updateCustomerStatus = (id: string, status: Customer['status']) => {
    setCustomers(prev => 
      prev.map(customer => 
        customer.id === id ? { ...customer, status } : customer
      )
    );
  };

  return {
    customers,
    isAddModalOpen,
    isEditModalOpen,
    isViewModalOpen,
    selectedCustomer,
    setIsAddModalOpen,
    setIsEditModalOpen,
    setIsViewModalOpen,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    openEditModal,
    openViewModal,
    updateCustomerStatus
  };
};