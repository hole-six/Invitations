<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;

class TemplateController
{
    public function index(): void
    {
        $request = new Request();
        $db = $GLOBALS['app']->getDatabase();
        
        $category = $request->query('category');
        $isPremium = $request->query('premium');
        $search = $request->query('search');
        $page = (int)$request->query('page', 1);
        $perPage = (int)$request->query('per_page', 20);
        
        $sql = 'SELECT * FROM templates WHERE is_active = 1';
        $params = [];
        
        if ($category) {
            $sql .= ' AND category_id = ?';
            $params[] = $category;
        }
        
        if ($isPremium !== null) {
            $sql .= ' AND is_premium = ?';
            $params[] = $isPremium === 'true' ? 1 : 0;
        }
        
        if ($search) {
            $sql .= ' AND (name LIKE ? OR description LIKE ?)';
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        
        // Count total
        $countSql = str_replace('SELECT *', 'SELECT COUNT(*) as total', $sql);
        $total = $db->fetchOne($countSql, $params)['total'];
        
        // Get paginated results
        $offset = ($page - 1) * $perPage;
        $sql .= ' ORDER BY is_premium DESC, created_at DESC LIMIT ? OFFSET ?';
        $params[] = $perPage;
        $params[] = $offset;
        
        $templates = $db->fetchAll($sql, $params);
        
        Response::paginated($templates, (int)$total, $page, $perPage);
    }
    
    public function categories(): void
    {
        $db = $GLOBALS['app']->getDatabase();
        
        $categories = $db->fetchAll(
            'SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order, name'
        );
        
        Response::success($categories);
    }
    
    public function show(string $id): void
    {
        $db = $GLOBALS['app']->getDatabase();
        
        $template = $db->fetchOne('SELECT * FROM templates WHERE id = ? AND is_active = 1', [$id]);
        
        if (!$template) {
            Response::notFound('Template not found');
            return;
        }
        
        // If html_template is a file path, load the content
        if (isset($template['html_template']) && strpos($template['html_template'], 'storage/templates/') === 0) {
            $filepath = __DIR__ . '/../../' . $template['html_template'];
            if (file_exists($filepath)) {
                $template['html_content'] = file_get_contents($filepath);
            }
        } else if (isset($template['html_template'])) {
            // If stored in DB, use it directly
            $template['html_content'] = $template['html_template'];
        }
        
        // Increment usage count if column exists
        try {
            $db->query('UPDATE templates SET usage_count = usage_count + 1 WHERE id = ?', [$id]);
        } catch (\Exception $e) {
            // Ignore if column doesn't exist
        }
        
        Response::success($template);
    }
    
    public function store(): void
    {
        // Admin only - TODO: Add admin middleware
        $request = new Request();
        
        $data = $request->validate([
            'name' => 'required|min:3',
            'slug' => 'required',
            'description' => '',
            'thumbnail_url' => '',
            'category_id' => 'required|integer',
            'is_premium' => '',
            'html_content' => '',
            'design_data' => '',
            'tags' => '',
        ]);
        
        $db = $GLOBALS['app']->getDatabase();
        
        // Generate UUID
        $data['uuid'] = \App\Helpers\Uuid::generate();
        
        // Convert is_premium to boolean
        $data['is_premium'] = isset($data['is_premium']) && $data['is_premium'] ? 1 : 0;
        
        // Convert tags array to JSON if provided
        if (isset($data['tags']) && is_array($data['tags'])) {
            $data['tags'] = json_encode($data['tags']);
        }
        
        // Handle large HTML content - store as file if too large
        $htmlContent = $data['html_content'] ?? '';
        $htmlContentSize = strlen($htmlContent);
        $maxDbSize = 1048576; // 1MB - store in DB if smaller, as file if larger
        
        if ($htmlContentSize > $maxDbSize && !empty($htmlContent)) {
            // Store HTML as file
            $storageDir = __DIR__ . '/../../storage/templates';
            if (!is_dir($storageDir)) {
                mkdir($storageDir, 0755, true);
            }
            
            $filename = $data['uuid'] . '.html';
            $filepath = $storageDir . '/' . $filename;
            
            if (file_put_contents($filepath, $htmlContent) !== false) {
                // Store file path instead of content
                $data['html_template'] = 'storage/templates/' . $filename;
                unset($data['html_content']); // Remove from DB insert
                error_log("Large HTML template saved to file: $filename (" . round($htmlContentSize/1024/1024, 2) . " MB)");
            } else {
                Response::error('Failed to save HTML template file', 500);
                return;
            }
        } else {
            // Store in database (rename field)
            if (isset($data['html_content'])) {
                $data['html_template'] = $data['html_content'];
                unset($data['html_content']);
            }
        }
        
        // Convert design_data to JSON if provided
        if (isset($data['design_data']) && is_array($data['design_data'])) {
            $data['design_data'] = json_encode($data['design_data']);
        }
        
        // Set default values
        $data['is_active'] = 1;
        $data['usage_count'] = 0;
        
        try {
            $id = $db->insert('templates', $data);
            $template = $db->fetchOne('SELECT * FROM templates WHERE id = ?', [$id]);
            
            Response::created($template, 'Template created successfully');
        } catch (\Exception $e) {
            error_log('Template creation error: ' . $e->getMessage());
            Response::error('Failed to create template: ' . $e->getMessage(), 500);
        }
    }
    
    public function update(string $id): void
    {
        // Admin only - TODO: Add admin middleware
        $request = new Request();
        $data = $request->input();
        
        if (isset($data['design_data']) && is_array($data['design_data'])) {
            $data['design_data'] = json_encode($data['design_data']);
        }
        
        $db = $GLOBALS['app']->getDatabase();
        $db->update('templates', $data, 'id = ?', [$id]);
        
        $template = $db->fetchOne('SELECT * FROM templates WHERE id = ?', [$id]);
        Response::success($template, 'Template updated successfully');
    }
    
    public function destroy(string $id): void
    {
        // Admin only - TODO: Add admin middleware
        $db = $GLOBALS['app']->getDatabase();
        $db->delete('templates', 'id = ?', [$id]);
        
        Response::success(null, 'Template deleted successfully');
    }
    
    private function generateSlug(string $name): string
    {
        $slug = strtolower($name);
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
        return trim($slug, '-');
    }
}
