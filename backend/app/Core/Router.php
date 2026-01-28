<?php

namespace App\Core;

class Router
{
    private array $routes = [];
    
    public function get(string $path, $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }
    
    public function post(string $path, $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }
    
    public function put(string $path, $handler): void
    {
        $this->addRoute('PUT', $path, $handler);
    }
    
    public function delete(string $path, $handler): void
    {
        $this->addRoute('DELETE', $path, $handler);
    }
    
    public function patch(string $path, $handler): void
    {
        $this->addRoute('PATCH', $path, $handler);
    }
    
    private function addRoute(string $method, string $path, $handler): void
    {
        $pattern = $this->convertPathToRegex($path);
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'pattern' => $pattern,
            'handler' => $handler,
        ];
    }
    
    private function convertPathToRegex(string $path): string
    {
        // Convert /users/{id} to /users/([^/]+)
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '([^/]+)', $path);
        return '#^' . $pattern . '$#';
    }
    
    public function dispatch(string $method, string $uri): void
    {
        error_log("=== ROUTER DEBUG ===");
        error_log("Looking for: $method $uri");
        error_log("Registered routes: " . count($this->routes));
        
        foreach ($this->routes as $route) {
            error_log("Checking route: {$route['method']} {$route['path']} (pattern: {$route['pattern']})");
            
            if ($route['method'] !== $method) {
                error_log("  -> Method mismatch");
                continue;
            }
            
            if (preg_match($route['pattern'], $uri, $matches)) {
                error_log("  -> MATCHED!");
                array_shift($matches); // Remove full match
                $this->callHandler($route['handler'], $matches);
                return;
            } else {
                error_log("  -> Pattern not matched");
            }
        }
        
        error_log("=== NO ROUTE FOUND ===");
        // No route found
        Response::json(['error' => 'Route not found'], 404);
    }
    
    private function callHandler($handler, array $params): void
    {
        if (is_array($handler)) {
            [$controller, $method] = $handler;
            $controllerInstance = new $controller();
            call_user_func_array([$controllerInstance, $method], $params);
        } elseif (is_callable($handler)) {
            call_user_func_array($handler, $params);
        }
    }
}
