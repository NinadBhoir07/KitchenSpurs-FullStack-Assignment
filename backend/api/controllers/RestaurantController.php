<?php
class RestaurantController {
    private $restaurantModel;
    private $orderModel;
    
    public function __construct() {
        $this->restaurantModel = new Restaurant();
        $this->orderModel = new Order();
    }
    
    public function getAll() {
        $filters = $_GET;
        $result = $this->restaurantModel->getAll($filters);

        $result['filters'] = [
            'locations' => $this->restaurantModel->getLocations(),
            'cuisines' => $this->restaurantModel->getCuisines()
        ];
        
        return json_encode($result);
    }
    
    public function getById($id) {
        $restaurant = $this->restaurantModel->getById($id);
        
        if (!$restaurant) {
            http_response_code(404);
            return json_encode(['error' => 'Restaurant not found']);
        }
        
        return json_encode($restaurant);
    }
    
    public function getTrends($restaurantId) {
        $startDate = $_GET['start_date'] ?? null;
        $endDate = $_GET['end_date'] ?? null;
        
        $restaurant = $this->restaurantModel->getById($restaurantId);
        if (!$restaurant) {
            http_response_code(404);
            return json_encode(['error' => 'Restaurant not found']);
        }
        
        $trends = $this->orderModel->getOrderTrends($restaurantId, $startDate, $endDate);
        
        return json_encode([
            'restaurant' => $restaurant,
            'trends' => $trends,
            'date_range' => [
                'start_date' => $startDate,
                'end_date' => $endDate
            ]
        ]);
    }
    
    public function getTopByRevenue() {
        $limit = $_GET['limit'] ?? 3;
        $startDate = $_GET['start_date'] ?? null;
        $endDate = $_GET['end_date'] ?? null;
        
        $topRestaurants = $this->orderModel->getTopRestaurantsByRevenue($limit, $startDate, $endDate);
        
        $enrichedData = [];
        foreach ($topRestaurants as $data) {
            $restaurant = $this->restaurantModel->getById($data['restaurant_id']);
            if ($restaurant) {
                $enrichedData[] = array_merge($restaurant, $data);
            }
        }
        
        return json_encode([
            'data' => $enrichedData,
            'date_range' => [
                'start_date' => $startDate,
                'end_date' => $endDate
            ]
        ]);
    }
}
?>