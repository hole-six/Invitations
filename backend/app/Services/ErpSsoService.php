<?php

namespace App\Services;

/**
 * Service đơn giản để verify token từ ERP và lấy user info
 * Wedding system là hệ thống CON - chỉ cần verify token từ ERP
 */
class ErpSsoService
{
    private string $erpApiUrl;
    
    public function __construct()
    {
        $this->erpApiUrl = getenv('ERP_API_URL') ?: 'https://api.hiweb.vn/api/v1';
    }
    
    /**
     * Verify token với ERP
     */
    public function verifyToken(string $token): bool
    {
        try {
            // Gọi API profile để verify token (nếu lấy được profile = token hợp lệ)
            $userInfo = $this->getUserInfo($token);
            return $userInfo !== null;
            
        } catch (\Exception $e) {
            error_log('ERP token verification failed: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Lấy thông tin user từ ERP bằng token
     */
    public function getUserInfo(string $token): ?array
    {
        try {
            $ch = curl_init($this->erpApiUrl . '/user/profile');
            
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/json',
                    'Authorization: ' . $token
                ]
            ]);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode !== 200) {
                return null;
            }
            
            $data = json_decode($response, true);
            
            if (!$data || !isset($data['code']) || $data['code'] !== 200) {
                return null;
            }
            
            return $this->mapErpUser($data['data'], $token);
            
        } catch (\Exception $e) {
            error_log('ERP getUserInfo exception: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Map ERP user data sang Wedding system format
     */
    private function mapErpUser(array $erpUser, string $token): array
    {
        return [
            'uuid' => $erpUser['uuid'] ?? uniqid('erp_', true),
            'email' => $erpUser['email'] ?? '',
            'full_name' => $erpUser['full_name'] ?? $erpUser['name'] ?? 'User',
            'phone' => $erpUser['phone_number'] ?? $erpUser['phone'] ?? null,
            'avatar_url' => $erpUser['avatar_url'] ?? $erpUser['avatar'] ?? null,
            'username' => $erpUser['user_name'] ?? $erpUser['username'] ?? $erpUser['email'],
            'role' => $this->mapErpRole($erpUser),
            'status' => 'active',
            'erp_token' => $token,
            'erp_user_id' => $erpUser['user_id'] ?? $erpUser['id'] ?? null,
            'erp_data' => json_encode($erpUser)
        ];
    }
    
    /**
     * Map ERP roles sang Wedding system roles
     */
    private function mapErpRole(array $erpUser): string
    {
        $roles = $erpUser['roles'] ?? [];
        
        if (empty($roles) && isset($erpUser['role'])) {
            $roleSlug = is_string($erpUser['role']) ? $erpUser['role'] : ($erpUser['role']['slug'] ?? '');
            if (in_array(strtolower($roleSlug), ['super_admin', 'admin', 'manager'])) {
                return 'admin';
            }
            return 'user';
        }
        
        foreach ($roles as $role) {
            $slug = is_string($role) ? $role : ($role['slug'] ?? $role['role_name'] ?? '');
            $slug = strtolower($slug);
            
            if (in_array($slug, ['super_admin', 'admin', 'manager', 'superadmin'])) {
                return 'admin';
            }
        }
        
        return 'user';
    }
    
    /**
     * Sync user từ ERP vào Wedding database
     */
    public function syncUser(array $erpUserData): ?array
    {
        try {
            $db = \App\Core\Database::getInstance()->getConnection();
            
            // Check user tồn tại theo email hoặc erp_user_id
            $stmt = $db->prepare("
                SELECT * FROM users 
                WHERE email = :email 
                OR (erp_user_id IS NOT NULL AND erp_user_id = :erp_user_id)
                LIMIT 1
            ");
            $stmt->execute([
                'email' => $erpUserData['email'],
                'erp_user_id' => $erpUserData['erp_user_id']
            ]);
            $existingUser = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if ($existingUser) {
                // Update
                $stmt = $db->prepare("
                    UPDATE users SET
                        full_name = :full_name,
                        phone = :phone,
                        avatar_url = :avatar_url,
                        role = :role,
                        erp_token = :erp_token,
                        erp_user_id = :erp_user_id,
                        erp_data = :erp_data,
                        updated_at = NOW()
                    WHERE id = :id
                ");
                $stmt->execute([
                    'full_name' => $erpUserData['full_name'],
                    'phone' => $erpUserData['phone'],
                    'avatar_url' => $erpUserData['avatar_url'],
                    'role' => $erpUserData['role'],
                    'erp_token' => $erpUserData['erp_token'],
                    'erp_user_id' => $erpUserData['erp_user_id'],
                    'erp_data' => $erpUserData['erp_data'],
                    'id' => $existingUser['id']
                ]);
                
                return array_merge($existingUser, $erpUserData);
            } else {
                // Create
                $stmt = $db->prepare("
                    INSERT INTO users (
                        uuid, email, full_name, phone, avatar_url, 
                        username, role, status, 
                        erp_token, erp_user_id, erp_data,
                        created_at, updated_at
                    ) VALUES (
                        :uuid, :email, :full_name, :phone, :avatar_url,
                        :username, :role, :status,
                        :erp_token, :erp_user_id, :erp_data,
                        NOW(), NOW()
                    )
                ");
                $stmt->execute([
                    'uuid' => $erpUserData['uuid'],
                    'email' => $erpUserData['email'],
                    'full_name' => $erpUserData['full_name'],
                    'phone' => $erpUserData['phone'],
                    'avatar_url' => $erpUserData['avatar_url'],
                    'username' => $erpUserData['username'],
                    'role' => $erpUserData['role'],
                    'status' => $erpUserData['status'],
                    'erp_token' => $erpUserData['erp_token'],
                    'erp_user_id' => $erpUserData['erp_user_id'],
                    'erp_data' => $erpUserData['erp_data']
                ]);
                
                $erpUserData['id'] = $db->lastInsertId();
                return $erpUserData;
            }
            
        } catch (\Exception $e) {
            error_log('ERP syncUser failed: ' . $e->getMessage());
            return null;
        }
    }
}
