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
            $data['slug'] = $this->generateSlug($data['title']);
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
        
        if (!empty($template['html_content'])) {
            $templateType = 'html';
            $htmlContent = $template['html_content'];
        }
        
        // Prepare invitation data
        $invitationData = [
            'uuid' => \App\Helpers\Uuid::generate(),
            'user_id' => $userId,
            'template_id' => $templateId,
            'title' => $data['title'] ?? $template['name'],
            'slug' => $this->generateSlug($data['title'] ?? $template['name']),
            'template_type' => $templateType,
            'html_content' => $htmlContent, // Copy HTML content from template
            'design_data' => $designData, // Clone template design
            'status' => 'draft',
            'event_date' => $data['event_date'] ?? null,
            'groom_name' => $data['groom_name'] ?? null,
            'bride_name' => $data['bride_name'] ?? null,
        ];
        
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
        
        // If slug is being updated, ensure it's unique
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
        $slug = strtolower($title);
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
        $slug = trim($slug, '-');
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
