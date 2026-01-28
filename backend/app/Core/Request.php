<?php

namespace App\Core;

class Request
{
    private array $query;
    private array $body;
    private array $headers;
    private array $files;
    private string $method;
    private string $uri;
    
    public function __construct()
    {
        $this->query = $_GET;
        $this->body = $this->parseBody();
        $this->headers = $this->parseHeaders();
        $this->files = $_FILES;
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    }
    
    private function parseBody(): array
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        
        if (strpos($contentType, 'application/json') !== false) {
            $json = file_get_contents('php://input');
            return json_decode($json, true) ?? [];
        }
        
        return $_POST;
    }
    
    private function parseHeaders(): array
    {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (strpos($key, 'HTTP_') === 0) {
                $header = str_replace('_', '-', substr($key, 5));
                $headers[$header] = $value;
            }
        }
        return $headers;
    }
    
    public function query(string $key = null, $default = null)
    {
        if ($key === null) {
            return $this->query;
        }
        return $this->query[$key] ?? $default;
    }
    
    public function input(string $key = null, $default = null)
    {
        if ($key === null) {
            return $this->body;
        }
        return $this->body[$key] ?? $default;
    }
    
    public function header(string $key, $default = null)
    {
        return $this->headers[$key] ?? $default;
    }
    
    public function file(string $key)
    {
        return $this->files[$key] ?? null;
    }
    
    public function method(): string
    {
        return $this->method;
    }
    
    public function uri(): string
    {
        return $this->uri;
    }
    
    public function bearerToken(): ?string
    {
        // Try multiple ways to get the Authorization header
        $auth = $this->header('AUTHORIZATION') 
             ?? $this->header('Authorization')
             ?? $_SERVER['HTTP_AUTHORIZATION'] 
             ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] // Added by .htaccess
             ?? getenv('HTTP_AUTHORIZATION')
             ?? null;
        
        if ($auth && preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
            return $matches[1];
        }
        
        // Also check for Authorization in Apache/CGI environments
        if (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            if (isset($headers['Authorization'])) {
                if (preg_match('/Bearer\s+(.*)$/i', $headers['Authorization'], $matches)) {
                    return $matches[1];
                }
            }
        }
        
        return null;
    }
    
    public function validate(array $rules): array
    {
        $validator = new Validator($this->body, $rules);
        return $validator->validate();
    }
}
