import { useState } from 'react';
import { Transaction } from '../types';
import { mockTransactions } from '../data/mockData';

export const useTransactionManagement = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);

  const approveTransaction = (id: string) => {
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
  };

  const rejectTransaction = (id: string) => {
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
  };

  const completeTransaction = (id: string) => {
    setTransactions(prev =>
      prev.map(transaction =>
        transaction.id === id
          ? { ...transaction, status: 'completed' as const }
          : transaction
      )
    );
  };

  const addTransaction = (newTransaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setTransactions(prev => [transaction, ...prev]);
  };

  return {
    transactions,
    approveTransaction,
    rejectTransaction,
    completeTransaction,
    addTransaction
  };
};