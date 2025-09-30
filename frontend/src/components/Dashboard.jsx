import React, { useState, useEffect } from "react";
import { restaurantAPI } from "../services/api";
import TopRestaurants from "./TopRestaurants";
import { BarChart3, TrendingUp, DollarSign, Store } from "lucide-react";

const Dashboard = ({ filters, onRestaurantSelect }) => {
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch restaurants and top restaurants data
      const [restaurantsResponse, topRestaurantsResponse] = await Promise.all([
        restaurantAPI.getAll({}),
        restaurantAPI.getTopByRevenue({
          start_date: filters.start_date,
          end_date: filters.end_date,
          limit: 10,
        }),
      ]);

      const restaurants = restaurantsResponse.data.data;
      const topRestaurants = topRestaurantsResponse.data.data;

      // Calculate aggregate stats
      const totalRevenue = topRestaurants.reduce(
        (sum, restaurant) => sum + restaurant.total_revenue,
        0
      );
      const totalOrders = topRestaurants.reduce(
        (sum, restaurant) => sum + restaurant.order_count,
        0
      );
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      setStats({
        totalRestaurants: restaurants.length,
        totalRevenue: totalRevenue,
        totalOrders: totalOrders,
        avgOrderValue: avgOrderValue,
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, format = "number" }) => {
    const formatValue = (val) => {
      if (format === "currency") {
        return `₹${val.toLocaleString()}`;
      } else if (format === "decimal") {
        return val.toFixed(2);
      }
      return val.toLocaleString();
    };

    return (
      <div className="bg-white rounded-lg shadow ">
        <div className="flex h-20 px-2 items-center">
          <div className={`flex-shrink-0 p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? "..." : formatValue(value)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Analytics overview for {filters.start_date} to {filters.end_date}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Restaurants"
          value={stats.totalRestaurants}
          icon={Store}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={DollarSign}
          color="bg-green-500"
          format="currency"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={BarChart3}
          color="bg-purple-500"
        />
        <StatCard
          title="Avg Order Value"
          value={stats.avgOrderValue}
          icon={TrendingUp}
          color="bg-orange-500"
          format="currency"
        />
      </div>

      {/* Top Restaurants Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Top Performing Restaurants
          </h2>
        </div>
        <div className="p-6">
          <TopRestaurants
            filters={filters}
            onRestaurantSelect={onRestaurantSelect}
            showHeader={false}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => (window.location.href = "#restaurants")}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Store className="h-8 w-8 text-blue-500 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">View All Restaurants</p>
              <p className="text-sm text-gray-500">
                Browse and filter restaurants
              </p>
            </div>
          </button>

          <button
            onClick={() => (window.location.href = "#trends")}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">View Trends</p>
              <p className="text-sm text-gray-500">Analyze order patterns</p>
            </div>
          </button>

          <button
            onClick={() => (window.location.href = "#export")}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="h-8 w-8 text-purple-500 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Export Data</p>
              <p className="text-sm text-gray-500">Download reports</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
