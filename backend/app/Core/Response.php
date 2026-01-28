<?php

namespace App\Core;

class Response
{
    public static function json($data, int $status = 200, array $headers = []): void
    {
        http_response_code($status);
        header('Content-Type: application/json');
        
        foreach ($headers as $key => $value) {
            header("{$key}: {$value}");
        }
        
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    
    public static function success($data = null, string $message = 'Success', int $status = 200): void
    {
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }
    
    public static function error(string $message, int $status = 400, $errors = null): void
    {
        self::json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }
    
    public static function paginated(array $items, int $total, int $page, int $perPage): void
    {
        self::json([
            'success' => true,
            'data' => $items,
            'pagination' => [
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => ceil($total / $perPage),
                'from' => ($page - 1) * $perPage + 1,
                'to' => min($page * $perPage, $total),
            ],
        ]);
    }
    
    public static function created($data, string $message = 'Created successfully'): void
    {
        self::success($data, $message, 201);
    }
    
    public static function noContent(): void
    {
        http_response_code(204);
        exit;
    }
    
    public static function unauthorized(string $message = 'Unauthorized'): void
    {
        self::error($message, 401);
    }
    
    public static function forbidden(string $message = 'Forbidden'): void
    {
        self::error($message, 403);
    }
    
    public static function notFound(string $message = 'Not found'): void
    {
        self::error($message, 404);
    }
    
    public static function validationError(array $errors): void
    {
        self::error('Validation failed', 422, $errors);
    }
}
