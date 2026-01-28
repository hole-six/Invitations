<?php

namespace App\Models;

class Invitation
{
    public ?int $id = null;
    public ?string $uuid = null;
    public ?int $user_id = null;
    public ?int $template_id = null;
    public ?string $template_thumbnail = null; // From JOIN with templates table
    public ?string $title = null;
    public ?string $slug = null;
    public ?string $event_date = null;
    public ?string $event_time = null;
    public ?string $event_location = null;
    public ?string $event_address = null;
    public ?string $groom_name = null;
    public ?string $bride_name = null;
    public ?string $template_type = 'canvas';
    public ?string $html_content = null;
    public ?array $design_data = null;
    public ?string $image_data = null;
    public ?string $custom_field_data = null;
    public string $status = 'draft';
    public string $visibility = 'private';
    public ?string $password = null;
    public int $views_count = 0;
    public ?string $music_url = null;
    public bool $music_autoplay = false;
    public ?string $published_at = null;
    public ?string $created_at = null;
    public ?string $updated_at = null;
    
    public function __construct(array $data = [])
    {
        foreach ($data as $key => $value) {
            if (property_exists($this, $key)) {
                if ($key === 'design_data' && is_string($value)) {
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
            'uuid' => $this->uuid,
            'user_id' => $this->user_id,
            'template_id' => $this->template_id,
            'template_thumbnail' => $this->template_thumbnail,
            'title' => $this->title,
            'slug' => $this->slug,
            'event_date' => $this->event_date,
            'event_time' => $this->event_time,
            'event_location' => $this->event_location,
            'event_address' => $this->event_address,
            'groom_name' => $this->groom_name,
            'bride_name' => $this->bride_name,
            'template_type' => $this->template_type,
            'html_content' => $this->html_content,
            'design_data' => $this->design_data,
            'image_data' => $this->image_data,
            'custom_field_data' => $this->custom_field_data,
            'status' => $this->status,
            'visibility' => $this->visibility,
            'views_count' => $this->views_count,
            'music_url' => $this->music_url,
            'music_autoplay' => $this->music_autoplay,
            'published_at' => $this->published_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
