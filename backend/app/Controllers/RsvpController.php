<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Middleware\AuthMiddleware;

class RsvpController
{
    public function submit(string $invitationId): void
    {
        $request = new Request();
        
        $data = $request->validate([
            'name' => 'required|min:2',
            'email' => 'email',
            'phone' => 'max:20',
            'attendance_status' => 'required|in:attending,not_attending,maybe',
            'number_of_guests' => 'integer',
            'dietary_requirements' => '',
            'message' => '',
        ]);
        
        $db = $GLOBALS['app']->getDatabase();
        
        // Verify invitation exists and RSVP is enabled
        $invitation = $db->fetchOne(
            'SELECT * FROM invitations WHERE id = ? AND status = ? AND rsvp_enabled = 1',
            [$invitationId, 'published']
        );
        
        if (!$invitation) {
            Response::notFound('Invitation not found or RSVP not enabled');
            return;
        }
        
        $data['invitation_id'] = $invitationId;
        $data['ip_address'] = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        
        $id = $db->insert('invitation_rsvp', $data);
        
        $rsvp = $db->fetchOne('SELECT * FROM invitation_rsvp WHERE id = ?', [$id]);
        Response::created($rsvp, 'RSVP submitted successfully');
    }
    
    public function list(string $invitationId): void
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
        
        $rsvps = $db->fetchAll(
            'SELECT * FROM invitation_rsvp WHERE invitation_id = ? ORDER BY created_at DESC',
            [$invitationId]
        );
        
        // Get statistics
        $stats = $db->fetchOne(
            'SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN attendance_status = "attending" THEN 1 ELSE 0 END) as attending,
                SUM(CASE WHEN attendance_status = "not_attending" THEN 1 ELSE 0 END) as not_attending,
                SUM(CASE WHEN attendance_status = "maybe" THEN 1 ELSE 0 END) as maybe,
                SUM(number_of_guests) as total_guests
            FROM invitation_rsvp 
            WHERE invitation_id = ?',
            [$invitationId]
        );
        
        Response::success([
            'rsvps' => $rsvps,
            'statistics' => [
                'total' => (int)$stats['total'],
                'attending' => (int)$stats['attending'],
                'not_attending' => (int)$stats['not_attending'],
                'maybe' => (int)$stats['maybe'],
                'total_guests' => (int)$stats['total_guests'],
            ],
        ]);
    }
}
