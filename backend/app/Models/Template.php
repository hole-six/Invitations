<?php

namespace App\Models;

class Template
{
    public ?int $id = null;
    public ?int $category_id = null;
    public ?string $name = null;
    public ?string $slug = null;
    public ?string $description = null;
    public ?string $thumbnail_url = null;
    public ?string $template_type = 'canvas';
    public ?string $html_template = null;
    public ?array $design_data = null;
    public bool $is_premium = false;
    public bool $is_active = true;
    public int $usage_count = 0;
    public ?array $tags = null;
    public ?string $category_name = null;
    public ?string $created_at = null;
    public ?string $updated_at = null;
    
    public function __construct(array $data = [])
    {
        foreach ($data as $key => $value) {
            if (property_exists($this, $key)) {
                if ($key === 'design_data' && is_string($value)) {
                    $this->$key = json_decode($value, true);
                } elseif ($key === 'tags' && is_string($value)) {
                    $this->$key = json_decode($value, true);
                } else {
                    $this->$key = $value;
                }
            }
        }
    }
    
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'thumbnail_url' => $this->thumbnail_url,
            'template_type' => $this->template_type,
            'html_template' => $this->html_template,
            'design_data' => $this->design_data,
            'is_premium' => $this->is_premium,
            'is_active' => $this->is_active,
            'usage_count' => $this->usage_count,
            'tags' => $this->tags,
            'category_name' => $this->category_name,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
