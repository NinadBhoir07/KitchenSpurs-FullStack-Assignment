<?php
class Order {
    private $data;
    private $cacheFile = 'cache/orders.cache';
    
    public function __construct() {
        $this->loadData();
    }
    
    private function loadData() {
 
        if (file_exists($this->cacheFile) && (time() - filemtime($this->cacheFile)) < 300) {
            $this->data = json_decode(file_get_contents($this->cacheFile), true);
            return;
        }
        
        $jsonData = file_get_contents('data/orders.json');
        $this->data = json_decode($jsonData, true);

        if (!is_dir('cache')) {
            mkdir('cache', 0777, true);
        }

        file_put_contents($this->cacheFile, json_encode($this->data));
    }
    
    public function getAll($filters = []) {
        $orders = $this->data;
        
        // Apply restaurant filter
        if (!empty($filters['restaurant_id'])) {
            $orders = array_filter($orders, function($order) use ($filters) {
                return $order['restaurant_id'] == $filters['restaurant_id'];
            });
        }
        
        // Apply date range filter
        if (!empty($filters['start_date'])) {
            $startDate = $filters['start_date'];
            $orders = array_filter($orders, function($order) use ($startDate) {
                return strtotime(substr($order['order_time'], 0, 10)) >= strtotime($startDate);
            });
        }
        
        if (!empty($filters['end_date'])) {
            $endDate = $filters['end_date'];
            $orders = array_filter($orders, function($order) use ($endDate) {
                return strtotime(substr($order['order_time'], 0, 10)) <= strtotime($endDate);
            });
        }
        
        // Apply amount range filter
        if (!empty($filters['min_amount'])) {
            $orders = array_filter($orders, function($order) use ($filters) {
                return $order['order_amount'] >= $filters['min_amount'];
            });
        }
        
        if (!empty($filters['max_amount'])) {
            $orders = array_filter($orders, function($order) use ($filters) {
                return $order['order_amount'] <= $filters['max_amount'];
            });
        }
        
        // Apply hour range filter
        if (!empty($filters['start_hour'])) {
            $orders = array_filter($orders, function($order) use ($filters) {
                $hour = (int)date('H', strtotime($order['order_time']));
                return $hour >= $filters['start_hour'];
            });
        }
        
        if (!empty($filters['end_hour'])) {
            $orders = array_filter($orders, function($order) use ($filters) {
                $hour = (int)date('H', strtotime($order['order_time']));
                return $hour <= $filters['end_hour'];
            });
        }
        
        // Apply pagination
        $page = !empty($filters['page']) ? (int)$filters['page'] : 1;
        $limit = !empty($filters['limit']) ? (int)$filters['limit'] : 50;
        $offset = ($page - 1) * $limit;
        
        $total = count($orders);
        $orders = array_slice($orders, $offset, $limit);
        
        return [
            'data' => array_values($orders),
            'pagination' => [
                'current_page' => $page,
                'total_pages' => ceil($total / $limit),
                'total_items' => $total,
                'per_page' => $limit
            ]
        ];
    }
    
    public function getOrderTrends($restaurantId, $startDate = null, $endDate = null) {
        $orders = array_filter($this->data, function($order) use ($restaurantId) {
            return $order['restaurant_id'] == $restaurantId;
        });
        
        // Apply date filters
        if ($startDate) {
            $orders = array_filter($orders, function($order) use ($startDate) {
                return strtotime(substr($order['order_time'], 0, 10)) >= strtotime($startDate);
            });
        }
        
        if ($endDate) {
            $orders = array_filter($orders, function($order) use ($endDate) {
                return strtotime(substr($order['order_time'], 0, 10)) <= strtotime($endDate);
            });
        }
        
        // Group by date
        $dailyData = [];
        $hourlyData = [];
        
        foreach ($orders as $order) {
            $date = substr($order['order_time'], 0, 10);
            $hour = (int)date('H', strtotime($order['order_time']));
            
            // Daily aggregation
            if (!isset($dailyData[$date])) {
                $dailyData[$date] = [
                    'date' => $date,
                    'order_count' => 0,
                    'total_revenue' => 0,
                    'orders' => []
                ];
            }
            
            $dailyData[$date]['order_count']++;
            $dailyData[$date]['total_revenue'] += $order['order_amount'];
            $dailyData[$date]['orders'][] = $order;
            
            // Hourly aggregation
            $hourKey = $date . '-' . $hour;
            if (!isset($hourlyData[$hourKey])) {
                $hourlyData[$hourKey] = [
                    'date' => $date,
                    'hour' => $hour,
                    'order_count' => 0
                ];
            }
            $hourlyData[$hourKey]['order_count']++;
        }
        
        // Calculate average order value and peak hours
        foreach ($dailyData as &$day) {
            $day['average_order_value'] = $day['order_count'] > 0 ? 
                round($day['total_revenue'] / $day['order_count'], 2) : 0;
            
            // Find peak hour for this day
            $dayHours = array_filter($hourlyData, function($hour) use ($day) {
                return $hour['date'] === $day['date'];
            });
            
            if (!empty($dayHours)) {
                $peakHour = array_reduce($dayHours, function($max, $hour) {
                    return ($max === null || $hour['order_count'] > $max['order_count']) ? $hour : $max;
                });
                $day['peak_hour'] = $peakHour['hour'];
                $day['peak_hour_orders'] = $peakHour['order_count'];
            } else {
                $day['peak_hour'] = null;
                $day['peak_hour_orders'] = 0;
            }
            
            unset($day['orders']);
        }
        
        return array_values($dailyData);
    }
    
    public function getTopRestaurantsByRevenue($limit = 3, $startDate = null, $endDate = null) {
        $orders = $this->data;
        
        // Apply date filters
        if ($startDate) {
            $orders = array_filter($orders, function($order) use ($startDate) {
                return strtotime(substr($order['order_time'], 0, 10)) >= strtotime($startDate);
            });
        }
        
        if ($endDate) {
            $orders = array_filter($orders, function($order) use ($endDate) {
                return strtotime(substr($order['order_time'], 0, 10)) <= strtotime($endDate);
            });
        }
        
        // Group by restaurant
        $restaurantRevenue = [];
        foreach ($orders as $order) {
            $restaurantId = $order['restaurant_id'];
            if (!isset($restaurantRevenue[$restaurantId])) {
                $restaurantRevenue[$restaurantId] = [
                    'restaurant_id' => $restaurantId,
                    'total_revenue' => 0,
                    'order_count' => 0
                ];
            }
            
            $restaurantRevenue[$restaurantId]['total_revenue'] += $order['order_amount'];
            $restaurantRevenue[$restaurantId]['order_count']++;
        }
        
        // Calculate average order value
        foreach ($restaurantRevenue as &$restaurant) {
            $restaurant['average_order_value'] = $restaurant['order_count'] > 0 ? 
                round($restaurant['total_revenue'] / $restaurant['order_count'], 2) : 0;
        }
        
        // Sort by revenue and limit
        usort($restaurantRevenue, function($a, $b) {
            return $b['total_revenue'] - $a['total_revenue'];
        });
        
        return array_slice($restaurantRevenue, 0, $limit);
    }
}
?>