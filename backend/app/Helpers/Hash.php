<?php

namespace App\Helpers;

class Hash
{
    public static function make(string $value): string
    {
        return password_hash($value, PASSWORD_BCRYPT, ['cost' => 12]);
    }
    
    public static function verify(string $value, string $hash): bool
    {
        return password_verify($value, $hash);
    }
    
    public static function needsRehash(string $hash): bool
    {
        return password_needs_rehash($hash, PASSWORD_BCRYPT, ['cost' => 12]);
    }
}
