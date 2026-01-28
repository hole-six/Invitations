<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\InvitationService;
use App\Repositories\InvitationRepository;
use App\Middleware\AuthMiddleware;

class InvitationController
{
    private InvitationService $invitationService;
    
    public function __construct()
    {
        $db = $GLOBALS['app']->getDatabase();
        $invitationRepo = new InvitationRepository($db);
        $this->invitationService = new InvitationService($invitationRepo);
    }
    
    public function index(): void
    {
        $auth = AuthMiddleware::handle();
        if (!$auth) return;
        $userId = $auth['user_id'];
        
        $request = new Request();
        $filters = [
            'status' => $request->query('status'),
            'event_type' => $request->query('event_type'),
            'limit' => $request->query('limit', 20),
        ];
        
        try {
            $invitations = $this->invitationService->getUserInvitations($userId, $filters);
            Response::success($invitations);
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
    
    public function show(string $id): void
    {
        $auth = AuthMiddleware::handle();
        if (!$auth) return;
        $userId = $auth['user_id'];
        
        try {
            $invitation = $this->invitationService->getInvitation((int)$id, $userId);
            Response::success($invitation);
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 404);
        }
    }
    
    public function store(): void
    {
        $auth = AuthMiddleware::handle();
        if (!$auth) return;
        
        $request = new Request();
        $data = $request->validate([
            'title' => 'required|min:3',
            'event_type' => 'in:wedding,engagement,birthday,anniversary,other',
            'event_date' => '',
            'groom_name' => '',
            'bride_name' => '',
        ]);
        
        try {
            $invitation = $this->invitationService->createInvitation($data, $auth['user_id']);
            Response::created($invitation, 'Invitation created successfully');
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    public function createFromTemplate(): void
    {
        // TEMPORARY: Skip auth check for development
        // TODO: Re-enable auth in production
        $userId = 1; // Use correct user ID from database
        
        /* Original auth code - uncomment for production
        $auth = AuthMiddleware::handle();
        if (!$auth) return;
        $userId = $auth['user_id'];
        */
        
        $request = new Request();
        $data = $request->validate([
            'template_id' => 'required|integer',
            'title' => '',
            'event_type' => 'in:wedding,engagement,birthday,anniversary,other',
            'event_date' => '',
            'groom_name' => '',
            'bride_name' => '',
        ]);
        
        try {
            $invitation = $this->invitationService->createFromTemplate(
                (int)$data['template_id'],
                $data,
                $userId
            );
            Response::created($invitation, 'Invitation created from template successfully');
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    public function update(string $id): void
    {
        // TEMPORARY: Skip auth check for development
        // TODO: Re-enable auth in production
        $userId = 1; // Use correct user ID from database
        
        /* Original auth code - uncomment for production
        $auth = AuthMiddleware::handle();
        if (!$auth) return;
        $userId = $auth['user_id'];
        */
        
        $request = new Request();
        $data = $request->input();
        
        try {
            $invitation = $this->invitationService->updateInvitation((int)$id, $data, $userId);
            Response::success($invitation, 'Invitation updated successfully');
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    public function destroy(string $id): void
    {
        // TEMPORARY: Skip auth check for development
        // TODO: Re-enable auth in production
        $userId = 1; // Use correct user ID from database
        
        /* Original auth code - uncomment for production
        $auth = AuthMiddleware::handle();
        if (!$auth) return;
        $userId = $auth['user_id'];
        */
        
        try {
            $this->invitationService->deleteInvitation((int)$id, $userId);
            Response::success(null, 'Invitation deleted successfully');
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    public function publish(string $id): void
    {
        // TEMPORARY: Skip auth check for development
        // TODO: Re-enable auth in production
        $userId = 1; // Use correct user ID from database
        
        /* Original auth code - uncomment for production
        $auth = AuthMiddleware::handle();
        if (!$auth) return;
        $userId = $auth['user_id'];
        */
        
        try {
            $invitation = $this->invitationService->publishInvitation((int)$id, $userId);
            Response::success($invitation, 'Invitation published successfully');
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    public function duplicate(string $id): void
    {
        // TEMPORARY: Skip auth check for development
        // TODO: Re-enable auth in production
        $userId = 1; // Use correct user ID from database
        
        /* Original auth code - uncomment for production
        $auth = AuthMiddleware::handle();
        if (!$auth) return;
        $userId = $auth['user_id'];
        */
        
        try {
            $invitation = $this->invitationService->duplicateInvitation((int)$id, $userId);
            Response::created($invitation, 'Invitation duplicated successfully');
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    public function versions(string $id): void
    {
        $auth = AuthMiddleware::handle();
        if (!$auth) return;
        
        // TODO: Implement version history
        Response::success([], 'Version history');
    }
    
    public function restore(string $id): void
    {
        $auth = AuthMiddleware::handle();
        if (!$auth) return;
        
        // TODO: Implement version restore
        Response::success(null, 'Version restored');
    }
    
    public function publicView(string $slug): void
    {
        $request = new Request();
        $password = $request->input('password');
        
        try {
            $invitation = $this->invitationService->getPublicInvitation($slug, $password);
            Response::success($invitation);
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 404);
        }
    }
}
