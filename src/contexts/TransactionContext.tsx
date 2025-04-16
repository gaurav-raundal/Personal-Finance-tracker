
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';

// Define types
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'date'> & { date?: string }) => void;
  getAllTransactions: () => Transaction[];
  getUserTransactions: (userId: string) => Transaction[];
  getRecentTransactions: (limit?: number) => Transaction[];
  getMonthlyData: () => { month: string; income: number; expense: number }[];
  getDailyData: () => { day: string; income: number; expense: number }[];
  getCategoryData: () => { category: string; amount: number; type: 'income' | 'expense' }[];
}

// Create the context
const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// Sample transaction data
const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    userId: '1',
    amount: 50000,
    type: 'income',
    category: 'Salary',
    description: 'Monthly salary',
    date: '2023-04-01T10:00:00Z',
  },
  {
    id: '2',
    userId: '1',
    amount: 5000,
    type: 'expense',
    category: 'Food',
    description: 'Grocery shopping',
    date: '2023-04-05T15:30:00Z',
  },
  {
    id: '3',
    userId: '2',
    amount: 25000,
    type: 'income',
    category: 'Freelance',
    description: 'Website development',
    date: '2023-04-10T09:15:00Z',
  },
  {
    id: '4',
    userId: '2',
    amount: 2500,
    type: 'expense',
    category: 'Transport',
    description: 'Fuel',
    date: '2023-04-12T18:20:00Z',
  },
  {
    id: '5',
    userId: '2',
    amount: 1800,
    type: 'expense',
    category: 'Entertainment',
    description: 'Movie and dinner',
    date: '2023-04-15T20:00:00Z',
  },
  {
    id: '6',
    userId: '1',
    amount: 10000,
    type: 'expense',
    category: 'Rent',
    description: 'Monthly rent',
    date: '2023-04-02T11:00:00Z',
  },
];

// Custom hook to use the transaction context
export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

// Transaction provider component
export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load transactions from localStorage on mount
  useEffect(() => {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    } else {
      // If no stored transactions, use sample data
      setTransactions(SAMPLE_TRANSACTIONS);
      localStorage.setItem('transactions', JSON.stringify(SAMPLE_TRANSACTIONS));
    }
  }, []);

  // Add a new transaction
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'userId' | 'date'> & { date?: string }) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add transactions",
        variant: "destructive",
      });
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      userId: user.id,
      date: transaction.date || new Date().toISOString(),
      ...transaction,
    };

    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    
    toast({
      title: "Transaction added",
      description: `₹${transaction.amount.toLocaleString('en-IN')} ${transaction.type} added successfully`,
      variant: "default",
    });
  };

  // Get all transactions (for admin)
  const getAllTransactions = () => {
    return [...transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  // Get transactions for a specific user
  const getUserTransactions = (userId: string) => {
    return transactions
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Get recent transactions for the current user
  const getRecentTransactions = (limit = 5) => {
    if (!user) return [];
    
    return transactions
      .filter((t) => t.userId === user.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  };

  // Get monthly data for charts
  const getMonthlyData = () => {
    if (!user) return [];

    const userTransactions = transactions.filter((t) => t.userId === user.id);
    const monthlyData: Record<string, { income: number; expense: number }> = {};

    userTransactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthName]) {
        monthlyData[monthName] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthName].income += transaction.amount;
      } else {
        monthlyData[monthName].expense += transaction.amount;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
    })).slice(-6);  // Last 6 months
  };

  // Get daily data for charts
  const getDailyData = () => {
    if (!user) return [];

    const userTransactions = transactions.filter((t) => t.userId === user.id);
    const dailyData: Record<string, { income: number; expense: number }> = {};
    
    // Get last 7 days
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleString('en-US', { weekday: 'short' });
      dailyData[dayName] = { income: 0, expense: 0 };
    }

    // Fill in the data
    userTransactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      // Only include transactions from the last 7 days
      const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 7) {
        const dayName = date.toLocaleString('en-US', { weekday: 'short' });
        
        if (transaction.type === 'income') {
          dailyData[dayName].income += transaction.amount;
        } else {
          dailyData[dayName].expense += transaction.amount;
        }
      }
    });

    return Object.entries(dailyData).map(([day, data]) => ({
      day,
      income: data.income,
      expense: data.expense,
    }));
  };

  // Get category data for pie charts
  const getCategoryData = () => {
    if (!user) return [];

    const userTransactions = transactions.filter((t) => t.userId === user.id);
    const categoryData: Record<string, { amount: number; type: 'income' | 'expense' }> = {};

    userTransactions.forEach((transaction) => {
      const key = `${transaction.category}-${transaction.type}`;
      
      if (!categoryData[key]) {
        categoryData[key] = { amount: 0, type: transaction.type };
      }
      
      categoryData[key].amount += transaction.amount;
    });

    return Object.entries(categoryData).map(([key, data]) => {
      const [category] = key.split('-');
      return {
        category,
        amount: data.amount,
        type: data.type,
      };
    });
  };

  // Value object to pass through the context
  const value = {
    transactions,
    addTransaction,
    getAllTransactions,
    getUserTransactions,
    getRecentTransactions,
    getMonthlyData,
    getDailyData,
    getCategoryData,
  };

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
};
