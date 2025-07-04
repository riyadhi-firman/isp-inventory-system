import React, { useState } from 'react';
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