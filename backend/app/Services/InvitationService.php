<?php

namespace App\Services;

use App\Repositories\InvitationRepository;
use App\Helpers\Uuid;

class InvitationService
{
    private InvitationRepository $invitationRepo;
    
    public function __construct(InvitationRepository $invitationRepo)
    {
        $this->invitationRepo = $invitationRepo;
    }
    
    public function getUserInvitations(int $userId, array $filters = []): array
    {
        return array_map(
            fn($invitation) => $invitation->toArray(),
            $this->invitationRepo->findByUser($userId, $filters)
        );
    }
    
    public function getAllInvitations(array $filters = []): array
    {
        // Get all invitations (admin only)
        $db = $GLOBALS['app']->getDatabase();
        
        $sql = 'SELECT i.*, t.thumbnail_url as template_thumbnail, u.full_name as user_name, u.email as user_email
                FROM invitations i 
                LEFT JOIN templates t ON i.template_id = t.id
                LEFT JOIN users u ON i.user_id = u.id
                WHERE 1=1';
        $params = [];
        
        // Filter by user_id if provided
        if (!empty($filters['user_id']) && $filters['user_id'] !== 'all') {
            $sql .= ' AND i.user_id = ?';
            $params[] = (int)$filters['user_id'];
        }
        
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $sql .= ' AND i.status = ?';
            $params[] = $filters['status'];
        }
        
