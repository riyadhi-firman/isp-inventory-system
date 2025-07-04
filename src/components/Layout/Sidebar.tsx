import React from 'react';
import { 
  Home, 
  Package, 
  ArrowLeftRight, 
  Users, 
  UserCheck, 
  BarChart3,
  Settings,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isCollapsed }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'stock', label: 'Stock Management', icon: Package },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'team', label: 'Team Management', icon: UserCheck },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} min-h-screen`}>
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold">ISP Inventory</h2>
              <p className="text-xs text-gray-400">Management System</p>
            </div>
          )}
        </div>
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                isActive 
                  ? 'bg-blue-600 border-r-4 border-blue-400' 
                  : 'hover:bg-gray-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-200' : 'text-gray-400'}`} />
              {!isCollapsed && (
                <>
                  <span className={`${isActive ? 'text-white' : 'text-gray-300'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-blue-200 ml-auto" />
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;