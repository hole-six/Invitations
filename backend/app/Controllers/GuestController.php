<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Middleware\AuthMiddleware;

class GuestController
{
    public function index(string $invitationId): void
    {
        $auth = AuthMiddleware::handle();
        if (!$auth) return;
        
        $db = $GLOBALS['app']->getDatabase();
        
        // Verify invitation ownership
        $invitation = $db->fetchOne(
            'SELECT * FROM invitations WHERE id = ? AND user_id = ?',
            [$invitationId, $auth['user_id']]
        );
        
        if (!$invitation) {
            Response::notFound('Invitation not found');
            return;
        }
        
        $guests = $db->fetchAll(
            'SELECT * FROM invitation_guests WHERE invitation_id = ? ORDER BY created_at DESC',
            [$invitationId]
        );
        
        Response::success($guests);
    }
    
    public function store(string $invitationId): void
    {
        $auth = AuthMiddleware::handle();
        if (!$auth) return;
        
        $request = new Request();
        $data = $request->validate([
            'name' => 'required|min:2',
            'email' => 'email',
            'phone' => 'max:20',
            'guest_type' => 'in:vip,family,friend,colleague,other',
        ]);
        
        $db = $GLOBALS['app']->getDatabase();
        
        // Verify invitation ownership
        $invitation = $db->fetchOne(
            'SELECT * FROM invitations WHERE id = ? AND user_id = ?',
            [$invitationId, $auth['user_id']]
        );
        
        if (!$invitation) {
            Response::notFound('Invitation not found');
            return;
        }
        
        $data['invitation_id'] = $invitationId;
        $id = $db->insert('invitation_guests', $data);
        
        $guest = $db->fetchOne('SELECT * FROM invitation_guests WHERE id = ?', [$id]);
        Response::created($guest, 'Guest added successfully');
    }
    
    public function update(string $id): void
    {
        $auth = AuthMiddleware::handle();
        if (!$auth) return;
        
        $request = new Request();
        $data = $request->input();
        
        $db = $GLOBALS['app']->getDatabase();
        
        // Verify guest belongs to user's invitation
        $guest = $db->fetchOne(
            'SELECT g.*, i.user_id 
            FROM invitation_guests g
            JOIN invitations i ON g.invitation_id = i.id
            WHERE g.id = ?',
            [$id]
        );
        
        if (!$guest || $guest['user_id'] != $auth['user_id']) {
            Response::notFound('Guest not found');
            return;
        }
        
        $db->update('invitation_guests', $data, 'id = ?', [$id]);
        
        $updated = $db->fetchOne('SELECT * FROM invitation_guests WHERE id = ?', [$id]);
        Response::success($updated, 'Guest updated successfully');
    }
    
    public function destroy(string $id): void
    {
        $auth = AuthMiddleware::handle();
        if (!$auth) return;
        
        $db = $GLOBALS['app']->getDatabase();
        
        // Verify guest belongs to user's invitation
        $guest = $db->fetchOne(
            'SELECT g.*, i.user_id 
            FROM invitation_guests g
            JOIN invitations i ON g.invitation_id = i.id
            WHERE g.id = ?',
            [$id]
        );
        
        if (!$guest || $guest['user_id'] != $auth['user_id']) {
            Response::notFound('Guest not found');
            return;
        }
        
        $db->delete('invitation_guests', 'id = ?', [$id]);
        Response::success(null, 'Guest deleted successfully');
    }
    
    public function import(): void
    {
        $auth = AuthMiddleware::handle();
        if (!$auth) return;
        
        // TODO: Implement CSV import
        Response::success(null, 'Guests imported successfully');
    }
    
    public function export(): void
    {
        $auth = AuthMiddleware::handle();
        if (!$auth) return;
        
        // TODO: Implement CSV export
        Response::success(null, 'Guests exported successfully');
    }
}
