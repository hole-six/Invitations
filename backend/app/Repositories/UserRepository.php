<?php

namespace App\Repositories;

use App\Core\Database;
use App\Models\User;

class UserRepository
{
    private Database $db;
    
    public function __construct(Database $db)
    {
        $this->db = $db;
    }
    
    public function findById(int $id): ?User
    {
        $data = $this->db->fetchOne('SELECT * FROM users WHERE id = ?', [$id]);
        return $data ? new User($data) : null;
    }
    
    public function findByEmail(string $email): ?User
    {
        $data = $this->db->fetchOne('SELECT * FROM users WHERE email = ?', [$email]);
        return $data ? new User($data) : null;
    }
    
    public function create(array $data): User
    {
        $id = $this->db->insert('users', $data);
        return $this->findById($id);
    }
    
    public function update(int $id, array $data): bool
    {
        return $this->db->update('users', $data, 'id = ?', [$id]) > 0;
    }
    
    public function delete(int $id): bool
    {
        return $this->db->delete('users', 'id = ?', [$id]) > 0;
    }
    
    public function updateLastLogin(int $id, string $ip): void
    {
        // Check if columns exist before updating
        try {
            $this->db->update('users', [
                'last_login_at' => date('Y-m-d H:i:s'),
                'last_login_ip' => $ip,
            ], 'id = ?', [$id]);
        } catch (\PDOException $e) {
            // Ignore if columns don't exist
            if (strpos($e->getMessage(), 'Unknown column') === false) {
                throw $e;
            }
        }
    }
    
    public function emailExists(string $email): bool
    {
        $result = $this->db->fetchOne(
            'SELECT COUNT(*) as count FROM users WHERE email = ?',
            [$email]
        );
        return $result['count'] > 0;
    }
}
