<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'models/Restaurant.php';
require_once 'models/Order.php';
require_once 'controllers/RestaurantController.php';
require_once 'controllers/OrderController.php';

$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

$path = str_replace('/index.php', '', $path);


$path = ltrim($path, '/');
$segments = array_filter(explode('/', $path));

error_log("Request path: " . $path);
error_log("Segments: " . print_r($segments, true));

try {
    // Handle empty path
    if (empty($segments)) {
        echo json_encode(['message' => 'Restaurant Analytics API', 'status' => 'running']);
        exit;
    }

    $firstSegment = $segments[0];
    
    switch ($firstSegment) {
        case 'restaurants':
            $controller = new RestaurantController();
            if (isset($segments[1]) && is_numeric($segments[1])) {
                if (isset($segments[2]) && $segments[2] === 'trends') {
                    echo $controller->getTrends($segments[1]);
                } else {
                    echo $controller->getById($segments[1]);
                }
            } else {
                echo $controller->getAll();
            }
            break;
            
        case 'top-restaurants':
            $controller = new RestaurantController();
            echo $controller->getTopByRevenue();
            break;
            
        case 'orders':
            $controller = new OrderController();
            echo $controller->getAll();
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found: ' . $firstSegment]);
            break;
    }
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
}
?>