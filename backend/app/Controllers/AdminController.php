<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Middleware\AuthMiddleware;

class AdminController
{
    private function checkAdmin(): ?array
    {
        $auth = AuthMiddleware::handle();
        if (!$auth) return null;
        
        $db = $GLOBALS['app']->getDatabase();
        $user = $db->fetchOne('SELECT * FROM users WHERE id = ?', [$auth['user_id']]);
        
        if (!$user || $user['role'] !== 'admin') {
            Response::error('Unauthorized. Admin access required.', 403);
            return null;
        }
        
        return $auth;
    }
    
    // ============================================
    // DASHBOARD STATS
    // ============================================
    public function dashboardStats(): void
    {
        if (!$this->checkAdmin()) return;
        
        $db = $GLOBALS['app']->getDatabase();
        
        try {
            // Get total counts
            $totalUsers = $db->fetchOne('SELECT COUNT(*) as count FROM users')['count'];
            $totalInvitations = $db->fetchOne('SELECT COUNT(*) as count FROM invitations')['count'];
            $totalTemplates = $db->fetchOne('SELECT COUNT(*) as count FROM templates')['count'];
            $publishedInvitations = $db->fetchOne('SELECT COUNT(*) as count FROM invitations WHERE status = ?', ['published'])['count'];
            $draftInvitations = $db->fetchOne('SELECT COUNT(*) as count FROM invitations WHERE status = ?', ['draft'])['count'];
            
            // Get monthly growth (last 30 days vs previous 30 days)
            $currentMonth = $db->fetchOne('SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)')['count'];
            $previousMonth = $db->fetchOne('SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)')['count'];
            $monthlyGrowth = $previousMonth > 0 ? (($currentMonth - $previousMonth) / $previousMonth) * 100 : 0;
            
            Response::success([
                'totalUsers' => (int)$totalUsers,
                'totalInvitations' => (int)$totalInvitations,
                'totalTemplates' => (int)$totalTemplates,
                'publishedInvitations' => (int)$publishedInvitations,
                'draftInvitations' => (int)$draftInvitations,
                'monthlyGrowth' => round($monthlyGrowth, 1)
            ]);
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
    
    // ============================================
    // USER MANAGEMENT
    // ============================================
    public function getUsers(): void
    {
        if (!$this->checkAdmin()) return;
        
        $request = new Request();
        $db = $GLOBALS['app']->getDatabase();
        
        $role = $request->query('role');
        $status = $request->query('status');
        $search = $request->query('search');
        $sortBy = $request->query('sort_by', 'created_at');
        $sortOrder = $request->query('sort_order', 'desc');
        
        $sql = 'SELECT id, uuid, email, full_name, phone, role, status, avatar_url, last_login_at, last_login_ip, created_at, updated_at FROM users WHERE 1=1';
        $params = [];
        
        if ($role && $role !== 'all') {
            $sql .= ' AND role = ?';
            $params[] = $role;
        }
        
        if ($status && $status !== 'all') {
            $sql .= ' AND status = ?';
            $params[] = $status;
        }
        
        if ($search) {
            $sql .= ' AND (full_name LIKE ? OR email LIKE ?)';
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        
        $sql .= " ORDER BY $sortBy $sortOrder";
        
        try {
            $users = $db->fetchAll($sql, $params);
            
            // Get invitation count for each user
            foreach ($users as &$user) {
                $count = $db->fetchOne('SELECT COUNT(*) as count FROM invitations WHERE user_id = ?', [$user['id']]);
                $user['invitations_count'] = (int)$count['count'];
            }
            
            Response::success($users);
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
    
    public function createUser(): void
    {
        if (!$this->checkAdmin()) return;
        
        $request = new Request();
        $data = $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'full_name' => 'required|min:2',
            'phone' => '',
            'role' => 'in:user,admin',
            'status' => 'in:active,inactive,suspended'
        ]);
        
        $db = $GLOBALS['app']->getDatabase();
        
        try {
            $userData = [
                'uuid' => \App\Helpers\Uuid::generate(),
                'email' => $data['email'],
                'password' => \App\Helpers\Hash::make($data['password']),
                'full_name' => $data['full_name'],
                'phone' => $data['phone'] ?? null,
                'role' => $data['role'] ?? 'user',
                'status' => $data['status'] ?? 'active'
            ];
            
            $id = $db->insert('users', $userData);
            $user = $db->fetchOne('SELECT id, uuid, email, full_name, phone, role, status, created_at FROM users WHERE id = ?', [$id]);
            
            Response::created($user, 'User created successfully');
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    public function updateUser(string $id): void
    {
        if (!$this->checkAdmin()) return;
        
        $request = new Request();
        $data = $request->input();
        
        $db = $GLOBALS['app']->getDatabase();
        
        try {
            $updateData = [];
            
            if (isset($data['full_name'])) $updateData['full_name'] = $data['full_name'];
            if (isset($data['phone'])) $updateData['phone'] = $data['phone'];
            if (isset($data['role'])) $updateData['role'] = $data['role'];
            if (isset($data['status'])) $updateData['status'] = $data['status'];
            if (isset($data['password']) && !empty($data['password'])) {
                $updateData['password'] = \App\Helpers\Hash::make($data['password']);
            }
            
            if (!empty($updateData)) {
                $db->update('users', $updateData, 'id = ?', [$id]);
            }
            
            $user = $db->fetchOne('SELECT id, uuid, email, full_name, phone, role, status, created_at, updated_at FROM users WHERE id = ?', [$id]);
            
            Response::success($user, 'User updated successfully');
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    public function deleteUser(string $id): void
    {
        if (!$this->checkAdmin()) return;
        
        $db = $GLOBALS['app']->getDatabase();
        
        try {
            // Don't allow deleting yourself
            $auth = AuthMiddleware::handle();
            if ($auth && $auth['user_id'] == $id) {
                Response::error('Cannot delete your own account', 400);
                return;
            }
            
            $db->delete('users', 'id = ?', [$id]);
            Response::success(null, 'User deleted successfully');
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    // ============================================
    // INVITATION MANAGEMENT (ADMIN)
    // ============================================
    public function getAllInvitations(): void
    {
        if (!$this->checkAdmin()) return;
        
        $request = new Request();
        $db = $GLOBALS['app']->getDatabase();
        
        $status = $request->query('status');
        $search = $request->query('search');
        $sortBy = $request->query('sort_by', 'created_at');
        $sortOrder = $request->query('sort_order', 'desc');
        
        $sql = 'SELECT i.*, u.full_name as user_name, u.email as user_email, t.name as template_name, t.thumbnail_url as template_thumbnail 
                FROM invitations i 
                LEFT JOIN users u ON i.user_id = u.id 
                LEFT JOIN templates t ON i.template_id = t.id 
                WHERE 1=1';
        $params = [];
        
        if ($status && $status !== 'all') {
            $sql .= ' AND i.status = ?';
            $params[] = $status;
        }
        
        if ($search) {
            $sql .= ' AND (i.title LIKE ? OR i.groom_name LIKE ? OR i.bride_name LIKE ?)';
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        
        $sql .= " ORDER BY i.$sortBy $sortOrder";
        
        try {
            $invitations = $db->fetchAll($sql, $params);
            Response::success($invitations);
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
    
    public function updateInvitationStatus(string $id): void
    {
        if (!$this->checkAdmin()) return;
        
        $request = new Request();
        $data = $request->validate([
            'status' => 'required|in:draft,published,archived'
        ]);
        
        $db = $GLOBALS['app']->getDatabase();
        
        try {
            $updateData = ['status' => $data['status']];
            
            if ($data['status'] === 'published') {
                $updateData['published_at'] = date('Y-m-d H:i:s');
            }
            
            $db->update('invitations', $updateData, 'id = ?', [$id]);
            $invitation = $db->fetchOne('SELECT * FROM invitations WHERE id = ?', [$id]);
            
            Response::success($invitation, 'Invitation status updated successfully');
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    public function deleteInvitation(string $id): void
    {
        if (!$this->checkAdmin()) return;
        
        $db = $GLOBALS['app']->getDatabase();
        
        try {
            $db->delete('invitations', 'id = ?', [$id]);
            Response::success(null, 'Invitation deleted successfully');
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    // ============================================
    // TEMPLATE MANAGEMENT (ADMIN)
    // ============================================
    public function getAllTemplates(): void
    {
        if (!$this->checkAdmin()) return;
        
        $request = new Request();
        $db = $GLOBALS['app']->getDatabase();
        
        $category = $request->query('category');
        $status = $request->query('status');
        $search = $request->query('search');
        $sortBy = $request->query('sort_by', 'created_at');
        $sortOrder = $request->query('sort_order', 'desc');
        
        // Map category names to IDs
        $categoryMap = [
            'wedding' => 1,
            'birthday' => 2,
            'anniversary' => 3,
            'graduation' => 4,
            'business' => 5,
            'other' => 6
        ];
        
        $sql = 'SELECT t.*, c.name as category_name FROM templates t LEFT JOIN categories c ON t.category_id = c.id WHERE 1=1';
        $params = [];
        
        if ($category && $category !== 'all') {
            // Convert category name to ID if it's a string
            if (isset($categoryMap[$category])) {
                $sql .= ' AND t.category_id = ?';
                $params[] = $categoryMap[$category];
            } else if (is_numeric($category)) {
                $sql .= ' AND t.category_id = ?';
                $params[] = $category;
            }
        }
        
        if ($status && $status !== 'all') {
            if ($status === 'active') {
                $sql .= ' AND t.is_active = 1';
            } else if ($status === 'inactive') {
                $sql .= ' AND t.is_active = 0';
            }
        }
        
        if ($search) {
            $sql .= ' AND (t.name LIKE ? OR t.description LIKE ?)';
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        
        $sql .= " ORDER BY t.$sortBy $sortOrder";
        
        try {
            $templates = $db->fetchAll($sql, $params);
            
            // Add status field and ensure thumbnail_url is present for frontend
            foreach ($templates as &$template) {
                $template['status'] = $template['is_active'] ? 'active' : 'inactive';
                // Ensure thumbnail_url exists even if null
                if (!isset($template['thumbnail_url'])) {
                    $template['thumbnail_url'] = null;
                }
            }
            
            Response::success($templates);
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
    
    public function updateTemplateStatus(string $id): void
    {
        if (!$this->checkAdmin()) return;
        
        $request = new Request();
        $data = $request->validate([
            'status' => 'required|in:active,inactive'
        ]);
        
        $db = $GLOBALS['app']->getDatabase();
        
        try {
            $isActive = $data['status'] === 'active' ? 1 : 0;
            $db->update('templates', ['is_active' => $isActive], 'id = ?', [$id]);
            
            $template = $db->fetchOne('SELECT * FROM templates WHERE id = ?', [$id]);
            $template['status'] = $template['is_active'] ? 'active' : 'inactive';
            
            Response::success($template, 'Template status updated successfully');
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}
