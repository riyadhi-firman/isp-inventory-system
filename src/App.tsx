import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/Auth/LoginForm';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import StockManagement from './components/Stock/StockManagement';
import TransactionManagement from './components/Transactions/TransactionManagement';
import TeamManagement from './components/Team/TeamManagement';
import CustomerManagement from './components/Customers/CustomerManagement';
import ReportManagement from './components/Reports/ReportManagement';
import Settings from './components/Settings/Settings';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'stock':
        return <StockManagement />;
      case 'transactions':
        return <TransactionManagement />;
      case 'team':
        return <TeamManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'reports':
        return <ReportManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;