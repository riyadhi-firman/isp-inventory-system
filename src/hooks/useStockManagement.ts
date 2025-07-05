import { useState, useEffect } from 'react';
import { stockAPI } from '../services/api';
import { StockItem } from '../types';

export const useStockManagement = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  useEffect(() => {
    fetchStockItems();
  }, []);

  const fetchStockItems = async () => {
    try {
      setIsLoading(true);
      const response = await stockAPI.getAll();
      setStockItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching stock items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addStockItem = async (newItem: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await stockAPI.create(newItem);
      setStockItems(prev => [...prev, response.data]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding stock item:', error);
      alert('Failed to add stock item');
    }
  };

  const updateStockItem = async (updatedItem: StockItem) => {
    try {
      const response = await stockAPI.update(updatedItem.id, updatedItem);
      setStockItems(prev => 
        prev.map(item => 
          item.id === updatedItem.id ? response.data : item
        )
      );
      setIsEditModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error updating stock item:', error);
      alert('Failed to update stock item');
    }
  };

  const deleteStockItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await stockAPI.delete(id);
        setStockItems(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting stock item:', error);
        alert('Failed to delete stock item');
      }
    }
  };

  const openEditModal = (item: StockItem) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  return {
    stockItems,
    isLoading,
    isAddModalOpen,
    isEditModalOpen,
    selectedItem,
    setIsAddModalOpen,
    setIsEditModalOpen,
    addStockItem,
    updateStockItem,
    deleteStockItem,
    openEditModal,
    refreshData: fetchStockItems,
  };
};