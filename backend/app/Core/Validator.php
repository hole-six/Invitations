<?php

namespace App\Core;

class Validator
{
    private array $data;
    private array $rules;
    private array $errors = [];
    
    public function __construct(array $data, array $rules)
    {
        $this->data = $data;
        $this->rules = $rules;
    }
    
    public function validate(): array
    {
        foreach ($this->rules as $field => $rules) {
            $ruleList = explode('|', $rules);
            
            foreach ($ruleList as $rule) {
                $this->applyRule($field, $rule);
            }
        }
        
        if (!empty($this->errors)) {
            Response::validationError($this->errors);
        }
        
        return $this->data;
    }
    
    private function applyRule(string $field, string $rule): void
    {
        $value = $this->data[$field] ?? null;
        
        // Parse rule with parameters (e.g., "min:3")
        $parts = explode(':', $rule);
        $ruleName = $parts[0];
        $params = $parts[1] ?? null;
        
        switch ($ruleName) {
            case 'required':
                if (empty($value) && $value !== '0') {
                    $this->addError($field, "$field is required");
                }
                break;
                
            case 'email':
                if ($value && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $this->addError($field, "$field must be a valid email");
                }
                break;
                
            case 'min':
                if ($value && strlen($value) < (int)$params) {
                    $this->addError($field, "$field must be at least $params characters");
                }
                break;
                
            case 'max':
                if ($value && strlen($value) > (int)$params) {
                    $this->addError($field, "$field must not exceed $params characters");
                }
                break;
                
            case 'numeric':
                if ($value && !is_numeric($value)) {
                    $this->addError($field, "$field must be numeric");
                }
                break;
                
            case 'integer':
                if ($value && !filter_var($value, FILTER_VALIDATE_INT)) {
                    $this->addError($field, "$field must be an integer");
                }
                break;
                
            case 'url':
                if ($value && !filter_var($value, FILTER_VALIDATE_URL)) {
                    $this->addError($field, "$field must be a valid URL");
                }
                break;
                
            case 'in':
                $allowed = explode(',', $params);
                if ($value && !in_array($value, $allowed)) {
                    $this->addError($field, "$field must be one of: " . implode(', ', $allowed));
                }
                break;
                
            case 'unique':
                // Format: unique:table,column
                [$table, $column] = explode(',', $params);
                if ($value && $this->checkUnique($table, $column, $value)) {
                    $this->addError($field, "$field already exists");
                }
                break;
        }
    }
    
    private function checkUnique(string $table, string $column, $value): bool
    {
        $db = $GLOBALS['app']->getDatabase();
        $result = $db->fetchOne(
            "SELECT COUNT(*) as count FROM {$table} WHERE {$column} = ?",
            [$value]
        );
        return $result['count'] > 0;
    }
    
    private function addError(string $field, string $message): void
    {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        $this->errors[$field][] = $message;
    }
}
