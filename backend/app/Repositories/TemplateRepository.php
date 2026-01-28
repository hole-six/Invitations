<?php

namespace App\Repositories;

use App\Core\Database;
use App\Models\Template;

class TemplateRepository
{
    private Database $db;
    
    public function __construct(Database $db)
    {
        $this->db = $db;
    }
    
    public function findAll(array $filters = []): array
    {
        $sql = 'SELECT t.*, tc.name as category_name 
                FROM templates t 
                LEFT JOIN template_categories tc ON t.category_id = tc.id 
                WHERE 1=1';
        $params = [];
        
        if (isset($filters['category_id'])) {
            $sql .= ' AND t.category_id = ?';
            $params[] = $filters['category_id'];
        }
        
        if (isset($filters['is_premium'])) {
            $sql .= ' AND t.is_premium = ?';
            $params[] = $filters['is_premium'];
        }
        
        if (isset($filters['is_active'])) {
            $sql .= ' AND t.is_active = ?';
            $params[] = $filters['is_active'];
        }
        
        $sql .= ' ORDER BY t.sort_order ASC, t.created_at DESC';
        
        $data = $this->db->fetchAll($sql, $params);
        return array_map(fn($row) => new Template($row), $data);
    }
    
    public function findById(int $id): ?Template
    {
        $data = $this->db->fetchOne(
            'SELECT t.*, tc.name as category_name 
             FROM templates t 
             LEFT JOIN template_categories tc ON t.category_id = tc.id 
             WHERE t.id = ?',
            [$id]
        );
        return $data ? new Template($data) : null;
    }
    
    public function findBySlug(string $slug): ?Template
    {
        $data = $this->db->fetchOne(
            'SELECT t.*, tc.name as category_name 
             FROM templates t 
             LEFT JOIN template_categories tc ON t.category_id = tc.id 
             WHERE t.slug = ?',
            [$slug]
        );
        return $data ? new Template($data) : null;
    }
    
    public function create(array $data): Template
    {
        $id = $this->db->insert('templates', $data);
        return $this->findById($id);
    }
    
    public function update(int $id, array $data): bool
    {
        return $this->db->update('templates', $data, 'id = ?', [$id]) > 0;
    }
    
    public function delete(int $id): bool
    {
        return $this->db->delete('templates', 'id = ?', [$id]) > 0;
    }
    
    public function getCategories(): array
    {
        return $this->db->fetchAll(
            'SELECT * FROM template_categories ORDER BY sort_order ASC, name ASC'
        );
    }
}
