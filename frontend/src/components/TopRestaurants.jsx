import React, { useState, useEffect } from "react";
import { restaurantAPI } from "../services/api";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Crown,
  Award,
} from "lucide-react";

const TopRestaurants = ({ filters, onRestaurantSelect, showHeader = true }) => {
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTopRestaurants();
  }, [filters]);

  const fetchTopRestaurants = async () => {
    try {
      setLoading(true);
      const response = await restaurantAPI.getTopByRevenue({
        start_date: filters.start_date,
        end_date: filters.end_date,
        limit: 10,
      });

      setTopRestaurants(response.data.data);
    } catch (err) {
      console.error("Error fetching top restaurants:", err);
      setError("Failed to load top restaurants");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return `₹${value.toLocaleString()}`;
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Award className="w-6 h-6 text-gray-400" />;
      default:
        return null;
    }
  };

  const getRankClass = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200";
      case 2:
        return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200";
      case 3:
        return "bg-white border-gray-200";
      default:
        return "bg-white border-gray-200";
    }
  };

  const RestaurantCard = ({ restaurant, rank }) => (
    <div
      className={`rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1 border ${getRankClass(
        rank
      )}`}
      onClick={() => onRestaurantSelect(restaurant)}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">{getRankIcon(rank)}</div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {restaurant.name}
                </h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  #{rank}
                </span>
              </div>
              <p className="text-gray-600 text-sm mt-1">
                {restaurant.location} • {restaurant.cuisine} Cuisine
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-5 h-5 text-green-500 mr-1" />
            </div>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(restaurant.total_revenue)}
            </p>
            <p className="text-xs text-gray-500">Total Revenue</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <ShoppingCart className="w-5 h-5 text-blue-500 mr-1" />
            </div>
            <p className="text-lg font-bold text-gray-900">
              {restaurant.order_count.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Total Orders</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500 mr-1" />
            </div>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(restaurant.average_order_value)}
            </p>
            <p className="text-xs text-gray-500">Avg Order</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium">
            View Detailed Analytics
          </button>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Top Restaurants</h1>
          <p className="text-gray-600 mt-2">
            Ranked by revenue for {filters.start_date} to {filters.end_date}
          </p>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-6 animate-pulse"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="text-center">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {topRestaurants.length > 0 ? (
            <>
              {showHeader && topRestaurants.length >= 3 && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 mb-8">
                  <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                    🏆 Top 3 Champions 🏆
                  </h2>
                  <div className="flex justify-center items-end space-x-4">
                    <div className="text-center">
                      <div className="bg-white rounded-lg p-4 shadow-md mb-2 transform -rotate-1">
                        <Award className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <h3 className="font-bold text-gray-900">
                          {topRestaurants[1]?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(topRestaurants[1]?.total_revenue)}
                        </p>
                      </div>
                      <div className="bg-gray-300 h-16 w-24 rounded-t-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          2nd
                        </span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="bg-white rounded-lg p-4 shadow-lg mb-2 transform rotate-1 scale-110">
                        <Crown className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                        <h3 className="font-bold text-gray-900 text-lg">
                          {topRestaurants[0]?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(topRestaurants[0]?.total_revenue)}
                        </p>
                      </div>
                      <div className="bg-yellow-400 h-20 w-24 rounded-t-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          1st
                        </span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="bg-white rounded-lg p-4 shadow-md mb-2 transform rotate-1">
                        <h3 className="font-bold text-gray-900">
                          {topRestaurants[2]?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(topRestaurants[2]?.total_revenue)}
                        </p>
                      </div>
                      <div className="bg-amber-600 h-12 w-24 rounded-t-lg flex items-center justify-center">
                        <span className="text-white font-bold">3rd</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Restaurant Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {topRestaurants.map((restaurant, index) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    rank={index + 1}
                  />
                ))}
              </div>

              {/* Summary Stats */}
              {showHeader && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Performance Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {formatCurrency(
                          topRestaurants.reduce(
                            (sum, r) => sum + r.total_revenue,
                            0
                          )
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Combined Revenue</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {topRestaurants
                          .reduce((sum, r) => sum + r.order_count, 0)
                          .toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-600">Total Orders</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-2">
                        {formatCurrency(
                          topRestaurants.reduce(
                            (sum, r) => sum + r.average_order_value,
                            0
                          ) / topRestaurants.length
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Avg Order Value</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">
                No data available
              </h3>
              <p className="text-gray-600 mt-2">
                No restaurants found for the selected date range
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TopRestaurants;
