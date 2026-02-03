<?php

namespace App\Services;

use App\Repositories\UserRepository;
use App\Helpers\Hash;
use App\Helpers\JWT;

class AuthService
{
    private UserRepository $userRepo;
    private array $config;
    
    public function __construct(UserRepository $userRepo, array $config)
    {
        $this->userRepo = $userRepo;
        $this->config = $config;
    }
    
    public function register(array $data): array
    {
        // Check if email exists
        if ($this->userRepo->emailExists($data['email'])) {
            throw new \Exception('Email already exists');
        }
        
        // Create user
        $userData = [
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'full_name' => $data['full_name'],
            'phone' => $data['phone'] ?? null,
            'role' => 'user',
            'status' => 'active',
        ];
        
        $user = $this->userRepo->create($userData);
        
        // Generate tokens
        $tokens = $this->generateTokens($user->id);
        
        return [
            'user' => $user->toArray(),
            'tokens' => $tokens,
        ];
    }
    
    public function login(string $email, string $password, string $ip): array
    {
        // Find user
        $user = $this->userRepo->findByEmail($email);
        
        if (!$user) {
            error_log("Login failed: User not found for email: $email");
            throw new \Exception('Invalid credentials');
        }
        
        error_log("Login attempt: User found - ID: {$user->id}, Email: {$user->email}");
        error_log("Password hash from DB: {$user->password}");
        
        // Verify password
        if (!Hash::verify($password, $user->password)) {
            error_log("Login failed: Password verification failed for user: {$user->email}");
            throw new \Exception('Invalid credentials');
        }
        
        error_log("Login success: Password verified for user: {$user->email}");
        
        // Check if user is active
        if ($user->status !== 'active') {
            error_log("Login failed: User status is not active: {$user->status}");
            throw new \Exception('Account is not active');
        }
        
        // Update last login
        $this->userRepo->updateLastLogin($user->id, $ip);
        
        // Generate tokens
        $tokens = $this->generateTokens($user->id);
        
        return [
            'user' => $user->toArray(),
            'tokens' => $tokens,
        ];
    }
    
    public function refreshToken(string $refreshToken): array
    {
        $payload = JWT::decode($refreshToken, $this->config['jwt']['secret']);
        
        if (!$payload || !isset($payload['user_id'])) {
            throw new \Exception('Invalid refresh token');
        }
        
        // Generate new tokens
        return $this->generateTokens($payload['user_id']);
    }
    
    private function generateTokens(int $userId): array
    {
        // Get user role from database
        $user = $this->userRepo->findById($userId);
        $userRole = $user ? $user->role : 'user';
        
        $accessToken = JWT::encode(
            [
                'user_id' => $userId,
                'role' => $userRole
            ],
            $this->config['jwt']['secret'],
            $this->config['jwt']['expiration']
        );
        
        $refreshToken = JWT::encode(
            [
                'user_id' => $userId,
                'role' => $userRole,
                'type' => 'refresh'
            ],
            $this->config['jwt']['secret'],
            $this->config['jwt']['refresh_expiration']
        );
        
        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type' => 'Bearer',
            'expires_in' => $this->config['jwt']['expiration'],
        ];
    }
    
    public function me(int $userId): array
    {
        $user = $this->userRepo->findById($userId);
        
        if (!$user) {
            throw new \Exception('User not found');
        }
        
        return $user->toArray();
    }
}
