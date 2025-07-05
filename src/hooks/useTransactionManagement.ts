import { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import { Transaction } from '../types';

export const useTransactionManagement = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await transactionAPI.getAll();
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const approveTransaction = async (id: string) => {
    try {
      await transactionAPI.approve(id);
      setTransactions(prev =>
        prev.map(transaction =>
          transaction.id === id
            ? {
                ...transaction,
                status: 'approved' as const,
                approvedBy: 'admin',
                approvedAt: new Date()
              }
            : transaction
        )
      );
    } catch (error) {
      console.error('Error approving transaction:', error);
      alert('Failed to approve transaction');
    }
  };

  const rejectTransaction = async (id: string) => {
    try {
      await transactionAPI.reject(id);
      setTransactions(prev =>
        prev.map(transaction =>
          transaction.id === id
            ? {
                ...transaction,
                status: 'rejected' as const,
                approvedBy: 'admin',
                approvedAt: new Date()
              }
            : transaction
        )
      );
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      alert('Failed to reject transaction');
    }
  };

  const completeTransaction = async (id: string) => {
    try {
      await transactionAPI.complete(id);
      setTransactions(prev =>
        prev.map(transaction =>
          transaction.id === id
            ? { ...transaction, status: 'completed' as const }
            : transaction
        )
      );
    } catch (error) {
      console.error('Error completing transaction:', error);
      alert('Failed to complete transaction');
    }
  };

  const addTransaction = async (newTransaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const response = await transactionAPI.create(newTransaction);
      setTransactions(prev => [response.data, ...prev]);
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to create transaction');
    }
  };

  return {
    transactions,
    isLoading,
    approveTransaction,
    rejectTransaction,
    completeTransaction,
    addTransaction,
    refreshData: fetchTransactions,
  };
};