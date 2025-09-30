import React, { useState, useEffect } from "react";
import { restaurantAPI } from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowLeft,
} from "lucide-react";

const OrderTrends = ({ restaurant, filters, onRestaurantSelect }) => {
  const [trendsData, setTrendsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(restaurant);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchTrends();
    }
  }, [selectedRestaurant, filters]);

  const fetchTrends = async () => {
    if (!selectedRestaurant) return;

    try {
      setLoading(true);
      const response = await restaurantAPI.getTrends(selectedRestaurant.id, {
        start_date: filters.start_date,
        end_date: filters.end_date,
      });

      setTrendsData(response.data.trends);
    } catch (err) {
      console.error("Error fetching trends:", err);
      setError("Failed to load order trends");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatCurrency = (value) => {
    return `₹${value.toLocaleString()}`;
  };

  const calculateTotals = () => {
    if (!trendsData.length)
      return { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 };

    const totalOrders = trendsData.reduce(
      (sum, day) => sum + day.order_count,
      0
    );
    const totalRevenue = trendsData.reduce(
      (sum, day) => sum + day.total_revenue,
      0
    );
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalOrders, totalRevenue, avgOrderValue };
  };

  const { totalOrders, totalRevenue, avgOrderValue } = calculateTotals();

  const chartData = trendsData.map((day) => ({
    ...day,
    date: formatDate(day.date),
    peak_hour_display: day.peak_hour !== null ? `${day.peak_hour}:00` : "N/A",
  }));

  if (!selectedRestaurant) {
    return (
      <div className="text-center py-12">
        <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">
          No Restaurant Selected
        </h3>
        <p className="text-gray-600 mt-2">
          Please select a restaurant to view order trends
        </p>
      </div>
    );
  }

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
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <nav className="flex text-sm text-gray-500">
            <button
              onClick={() => {
                onRestaurantSelect(null);
              }}
              className="hover:text-blue-600 transition-colors"
            >
              Restaurants
            </button>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Order Trends</span>
          </nav>

          {/* Back Button  */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                onRestaurantSelect(null);
              }}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </button>
            <div className="border-l pl-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedRestaurant.name}
              </h1>
              <p className="text-gray-600">
                {selectedRestaurant.location} • {selectedRestaurant.cuisine}{" "}
                Cuisine
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Trends for {filters.start_date} to {filters.end_date}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-blue-500">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "..." : totalOrders.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-green-500">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "..." : formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-purple-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Avg Order Value
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "..." : formatCurrency(avgOrderValue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Daily Orders Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Daily Orders Count
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="order_count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Daily Revenue
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `₹${value}`} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), "Revenue"]}
                />
                <Legend />
                <Bar dataKey="total_revenue" fill="#10b981" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Average Order Value Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Average Order Value
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `₹${value}`} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), "AOV"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="average_order_value"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="AOV"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Peak Hours Table */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Peak Hours by Day
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Peak Hour
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders in Peak Hour
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trendsData.map((day) => (
                    <tr key={day.date} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatDate(day.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Clock size={16} className="mr-2 text-gray-400" />
                          {day.peak_hour !== null
                            ? `${day.peak_hour}:00`
                            : "No data"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {day.peak_hour_orders || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {day.order_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(day.total_revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {trendsData.length === 0 && (
              <div className="text-center py-8">
                <Clock size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  No data available
                </h3>
                <p className="text-gray-600 mt-2">
                  No orders found for the selected date range
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OrderTrends;
