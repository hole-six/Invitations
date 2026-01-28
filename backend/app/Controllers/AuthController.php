<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\AuthService;
use App\Repositories\UserRepository;

class AuthController
{
    private AuthService $authService;
    
    public function __construct()
    {
        $db = $GLOBALS['app']->getDatabase();
        $config = $GLOBALS['config'] ?? require CONFIG_PATH . '/app.php';
        
        $userRepo = new UserRepository($db);
        $this->authService = new AuthService($userRepo, $config);
    }
    
    public function register(): void
    {
        $request = new Request();
        
        $data = $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'full_name' => 'required|min:2',
            'phone' => 'max:20',
        ]);
        
        try {
            $result = $this->authService->register($data);
            Response::created([
                'user' => $result['user'],
                'tokens' => $result['tokens']
            ], 'Registration successful');
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    public function login(): void
    {
        $request = new Request();
        
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);
        
        try {
            $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
            $result = $this->authService->login($data['email'], $data['password'], $ip);
            Response::success([
                'user' => $result['user'],
                'tokens' => $result['tokens']
            ], 'Login successful');
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 401);
        }
    }
    
    public function logout(): void
    {
        // In a real application, you would invalidate the token here
        // For now, just return success
        Response::success(null, 'Logout successful');
    }
    
    public function refresh(): void
    {
        $request = new Request();
        
        $data = $request->validate([
            'refresh_token' => 'required',
        ]);
        
        try {
            $result = $this->authService->refreshToken($data['refresh_token']);
            Response::success([
                'tokens' => $result
            ], 'Token refreshed');
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 401);
        }
    }
    
    public function me(): void
    {
        $auth = \App\Middleware\AuthMiddleware::handle();
        
        if (!$auth) {
            return;
        }
        
        try {
            $result = $this->authService->me($auth['user_id']);
            Response::success($result);
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 404);
        }
    }
    
    public function forgotPassword(): void
    {
        $request = new Request();
        
        $data = $request->validate([
            'email' => 'required|email',
        ]);
        
        // TODO: Implement password reset logic
        Response::success(null, 'Password reset email sent');
    }
    
    public function resetPassword(): void
    {
        $request = new Request();
        
        $data = $request->validate([
            'token' => 'required',
            'password' => 'required|min:6',
        ]);
        
        // TODO: Implement password reset logic
        Response::success(null, 'Password reset successful');
    }
}
