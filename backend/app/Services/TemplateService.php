<?php

namespace App\Services;

use App\Repositories\TemplateRepository;

class TemplateService
{
    private TemplateRepository $templateRepo;
    
    public function __construct(TemplateRepository $templateRepo)
    {
        $this->templateRepo = $templateRepo;
    }
    
    public function getAll(array $filters = []): array
    {
        $templates = $this->templateRepo->findAll($filters);
        return array_map(fn($template) => $template->toArray(), $templates);
    }
    
    public function getById(int $id): array
    {
        $template = $this->templateRepo->findById($id);
        
        if (!$template) {
            throw new \Exception('Template not found');
        }
        
        return $template->toArray();
    }
    
    public function getBySlug(string $slug): array
    {
        $template = $this->templateRepo->findBySlug($slug);
        
        if (!$template) {
            throw new \Exception('Template not found');
        }
        
        return $template->toArray();
    }
    
    public function getCategories(): array
    {
        return $this->templateRepo->getCategories();
    }
    
    public function create(array $data): array
    {
        $template = $this->templateRepo->create($data);
        return $template->toArray();
    }
    
    public function update(int $id, array $data): array
    {
        $template = $this->templateRepo->findById($id);
        
        if (!$template) {
            throw new \Exception('Template not found');
        }
        
        $this->templateRepo->update($id, $data);
        
        return $this->getById($id);
    }
    
    public function delete(int $id): bool
    {
        $template = $this->templateRepo->findById($id);
        
        if (!$template) {
            throw new \Exception('Template not found');
        }
        
        return $this->templateRepo->delete($id);
    }
}
