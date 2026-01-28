<?php

namespace App\Core;

class Application
{
    private array $config;
    private Router $router;
    private Database $db;
    
    public function __construct(array $config)
    {
        $this->config = $config;
        $this->initializeDatabase();
        $this->initializeRouter();
    }
    
    private function initializeDatabase(): void
    {
        $this->db = new Database($this->config['database']);
    }
    
    private function initializeRouter(): void
    {
        $this->router = new Router();
        $this->loadRoutes();
    }
    
    private function loadRoutes(): void
    {
        // Make router and app globally accessible for routes
        $GLOBALS['app'] = $this;
        $GLOBALS['router'] = $this->router;
        $GLOBALS['config'] = $this->config;
        
        require_once ROOT_PATH . '/routes/api.php';
    }
    
    public function getRouter(): Router
    {
        return $this->router;
    }
    
    public function run(): void
    {
        // Handle CORS
        $this->handleCors();
        
        // Get request method and URI
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        // Handle OPTIONS request
        if ($method === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
        
        // Route the request
        $this->router->dispatch($method, $uri);
    }
    
    private function handleCors(): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        if (in_array($origin, $this->config['cors']['allowed_origins'])) {
            header("Access-Control-Allow-Origin: $origin");
        }
        
        header('Access-Control-Allow-Methods: ' . implode(', ', $this->config['cors']['allowed_methods']));
        header('Access-Control-Allow-Headers: ' . implode(', ', $this->config['cors']['allowed_headers']));
        header('Access-Control-Max-Age: ' . $this->config['cors']['max_age']);
        header('Access-Control-Allow-Credentials: true');
    }
    
    public function getDatabase(): Database
    {
        return $this->db;
    }
}