        if (!empty($filters['search'])) {
            $sql .= ' AND (i.title LIKE ? OR i.groom_name LIKE ? OR i.bride_name LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)';
            $searchTerm = '%' . $filters['search'] . '%';
            $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm, $searchTerm, $searchTerm]);
        }
        
        $sortBy = $filters['sortBy'] ?? 'created_at';
        $sortOrder = $filters['sortOrder'] ?? 'desc';
        $sql .= " ORDER BY i.$sortBy $sortOrder";
        
        $limit = $filters['limit'] ?? 100;
        $sql .= " LIMIT $limit";
        
        $invitations = $db->fetchAll($sql, $params);
        
        return $invitations;
    }
    
    public function getInvitation(int $id, int $userId): array
    {
        $invitation = $this->invitationRepo->findById($id);
        
        if (!$invitation) {
            throw new \Exception('Invitation not found');
        }
        
        if ($invitation->user_id !== $userId) {
            throw new \Exception('Unauthorized access');
        }
        
        return $invitation->toArray();
    }
    
    public function createInvitation(array $data, int $userId): array
    {
        // Generate slug
        $data['user_id'] = $userId;
        
        if (!isset($data['slug'])) {
            // Generate slug from bride and groom names if available
            if (!empty($data['groom_name']) && !empty($data['bride_name'])) {
                $data['slug'] = $this->generateSlug($data['groom_name']) . '-' . $this->generateSlug($data['bride_name']);
            } else {
                $data['slug'] = $this->generateSlug($data['title']);
            }
        }
        
        // Ensure slug is unique for this user
        $data['slug'] = $this->ensureUniqueSlug($data['slug'], $userId);
        
        // Set default design data if not provided
        if (!isset($data['design_data'])) {
            $data['design_data'] = [
                'elements' => [],
                'settings' => [
                    'background_color' => '#ffffff',
                    'font_family' => 'Arial',
                ],
            ];
        }
        
        $invitation = $this->invitationRepo->create($data);
        
        return $invitation->toArray();
    }
    
    public function createFromTemplate(int $templateId, array $data, int $userId): array
    {
        // Fetch template from database
        $db = $GLOBALS['app']->getDatabase();
        $template = $db->fetchOne('SELECT * FROM templates WHERE id = ? AND is_active = 1', [$templateId]);
        
        if (!$template) {
            throw new \Exception('Template not found');
        }
        
        // Parse design_data if it's a JSON string
        $designData = $template['design_data'];
        if (is_string($designData)) {
            $designData = json_decode($designData, true);
        }
        
        // Determine template type based on what content exists
        $templateType = 'canvas'; // default
        $htmlContent = null;
        
        if (!empty($template['html_template'])) {
            $templateType = 'html';
            $htmlContent = $template['html_template'];
            
            // If it behaves like a file path (starts with storage/), load the content
            if (strpos($htmlContent, 'storage/templates/') === 0) {
                $filepath = __DIR__ . '/../../' . $htmlContent;
                if (file_exists($filepath)) {
                    $htmlContent = file_get_contents($filepath);
                }
            }
        } elseif (!empty($template['html_content'])) {
            $templateType = 'html';
            $htmlContent = $template['html_content'];
        }
        
        // Prepare invitation data
        $invitationData = [
            'uuid' => \App\Helpers\Uuid::generate(),
            'user_id' => $userId,
            'template_id' => $templateId,
            'title' => $data['title'] ?? $template['name'],
            'slug' => '', // Will be generated below
            'template_type' => $templateType,
            'html_content' => $htmlContent, // Copy HTML content from template
            'design_data' => $designData, // Clone template design
            'status' => 'draft',
            'event_date' => $data['event_date'] ?? null,
            'groom_name' => $data['groom_name'] ?? null,
            'bride_name' => $data['bride_name'] ?? null,
        ];
        
        // Generate slug from bride and groom names if available
        if (!empty($invitationData['groom_name']) && !empty($invitationData['bride_name'])) {
            $invitationData['slug'] = $this->generateSlug($invitationData['groom_name']) . '-' . $this->generateSlug($invitationData['bride_name']);
        } else {
            $invitationData['slug'] = $this->generateSlug($invitationData['title']);
        }
        
        // Ensure slug is unique for this user
        $invitationData['slug'] = $this->ensureUniqueSlug($invitationData['slug'], $userId);
        
        // Create invitation
        $invitation = $this->invitationRepo->create($invitationData);
        
        // Increment template usage count
        $db->query('UPDATE templates SET usage_count = usage_count + 1 WHERE id = ?', [$templateId]);
        
        return $invitation->toArray();
    }
    
    public function updateInvitation(int $id, array $data, int $userId): array
    {
        $invitation = $this->invitationRepo->findById($id);
        
        if (!$invitation) {
            throw new \Exception('Invitation not found');
        }
        
        if ($invitation->user_id !== $userId) {
            throw new \Exception('Unauthorized access');
        }
        
        // Auto-update slug if bride/groom names changed
        if ((isset($data['groom_name']) || isset($data['bride_name'])) && !isset($data['slug'])) {
            $groomName = $data['groom_name'] ?? $invitation->groom_name;
            $brideName = $data['bride_name'] ?? $invitation->bride_name;
            
            if (!empty($groomName) && !empty($brideName)) {
                $newSlug = $this->generateSlug($groomName) . '-' . $this->generateSlug($brideName);
                // Only update if different from current slug
                if ($newSlug !== $invitation->slug) {
                    $data['slug'] = $this->ensureUniqueSlug($newSlug, $userId, $id);
                }
            }
        }
        
        // If slug is being manually updated, ensure it's unique
        if (isset($data['slug']) && $data['slug'] !== $invitation->slug) {
            $data['slug'] = $this->ensureUniqueSlug($data['slug'], $userId, $id);
        }
        
        $this->invitationRepo->update($id, $data);
        
        return $this->getInvitation($id, $userId);
    }
    
    public function deleteInvitation(int $id, int $userId): bool
    {
        $invitation = $this->invitationRepo->findById($id);
        
        if (!$invitation) {
            throw new \Exception('Invitation not found');
        }
        
        if ($invitation->user_id !== $userId) {
            throw new \Exception('Unauthorized access');
        }
        
        return $this->invitationRepo->delete($id);
    }
    
    public function publishInvitation(int $id, int $userId): array
    {
        $invitation = $this->invitationRepo->findById($id);
        
        if (!$invitation) {
            throw new \Exception('Invitation not found');
        }
        
        if ($invitation->user_id !== $userId) {
            throw new \Exception('Unauthorized access');
        }
        
        $this->invitationRepo->publish($id);
        
        return $this->getInvitation($id, $userId);
    }
    
    public function duplicateInvitation(int $id, int $userId): array
    {
        $invitation = $this->invitationRepo->duplicate($id, $userId);
        
        if (!$invitation) {
            throw new \Exception('Failed to duplicate invitation');
        }
        
        return $invitation->toArray();
    }
    
    public function getPublicInvitation(string $slug, ?string $password = null): array
    {
        $invitation = $this->invitationRepo->findPublicBySlug($slug);
        
        if (!$invitation) {
            throw new \Exception('Invitation not found');
        }
        
        // Check password if required
        if ($invitation->visibility === 'password') {
            if (!$password || $password !== $invitation->password) {
                throw new \Exception('Invalid password');
            }
        }
        
        // Increment views
        $this->invitationRepo->incrementViews($invitation->id);
        
        return $invitation->toArray();
    }
    
    public function getStatistics(int $userId): array
    {
        return $this->invitationRepo->getStatistics($userId);
    }
    
    private function generateSlug(string $title): string
    {
        // Vietnamese character map for removing accents
        $vietnameseMap = [
            'à' => 'a', 'á' => 'a', 'ả' => 'a', 'ã' => 'a', 'ạ' => 'a',
            'ă' => 'a', 'ằ' => 'a', 'ắ' => 'a', 'ẳ' => 'a', 'ẵ' => 'a', 'ặ' => 'a',
            'â' => 'a', 'ầ' => 'a', 'ấ' => 'a', 'ẩ' => 'a', 'ẫ' => 'a', 'ậ' => 'a',
            'đ' => 'd',
            'è' => 'e', 'é' => 'e', 'ẻ' => 'e', 'ẽ' => 'e', 'ẹ' => 'e',
            'ê' => 'e', 'ề' => 'e', 'ế' => 'e', 'ể' => 'e', 'ễ' => 'e', 'ệ' => 'e',
            'ì' => 'i', 'í' => 'i', 'ỉ' => 'i', 'ĩ' => 'i', 'ị' => 'i',
            'ò' => 'o', 'ó' => 'o', 'ỏ' => 'o', 'õ' => 'o', 'ọ' => 'o',
            'ô' => 'o', 'ồ' => 'o', 'ố' => 'o', 'ổ' => 'o', 'ỗ' => 'o', 'ộ' => 'o',
            'ơ' => 'o', 'ờ' => 'o', 'ớ' => 'o', 'ở' => 'o', 'ỡ' => 'o', 'ợ' => 'o',
            'ù' => 'u', 'ú' => 'u', 'ủ' => 'u', 'ũ' => 'u', 'ụ' => 'u',
            'ư' => 'u', 'ừ' => 'u', 'ứ' => 'u', 'ử' => 'u', 'ữ' => 'u', 'ự' => 'u',
            'ỳ' => 'y', 'ý' => 'y', 'ỷ' => 'y', 'ỹ' => 'y', 'ỵ' => 'y',
            'À' => 'A', 'Á' => 'A', 'Ả' => 'A', 'Ã' => 'A', 'Ạ' => 'A',
            'Ă' => 'A', 'Ằ' => 'A', 'Ắ' => 'A', 'Ẳ' => 'A', 'Ẵ' => 'A', 'Ặ' => 'A',
            'Â' => 'A', 'Ầ' => 'A', 'Ấ' => 'A', 'Ẩ' => 'A', 'Ẫ' => 'A', 'Ậ' => 'A',
            'Đ' => 'D',
            'È' => 'E', 'É' => 'E', 'Ẻ' => 'E', 'Ẽ' => 'E', 'Ẹ' => 'E',
            'Ê' => 'E', 'Ề' => 'E', 'Ế' => 'E', 'Ể' => 'E', 'Ễ' => 'E', 'Ệ' => 'E',
            'Ì' => 'I', 'Í' => 'I', 'Ỉ' => 'I', 'Ĩ' => 'I', 'Ị' => 'I',
            'Ò' => 'O', 'Ó' => 'O', 'Ỏ' => 'O', 'Õ' => 'O', 'Ọ' => 'O',
            'Ô' => 'O', 'Ồ' => 'O', 'Ố' => 'O', 'Ổ' => 'O', 'Ỗ' => 'O', 'Ộ' => 'O',
            'Ơ' => 'O', 'Ờ' => 'O', 'Ớ' => 'O', 'Ở' => 'O', 'Ỡ' => 'O', 'Ợ' => 'O',
            'Ù' => 'U', 'Ú' => 'U', 'Ủ' => 'U', 'Ũ' => 'U', 'Ụ' => 'U',
            'Ư' => 'U', 'Ừ' => 'U', 'Ứ' => 'U', 'Ử' => 'U', 'Ữ' => 'U', 'Ự' => 'U',
            'Ỳ' => 'Y', 'Ý' => 'Y', 'Ỷ' => 'Y', 'Ỹ' => 'Y', 'Ỵ' => 'Y',
        ];
        
        // Remove Vietnamese accents
        $slug = strtr($title, $vietnameseMap);
        
        // Remove all non-alphanumeric characters except spaces
        $slug = preg_replace('/[^a-zA-Z0-9\s]/', '', $slug);
        
        // Remove extra spaces
        $slug = preg_replace('/\s+/', ' ', $slug);
        $slug = trim($slug);
        
        // Split into words and capitalize each word
        $words = explode(' ', $slug);
        $words = array_map('ucfirst', $words);
        
        // Join with hyphen
        $slug = implode('-', $words);
        
        return $slug;
    }
    
    private function ensureUniqueSlug(string $slug, int $userId, ?int $excludeId = null): string
    {
        $originalSlug = $slug;
        $counter = 1;
        
        while (true) {
            $existing = $this->invitationRepo->findBySlug($slug, $userId);
            
            if (!$existing || ($excludeId && $existing->id === $excludeId)) {
                break;
            }
            
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }
        
        return $slug;
    }
}
