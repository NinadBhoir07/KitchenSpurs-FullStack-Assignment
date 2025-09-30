<?php
class Restaurant {
    private $data;
    private $cacheFile = 'cache/restaurants.cache';
    
    public function __construct() {
        $this->loadData();
    }
    
    private function loadData() {
        if (file_exists($this->cacheFile) && (time() - filemtime($this->cacheFile)) < 300) {
            $this->data = json_decode(file_get_contents($this->cacheFile), true);
            return;
        }
        
        $jsonData = file_get_contents('data/restaurants.json');
        $this->data = json_decode($jsonData, true);
        
        if (!is_dir('cache')) {
            mkdir('cache', 0777, true);
        }
        

        file_put_contents($this->cacheFile, json_encode($this->data));
    }
    
    public function getAll($filters = []) {
        $restaurants = $this->data;
        
        // Apply search filter
        if (!empty($filters['search'])) {
            $search = strtolower($filters['search']);
            $restaurants = array_filter($restaurants, function($restaurant) use ($search) {
                return strpos(strtolower($restaurant['name']), $search) !== false ||
                       strpos(strtolower($restaurant['location']), $search) !== false ||
                       strpos(strtolower($restaurant['cuisine']), $search) !== false;
            });
        }
        
        // Apply location filter
        if (!empty($filters['location'])) {
            $restaurants = array_filter($restaurants, function($restaurant) use ($filters) {
                return strtolower($restaurant['location']) === strtolower($filters['location']);
            });
        }
        
        // Apply cuisine filter
        if (!empty($filters['cuisine'])) {
            $restaurants = array_filter($restaurants, function($restaurant) use ($filters) {
                return strtolower($restaurant['cuisine']) === strtolower($filters['cuisine']);
            });
        }
        
        // Apply sorting
        if (!empty($filters['sort'])) {
            usort($restaurants, function($a, $b) use ($filters) {
                $field = $filters['sort'];
                $direction = !empty($filters['order']) && $filters['order'] === 'desc' ? -1 : 1;
                
                if ($field === 'name' || $field === 'location' || $field === 'cuisine') {
                    return strcmp($a[$field], $b[$field]) * $direction;
                }
                return 0;
            });
        }
        
        // Apply pagination
        $page = !empty($filters['page']) ? (int)$filters['page'] : 1;
        $limit = !empty($filters['limit']) ? (int)$filters['limit'] : 10;
        $offset = ($page - 1) * $limit;
        
        $total = count($restaurants);
        $restaurants = array_slice($restaurants, $offset, $limit);
        
        return [
            'data' => array_values($restaurants),
            'pagination' => [
                'current_page' => $page,
                'total_pages' => ceil($total / $limit),
                'total_items' => $total,
                'per_page' => $limit
            ]
        ];
    }
    
    public function getById($id) {
        foreach ($this->data as $restaurant) {
            if ($restaurant['id'] == $id) {
                return $restaurant;
            }
        }
        return null;
    }
    
    public function getLocations() {
        return array_unique(array_column($this->data, 'location'));
    }
    
    public function getCuisines() {
        return array_unique(array_column($this->data, 'cuisine'));
    }
}
?>