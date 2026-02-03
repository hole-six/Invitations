<?php

namespace App\Repositories;

use App\Core\Database;
use App\Models\Invitation;

class InvitationRepository
{
    private Database $db;
    
    public function __construct(Database $db)
    {
        $this->db = $db;
    }
    
    public function findById(int $id): ?Invitation
    {
        $data = $this->db->fetchOne('SELECT * FROM invitations WHERE id = ?', [$id]);
        return $data ? new Invitation($data) : null;
    }
    
    public function findByUuid(string $uuid): ?Invitation
    {
        $data = $this->db->fetchOne('SELECT * FROM invitations WHERE uuid = ?', [$uuid]);
        return $data ? new Invitation($data) : null;
    }
    
    public function findBySlug(string $slug, int $userId): ?Invitation
    {
        $data = $this->db->fetchOne(
            'SELECT * FROM invitations WHERE slug = ? AND user_id = ?',
            [$slug, $userId]
        );
        return $data ? new Invitation($data) : null;
    }
    
    public function findPublicBySlug(string $slug): ?Invitation
    {
        // Debug: Log the query
        error_log("Finding public invitation with slug: {$slug}");
        
        // Find invitation by slug (published OR draft for preview)
        $data = $this->db->fetchOne(
            'SELECT * FROM invitations WHERE slug = ? AND visibility IN (?, ?)',
            [$slug, 'public', 'password']
        );
        
        // Debug: If not found, check if invitation exists with any status
        if (!$data) {
            $anyStatus = $this->db->fetchOne(
                'SELECT slug, status, visibility FROM invitations WHERE slug = ?',
                [$slug]
            );
            if ($anyStatus) {
                error_log("Invitation exists but visibility not public/password: " . json_encode($anyStatus));
            } else {
                error_log("Invitation does not exist with slug: {$slug}");
            }
        }
        
        return $data ? new Invitation($data) : null;
    }
    
    public function findByUser(int $userId, array $filters = []): array
    {
        $sql = 'SELECT i.*, t.thumbnail_url as template_thumbnail 
                FROM invitations i 
                LEFT JOIN templates t ON i.template_id = t.id 
                WHERE i.user_id = ?';
        $params = [$userId];
        
        if (isset($filters['status'])) {
            $sql .= ' AND i.status = ?';
            $params[] = $filters['status'];
        }
        
        if (isset($filters['event_type'])) {
            $sql .= ' AND i.event_type = ?';
            $params[] = $filters['event_type'];
        }
        
        $sql .= ' ORDER BY i.created_at DESC';
        
        if (isset($filters['limit'])) {
            $sql .= ' LIMIT ?';
            $params[] = (int)$filters['limit'];
        }
        
        $results = $this->db->fetchAll($sql, $params);
        return array_map(fn($data) => new Invitation($data), $results);
    }
    
    public function create(array $data): Invitation
    {
        // Convert design_data array to JSON
        if (isset($data['design_data']) && is_array($data['design_data'])) {
            $data['design_data'] = json_encode($data['design_data']);
        }
        
        $id = $this->db->insert('invitations', $data);
        return $this->findById($id);
    }
    
    public function update(int $id, array $data): bool
    {
        // Log incoming data for debugging
        error_log("Update invitation $id with data: " . json_encode($data));
        
        // Convert design_data array to JSON
        if (isset($data['design_data']) && is_array($data['design_data'])) {
            $data['design_data'] = json_encode($data['design_data']);
        }
        
        // Convert image_data array to JSON if needed
        if (isset($data['image_data']) && is_array($data['image_data'])) {
            $data['image_data'] = json_encode($data['image_data']);
        }
        
        // Convert custom_field_data array to JSON if needed
        if (isset($data['custom_field_data']) && is_array($data['custom_field_data'])) {
            $data['custom_field_data'] = json_encode($data['custom_field_data']);
        }
        
        try {
            $result = $this->db->update('invitations', $data, 'id = ?', [$id]);
            error_log("Update result: " . ($result > 0 ? 'success' : 'no rows affected'));
            return $result > 0;
        } catch (\Exception $e) {
            error_log("Update error: " . $e->getMessage());
            throw $e;
        }
    }
    
    public function delete(int $id): bool
    {
        return $this->db->delete('invitations', 'id = ?', [$id]) > 0;
    }
    
    public function incrementViews(int $id): void
    {
        $this->db->query(
            'UPDATE invitations SET views_count = views_count + 1 WHERE id = ?',
            [$id]
        );
    }
    
    public function publish(int $id): bool
    {
        return $this->update($id, [
            'status' => 'published',
            'published_at' => date('Y-m-d H:i:s'),
        ]);
    }
    
    public function duplicate(int $id, int $userId): ?Invitation
    {
        $original = $this->findById($id);
        if (!$original || $original->user_id !== $userId) {
            return null;
        }
        
        $data = $original->toArray();
        unset($data['id'], $data['created_at'], $data['updated_at']);
        
        $data['title'] = $data['title'] . ' (Copy)';
        $data['slug'] = $data['slug'] . '-copy-' . time();
        $data['uuid'] = \App\Helpers\Uuid::generate();
        $data['status'] = 'draft';
        $data['published_at'] = null;
        $data['views_count'] = 0;
        
        return $this->create($data);
    }
    
    public function getStatistics(int $userId): array
    {
        $stats = $this->db->fetchOne(
            'SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = "published" THEN 1 ELSE 0 END) as published,
                SUM(CASE WHEN status = "draft" THEN 1 ELSE 0 END) as draft,
                SUM(views_count) as total_views
            FROM invitations 
            WHERE user_id = ?',
            [$userId]
        );
        
        return [
            'total' => (int)$stats['total'],
            'published' => (int)$stats['published'],
            'draft' => (int)$stats['draft'],
            'total_views' => (int)$stats['total_views'],
        ];
    }
}
