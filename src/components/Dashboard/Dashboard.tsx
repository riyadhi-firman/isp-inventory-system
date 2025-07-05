import React from 'react';
import { 
  Package, 
  AlertTriangle, 
  Clock, 
  Users, 
  TrendingUp, 
  Award,
  ArrowUp,
  ArrowDown,
  ArrowLeftRight
} from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';

const Dashboard: React.FC = () => {
  const { dashboardData, lowStockItems, recentTransactions, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Stock Items',
      value: dashboardData.totalStock || 0,
      icon: Package,
      color: 'blue',
      trend: '+5.2%',
      trendUp: true
    },
    {
      title: 'Low Stock Alerts',
      value: dashboardData.lowStockItems || 0,
      icon: AlertTriangle,
      color: 'red',
      trend: '-2.1%',
      trendUp: false
    },
    {
      title: 'Pending Transactions',
      value: dashboardData.pendingTransactions || 0,
      icon: Clock,
      color: 'yellow',
      trend: '+8.4%',
      trendUp: true
    },
    {
      title: 'Active Customers',
      value: dashboardData.activeCustomers || 0,
      icon: Users,
      color: 'green',
      trend: '+12.3%',
      trendUp: true
    },
    {
      title: 'Monthly Installations',
      value: dashboardData.monthlyInstallations || 0,
      icon: TrendingUp,
      color: 'purple',
      trend: '+15.7%',
      trendUp: true
    },
    {
      title: 'Team Performance',
      value: `${dashboardData.teamPerformance || 0}%`,
      icon: Award,
      color: 'indigo',
      trend: '+3.2%',
      trendUp: true
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-600 bg-blue-50',
      red: 'bg-red-500 text-red-600 bg-red-50',
      yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
      green: 'bg-green-500 text-green-600 bg-green-50',
      purple: 'bg-purple-500 text-purple-600 bg-purple-50',
      indigo: 'bg-indigo-500 text-indigo-600 bg-indigo-50'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const [bgColor, textColor, cardBg] = getColorClasses(stat.color).split(' ');
          
          return (
            <div key={index} className={`${cardBg} p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${bgColor}`}>
                  <Icon className={`w-6 h-6 text-white`} />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trendUp ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span className="font-medium">{stat.trend}</span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className={`text-2xl font-bold ${textColor}`}>{stat.value}</h3>
                <p className="text-gray-600 mt-1">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
          </div>
          <div className="space-y-3">
            {lowStockItems.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">{item.quantity} {item.unit}</p>
                  <p className="text-xs text-gray-500">Min: {item.min_stock}</p>
                </div>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <p className="text-gray-500 text-center py-4">No low stock alerts</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          </div>
          <div className="space-y-3">
            {recentTransactions.slice(0, 3).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 capitalize">{transaction.type}</p>
                  <p className="text-sm text-gray-600">{transaction.notes}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium px-2 py-1 rounded-full ${
                    transaction.status === 'completed' ? 'bg-green-100 text-green-600' :
                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {transaction.status}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent transactions</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentTransactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className={`p-2 rounded-lg ${
                transaction.status === 'completed' ? 'bg-green-100 text-green-600' :
                transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 capitalize">{transaction.type}</p>
                <p className="text-sm text-gray-600">{transaction.notes}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium px-2 py-1 rounded-full ${
                  transaction.status === 'completed' ? 'bg-green-100 text-green-600' :
                  transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {transaction.status}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          {recentTransactions.length === 0 && (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;