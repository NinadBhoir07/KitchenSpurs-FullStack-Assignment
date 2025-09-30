import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import RestaurantList from './components/RestaurantList';
import OrderTrends from './components/OrderTrends';
import TopRestaurants from './components/TopRestaurants';
import Filters from './components/Filters';
import { Menu, X, BarChart3, Store, TrendingUp } from 'lucide-react';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [filters, setFilters] = useState({
    start_date: '2025-06-22',
    end_date: '2025-06-28',
    restaurant_id: null,
    min_amount: null,
    max_amount: null,
    start_hour: null,
    end_hour: null
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'restaurants', name: 'Restaurants', icon: Store },
    { id: 'trends', name: 'Order Trends', icon: TrendingUp },
  ];

  const handleRestaurantSelect = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setFilters(prev => ({ ...prev, restaurant_id: restaurant?.id || null }));
    if (restaurant) {
      setActiveView('trends');
    } else {
      // When clearing restaurant selection, go back to restaurants list
      setActiveView('restaurants');
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard filters={filters} onRestaurantSelect={handleRestaurantSelect} />;
      case 'restaurants':
        return <RestaurantList filters={filters} onRestaurantSelect={handleRestaurantSelect} />;
      case 'trends':
        return (
          <OrderTrends
            restaurant={selectedRestaurant}
            filters={filters}
            onRestaurantSelect={handleRestaurantSelect}
          />
        );
      default:
        return <Dashboard filters={filters} onRestaurantSelect={handleRestaurantSelect} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-white shadow-lg 
        transform transition-transform duration-300 ease-in-out lg:transform-none
        flex flex-col h-full
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-blue-600 flex-shrink-0">
          <h1 className="text-xl font-bold text-white">Restaurant Analytics</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 pt-8 pb-4 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center px-6 py-3 text-left transition-all duration-200
                  hover:bg-blue-50 hover:border-r-4 hover:border-blue-200
                  ${activeView === item.id
                    ? 'bg-blue-50 border-r-4 border-blue-600 text-blue-600 font-medium'
                    : 'text-gray-700 hover:text-blue-600'
                  }
                `}
              >
                <Icon size={20} className="mr-3 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Selected Restaurant Info */}
        {selectedRestaurant && activeView === 'trends' && (
          <div className="p-6 bg-blue-50 border-t flex-shrink-0">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Selected Restaurant</h3>
            <div className="text-sm text-blue-800">
              <p className="font-medium truncate">{selectedRestaurant.name}</p>
              <p className="text-xs text-blue-600 truncate">{selectedRestaurant.location}</p>
              <p className="text-xs text-blue-600 truncate">{selectedRestaurant.cuisine}</p>
            </div>
            <button
              onClick={() => handleRestaurantSelect(null)}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline transition-colors"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Restaurant Analytics</h1>
            <div className="w-6"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-sm border-b flex-shrink-0">
          <Filters filters={filters} onFiltersChange={handleFiltersChange} />
        </div>

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;