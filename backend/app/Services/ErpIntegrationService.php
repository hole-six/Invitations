<?php

namespace App\Services;

use App\Core\Database;
use App\Helpers\JWT;
use App\Helpers\Uuid;

class ErpIntegrationService
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Sync user từ ERP vào database
     * 
     * @param array $erpData Data from ERP system
     * @return array User data
     */
    public function syncUser($erpData)
    {
        // Check if user exists by erp_uuid or email
        $stmt = $this->db->prepare("
            SELECT * FROM users 
            WHERE erp_uuid = ? OR email = ?
        ");
        $stmt->execute([$erpData['erp_uuid'], $erpData['email']]);
        $existingUser = $stmt->fetch(\PDO::FETCH_ASSOC);

        if ($existingUser) {
            // Update existing user
            return $this->updateErpUser($existingUser['id'], $erpData);
        } else {
            // Create new user
            return $this->createErpUser($erpData);
        }
    }

    /**
     * Update existing user with ERP data
     */
    private function updateErpUser($userId, $erpData)
    {
        $stmt = $this->db->prepare("
            UPDATE users SET
                erp_uuid = ?,
                erp_user_name = ?,
                erp_department_id = ?,
                is_erp_user = 1,
                email = ?,
                full_name = ?,
                phone = ?,
                avatar_url = ?,
                erp_access_token = ?,
                erp_token_expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR),
                last_login_at = NOW(),
                updated_at = NOW()
            WHERE id = ?
        ");
        
        $stmt->execute([
            $erpData['erp_uuid'] ?? $erpData['uuid'],
            $erpData['user_name'] ?? null,
            $erpData['department_id'] ?? null,
            $erpData['email'],
            $erpData['full_name'],
            $erpData['phone_number'] ?? $erpData['phone'] ?? null,
            $this->normalizeAvatarUrl($erpData['avatar_url'] ?? null),
            $erpData['access_token'] ?? null,
            $userId
        ]);

        return $this->getUserById($userId);
    }

    /**
     * Create new user from ERP data
     */
    private function createErpUser($erpData)
    {
        $uuid = Uuid::generate();
        
        $stmt = $this->db->prepare("
            INSERT INTO users (
                uuid, erp_uuid, erp_user_name, erp_department_id, is_erp_user,
                email, password, full_name, phone, avatar_url,
                role, status, erp_access_token, erp_token_expires_at,
                email_verified_at, last_login_at, created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, 1,
                ?, NULL, ?, ?, ?,
                'user', 'active', ?, DATE_ADD(NOW(), INTERVAL 24 HOUR),
                NOW(), NOW(), NOW(), NOW()
            )
        ");
        
        $stmt->execute([
            $uuid,
            $erpData['erp_uuid'] ?? $erpData['uuid'],
            $erpData['user_name'] ?? null,
            $erpData['department_id'] ?? null,
            $erpData['email'],
            $erpData['full_name'],
            $erpData['phone_number'] ?? $erpData['phone'] ?? null,
            $this->normalizeAvatarUrl($erpData['avatar_url'] ?? null),
            $erpData['access_token'] ?? null
        ]);

        return $this->getUserByUuid($uuid);
    }

    /**
     * Verify ERP token by calling ERP API
     * 
     * @param string $token ERP JWT token
     * @return array|null User data if valid, null if invalid
     */
    public function verifyErpToken($token)
    {
        $erpApiUrl = getenv('ERP_API_URL');
        
        if (!$erpApiUrl) {
            throw new \Exception('ERP_API_URL not configured');
        }

        $response = $this->callErpApi("{$erpApiUrl}/api/auth/verify", [
            'token' => $token
        ]);

        if ($response && isset($response['status']) && $response['status']) {
            return $response['data'];
        }

        return null;
    }

    /**
     * Generate JWT token cho user
     * 
     * @param array $user User data
     * @return string JWT token
     */
    public function generateToken($user)
    {
        $payload = [
            'user_id' => $user['id'],
            'uuid' => $user['uuid'],
            'email' => $user['email'],
            'role' => $user['role'],
            'is_erp_user' => $user['is_erp_user'] ?? false,
            'erp_uuid' => $user['erp_uuid'] ?? null
        ];

        return JWT::encode($payload);
    }

    /**
     * Check if ERP token is still valid
     * 
     * @param array $user User data
     * @return bool
     */
    public function isErpTokenValid($user)
    {
        if (!$user['is_erp_user'] || !$user['erp_token_expires_at']) {
            return false;
        }

        $expiresAt = strtotime($user['erp_token_expires_at']);
        return $expiresAt > time();
    }

    /**
     * Call ERP API
     * 
     * @param string $url API endpoint
     * @param array $data Request data
     * @return array|null Response data
     */
    private function callErpApi($url, $data)
    {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/json',
            'X-API-Key: ' . getenv('ERP_API_KEY')
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            error_log("ERP API Error: {$error}");
            return null;
        }

        if ($httpCode === 200) {
            return json_decode($response, true);
        }

        error_log("ERP API returned status {$httpCode}: {$response}");
        return null;
    }

    /**
     * Normalize avatar URL from ERP
     */
    private function normalizeAvatarUrl($avatarUrl)
    {
        if (!$avatarUrl) {
            return null;
        }

        // If it's a relative path, prepend ERP URL
        if (strpos($avatarUrl, 'http') !== 0) {
            $erpUrl = getenv('ERP_API_URL');
            return rtrim($erpUrl, '/') . '/' . ltrim($avatarUrl, '/');
        }

        return $avatarUrl;
    }

    /**
     * Get user by ID
     */
    private function getUserById($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        if ($user) {
            unset($user['password']); // Don't return password
        }
        
        return $user;
    }

    /**
     * Get user by UUID
     */
    private function getUserByUuid($uuid)
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE uuid = ?");
        $stmt->execute([$uuid]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        if ($user) {
            unset($user['password']); // Don't return password
        }
        
        return $user;
    }

    /**
     * Get user by ERP UUID
     */
    public function getUserByErpUuid($erpUuid)
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE erp_uuid = ?");
        $stmt->execute([$erpUuid]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        if ($user) {
            unset($user['password']); // Don't return password
        }
        
        return $user;
    }
}
