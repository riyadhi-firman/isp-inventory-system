import { useState } from 'react';
import { StockItem } from '../types';
import { mockStockItems } from '../data/mockData';

export const useStockManagement = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>(mockStockItems);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  const addStockItem = (newItem: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const item: StockItem = {
      ...newItem,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setStockItems(prev => [...prev, item]);
    setIsAddModalOpen(false);
  };

  const updateStockItem = (updatedItem: StockItem) => {
    setStockItems(prev => 
      prev.map(item => 
        item.id === updatedItem.id 
          ? { ...updatedItem, updatedAt: new Date() }
          : item
      )
    );
    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  const deleteStockItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setStockItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const openEditModal = (item: StockItem) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  return {
    stockItems,
    isAddModalOpen,
    isEditModalOpen,
    selectedItem,
    setIsAddModalOpen,
    setIsEditModalOpen,
    addStockItem,
    updateStockItem,
    deleteStockItem,
    openEditModal
  };
};