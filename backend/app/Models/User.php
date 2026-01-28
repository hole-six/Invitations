<?php

namespace App\Models;

class User
{
    public ?int $id = null;
    public ?string $email = null;
    public ?string $password_hash = null;
    public ?string $full_name = null;
    public ?string $phone = null;
    public ?string $avatar_url = null;
    public string $role = 'user';
    public string $status = 'active';
    public ?string $email_verified_at = null;
    public ?string $last_login_at = null;
    public ?string $last_login_ip = null;
    public ?string $created_at = null;
    public ?string $updated_at = null;
    
    public function __construct(array $data = [])
    {
        foreach ($data as $key => $value) {
            // Map database 'password' field to 'password_hash' property
            if ($key === 'password') {
                $this->password_hash = $value;
            } elseif (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }
    }
    
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'full_name' => $this->full_name,
            'phone' => $this->phone,
            'avatar_url' => $this->avatar_url,
            'role' => $this->role,
            'status' => $this->status,
            'email_verified_at' => $this->email_verified_at,
            'last_login_at' => $this->last_login_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
    
    public function toPublicArray(): array
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'avatar_url' => $this->avatar_url,
        ];
    }
}
