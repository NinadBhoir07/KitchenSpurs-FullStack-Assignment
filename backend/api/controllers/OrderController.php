<?php
class OrderController {
    private $orderModel;
    
    public function __construct() {
        $this->orderModel = new Order();
    }
    
    public function getAll() {
        $filters = $_GET;
        $result = $this->orderModel->getAll($filters);
        
        return json_encode($result);
    }
}
?>