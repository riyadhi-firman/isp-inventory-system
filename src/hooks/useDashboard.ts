import { useState, useEffect } from 'react';
import { dashboardAPI, stockAPI, transactionAPI } from '../services/api';

export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await dashboardAPI.getStats();
      setDashboardData(statsResponse.data);

      // Fetch low stock items
      const lowStockResponse = await stockAPI.getLowStock();
      setLowStockItems(lowStockResponse.data || []);

      // Fetch recent transactions
      const transactionsResponse = await transactionAPI.getAll({ limit: 10 });
      setRecentTransactions(transactionsResponse.data.transactions || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    dashboardData,
    lowStockItems,
    recentTransactions,
    isLoading,
    refreshData: fetchDashboardData,
  };
};