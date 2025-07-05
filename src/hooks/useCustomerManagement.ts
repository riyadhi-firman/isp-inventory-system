import { useState, useEffect } from 'react';
import { customerAPI } from '../services/api';
import { Customer } from '../types';

export const useCustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await customerAPI.getAll();
      setCustomers(response.data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addCustomer = async (newCustomer: Omit<Customer, 'id' | 'installationDate' | 'devices' | 'serviceHistory'>) => {
    try {
      const response = await customerAPI.create(newCustomer);
      setCustomers(prev => [...prev, response.data]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('Failed to add customer');
    }
  };

  const updateCustomer = async (updatedCustomer: Customer) => {
    try {
      const response = await customerAPI.update(updatedCustomer.id, updatedCustomer);
      setCustomers(prev => 
        prev.map(customer => 
          customer.id === updatedCustomer.id ? response.data : customer
        )
      );
      setIsEditModalOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Failed to update customer');
    }
  };

  const deleteCustomer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customerAPI.delete(id);
        setCustomers(prev => prev.filter(customer => customer.id !== id));
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Failed to delete customer');
      }
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

  const updateCustomerStatus = async (id: string, status: Customer['status']) => {
    try {
      await customerAPI.updateStatus(id, status);
      setCustomers(prev => 
        prev.map(customer => 
          customer.id === id ? { ...customer, status } : customer
        )
      );
    } catch (error) {
      console.error('Error updating customer status:', error);
      alert('Failed to update customer status');
    }
  };

  return {
    customers,
    isLoading,
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
    updateCustomerStatus,
    refreshData: fetchCustomers,
  };
};