import React, { useState } from "react";
import { Calendar, DollarSign, Clock, Filter, RefreshCw } from "lucide-react";

const Filters = ({ filters, onFiltersChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key, value) => {
    onFiltersChange({ [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      start_date: "2025-06-22",
      end_date: "2025-06-28",
      restaurant_id: null,
      min_amount: null,
      max_amount: null,
      start_hour: null,
      end_hour: null,
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.restaurant_id ||
      filters.min_amount ||
      filters.max_amount ||
      filters.start_hour ||
      filters.end_hour ||
      filters.start_date !== "2025-06-22" ||
      filters.end_date !== "2025-06-28"
    );
  };

  return (
    <div className="bg-white border-b">
      <div className="px-6 py-4">
        {/* Always Visible Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Range */}
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              Date Range:
            </span>
            <input
              type="date"
              value={filters.start_date || "2025-06-22"}
              onChange={(e) => handleFilterChange("start_date", e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={filters.end_date || "2025-06-28"}
              onChange={(e) => handleFilterChange("end_date", e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Toggle Advanced Filters */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Filter size={16} />
            <span>{isExpanded ? "Hide" : "Show"} Advanced Filters</span>
            {hasActiveFilters() && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Active
              </span>
            )}
          </button>

          {/* Reset Button */}
          {hasActiveFilters() && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RefreshCw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Advanced Filters - Collapsible */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Amount Range */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <DollarSign size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Amount Range (₹)
                  </span>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.min_amount || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "min_amount",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.max_amount || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "max_amount",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Hour Range */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Hour Range
                  </span>
                </div>
                <div className="flex space-x-2">
                  <select
                    value={filters.start_hour || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "start_hour",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Start Hour</option>
                    {[...Array(24)].map((_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, "0")}:00
                      </option>
                    ))}
                  </select>
                  <select
                    value={filters.end_hour || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "end_hour",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">End Hour</option>
                    {[...Array(24)].map((_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, "0")}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Date Presets */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">
                  Quick Presets
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      handleFilterChange("start_date", "2025-06-22");
                      handleFilterChange("end_date", "2025-06-28");
                    }}
                    className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                  >
                    All Week
                  </button>
                  <button
                    onClick={() => {
                      handleFilterChange("start_date", "2025-06-28");
                      handleFilterChange("end_date", "2025-06-28");
                    }}
                    className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors"
                  >
                    Last Day
                  </button>
                  <button
                    onClick={() => {
                      handleFilterChange("start_date", "2025-06-26");
                      handleFilterChange("end_date", "2025-06-28");
                    }}
                    className="px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded hover:bg-purple-100 transition-colors"
                  >
                    Last 3 Days
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Summary */}
            {hasActiveFilters() && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Active Filters:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {filters.start_date !== "2025-06-22" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      From: {filters.start_date}
                    </span>
                  )}
                  {filters.end_date !== "2025-06-28" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      To: {filters.end_date}
                    </span>
                  )}
                  {filters.min_amount && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Min: ₹{filters.min_amount}
                    </span>
                  )}
                  {filters.max_amount && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Max: ₹{filters.max_amount}
                    </span>
                  )}
                  {filters.start_hour !== null && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      From: {filters.start_hour}:00
                    </span>
                  )}
                  {filters.end_hour !== null && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      To: {filters.end_hour}:00
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Filters;
