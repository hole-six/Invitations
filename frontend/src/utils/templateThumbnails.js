// Generate thumbnail preview for templates
export const generateTemplateThumbnail = (template) => {
  // Return default thumbnail based on template style
  const thumbnails = {
    'elegant-rose-gold': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=600&fit=crop',
    'modern-minimalist': 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&h=600&fit=crop',
    'romantic-floral': 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=600&fit=crop',
    'classic-vintage': 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=600&fit=crop',
    'luxury-gold': 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=600&fit=crop',
    'garden-spring': 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=600&fit=crop'
  }
  
  return thumbnails[template.slug] || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=600&fit=crop'
}

export default generateTemplateThumbnail
