// Ultra Premium Wedding Template with Images and Decorations
// Template đẳng cấp thế giới với hình ảnh và hiệu ứng

export const ultraPremiumTemplate = {
  id: 100,
  name: 'Ultra Premium Floral',
  slug: 'ultra-premium-floral',
  category: 'Đẳng Cấp Thế Giới',
  description: 'Template cao cấp với hình ảnh, họa tiết hoa, và hiệu ứng đẹp mắt',
  thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
  isPremium: true,
  isFeatured: true,
  designData: {
    canvas: {
      width: 450,
      height: 2520, // 4 pages
      background: 'linear-gradient(180deg, #fef9f3 0%, #fef5ed 50%, #fef9f3 100%)',
      backgroundImage: null,
      pages: 4
    },
    elements: [
      // ==================== PAGE 1: COVER ====================
      
      // Background decorative shape - Top left
      {
        id: 'deco-shape-1',
        type: 'shape',
        shapeType: 'circle',
        x: -50,
        y: -50,
        width: 200,
        height: 200,
        fill: 'rgba(236, 201, 175, 0.15)',
        opacity: 1,
        rotation: 0,
        zIndex: 0,
        visible: true,
        locked: false
      },
      
      // Background decorative shape - Bottom right
      {
        id: 'deco-shape-2',
        type: 'shape',
        shapeType: 'circle',
        x: 300,
        y: 480,
        width: 250,
        height: 250,
        fill: 'rgba(218, 165, 140, 0.12)',
        opacity: 1,
        rotation: 0,
        zIndex: 0,
        visible: true,
        locked: false
      },
      
      // Decorative floral image - Top left corner
      {
        id: 'image-floral-top-left',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200&h=200&fit=crop',
        x: 0,
        y: 0,
        width: 120,
        height: 120,
        originalWidth: 200,
        originalHeight: 200,
        rotation: 0,
        opacity: 0.3,
        visible: true,
        locked: false,
        zIndex: 1,
        flipX: false,
        flipY: false,
        borderRadius: 0,
        filter: 'brightness(1.1) saturate(0.8)'
      },
      
      // Decorative floral image - Top right corner
      {
        id: 'image-floral-top-right',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200&h=200&fit=crop',
        x: 330,
        y: 0,
        width: 120,
        height: 120,
        originalWidth: 200,
        originalHeight: 200,
        rotation: 0,
        opacity: 0.3,
        visible: true,
        locked: false,
        zIndex: 1,
        flipX: true,
        flipY: false,
        borderRadius: 0,
        filter: 'brightness(1.1) saturate(0.8)'
      },
      
      // Top decorative line
      {
        id: 'deco-line-top',
        type: 'shape',
        shapeType: 'rectangle',
        x: 50,
        y: 60,
        width: 350,
        height: 1,
        fill: '#D4A574',
        opacity: 0.4,
        rotation: 0,
        zIndex: 1,
        visible: true,
        locked: false
      },
      
      // Save the Date text
      {
        id: 'text-save-date',
        type: 'text',
        content: 'SAVE THE DATE',
        x: 25,
        y: 90,
        width: 400,
        height: 30,
        fontSize: 11,
        fontFamily: 'Montserrat',
        color: '#8B7355',
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 6,
        opacity: 0.9,
        rotation: 0,
        zIndex: 2,
        visible: true,
        locked: false
      },
      
      // Decorative flower icon top
      {
        id: 'text-flower-top',
        type: 'text',
        content: '✿',
        x: 25,
        y: 140,
        width: 400,
        height: 40,
        fontSize: 32,
        fontFamily: 'Arial',
        color: '#D4A574',
        textAlign: 'center',
        opacity: 0.8,
        rotation: 0,
        zIndex: 2,
        visible: true,
        locked: false
      },
      
      // Main couple names
      {
        id: 'text-couple-names',
        type: 'text',
        content: 'Jonathan & Juliana',
        x: 25,
        y: 200,
        width: 400,
        height: 90,
        fontSize: 52,
        fontFamily: 'Great Vibes',
        color: '#8B6F47',
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1,
        rotation: 0,
        zIndex: 3,
        visible: true,
        locked: false,
        textShadow: {
          enabled: true,
          offsetX: 0,
          offsetY: 3,
          blur: 8,
          color: '#D4A574',
          opacity: 0.3
        }
      },
      
      // Decorative line under names
      {
        id: 'deco-line-names',
        type: 'shape',
        shapeType: 'rectangle',
        x: 150,
        y: 305,
        width: 150,
        height: 2,
        fill: '#D4A574',
        opacity: 0.6,
        rotation: 0,
        zIndex: 2,
        visible: true,
        locked: false
      },
      
      // Wedding date
      {
        id: 'text-wedding-date',
        type: 'text',
        content: '23 • MAY • 2025',
        x: 25,
        y: 330,
        width: 400,
        height: 35,
        fontSize: 20,
        fontFamily: 'Montserrat',
        color: '#8B7355',
        fontWeight: '300',
        textAlign: 'center',
        letterSpacing: 5,
        opacity: 1,
        rotation: 0,
        zIndex: 3,
        visible: true,
        locked: false
      },
      
      // Decorative ornament
      {
        id: 'text-ornament-1',
        type: 'text',
        content: '◆',
        x: 25,
        y: 385,
        width: 400,
        height: 30,
        fontSize: 16,
        fontFamily: 'Arial',
        color: '#D4A574',
        textAlign: 'center',
        opacity: 0.7,
        rotation: 0,
        zIndex: 2,
        visible: true,
        locked: false
      },
      
      // Invitation text
      {
        id: 'text-invitation',
        type: 'text',
        content: 'Together with their families\ninvite you to celebrate their wedding',
        x: 25,
        y: 430,
        width: 400,
        height: 50,
        fontSize: 14,
        fontFamily: 'Playfair Display',
        color: '#8B7355',
        fontWeight: 'normal',
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 1.6,
        opacity: 0.9,
        rotation: 0,
        zIndex: 3,
        visible: true,
        locked: false
      },
      
      // Small decorative flower images
      {
        id: 'image-small-flower-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=60&h=60&fit=crop',
        x: 80,
        y: 300,
        width: 40,
        height: 40,
        originalWidth: 60,
        originalHeight: 60,
        rotation: -20,
        opacity: 0.3,
        visible: true,
        locked: false,
        zIndex: 1,
        flipX: false,
        flipY: false,
        borderRadius: 20,
        filter: 'brightness(1.3) saturate(0.6)'
      },
      
      {
        id: 'image-small-flower-2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=60&h=60&fit=crop',
        x: 330,
        y: 300,
        width: 40,
        height: 40,
        originalWidth: 60,
        originalHeight: 60,
        rotation: 20,
        opacity: 0.3,
        visible: true,
        locked: false,
        zIndex: 1,
        flipX: true,
        flipY: false,
        borderRadius: 20,
        filter: 'brightness(1.3) saturate(0.6)'
      },
      
      // Decorative corner element - bottom left
      {
        id: 'text-corner-deco-1',
        type: 'text',
        content: '❦',
        x: 30,
        y: 550,
        width: 50,
        height: 50,
        fontSize: 28,
        fontFamily: 'Arial',
        color: '#D4A574',
        textAlign: 'left',
        opacity: 0.5,
        rotation: -15,
        zIndex: 1,
        visible: true,
        locked: false
      },
      
      // Decorative corner element - bottom right
      {
        id: 'text-corner-deco-2',
        type: 'text',
        content: '❦',
        x: 370,
        y: 550,
        width: 50,
        height: 50,
        fontSize: 28,
        fontFamily: 'Arial',
        color: '#D4A574',
        textAlign: 'right',
        opacity: 0.5,
        rotation: 15,
        zIndex: 1,
        visible: true,
        locked: false
      },
      
      // Decorative floral image - Bottom left
      {
        id: 'image-floral-bottom-left',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&h=150&fit=crop',
        x: 0,
        y: 480,
        width: 100,
        height: 100,
        originalWidth: 150,
        originalHeight: 150,
        rotation: 0,
        opacity: 0.25,
        visible: true,
        locked: false,
        zIndex: 1,
        flipX: false,
        flipY: false,
        borderRadius: 0,
        filter: 'brightness(1.2) saturate(0.7)'
      },
      
      // Decorative floral image - Bottom right
      {
        id: 'image-floral-bottom-right',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&h=150&fit=crop',
        x: 350,
        y: 480,
        width: 100,
        height: 100,
        originalWidth: 150,
        originalHeight: 150,
        rotation: 0,
        opacity: 0.25,
        visible: true,
        locked: false,
        zIndex: 1,
        flipX: true,
        flipY: false,
        borderRadius: 0,
        filter: 'brightness(1.2) saturate(0.7)'
      },
      
      // ==================== PAGE 2: CEREMONY DETAILS ====================
      
      // Couple photo - Ceremony
      {
        id: 'image-couple-ceremony',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=350&h=250&fit=crop',
        x: 50,
        y: 1050,
        width: 350,
        height: 230,
        originalWidth: 350,
        originalHeight: 250,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: 2,
        flipX: false,
        flipY: false,
        borderRadius: 15,
        filter: 'brightness(1.05) contrast(1.05)',
        shadow: {
          enabled: true,
          offsetX: 0,
          offsetY: 8,
          blur: 25,
          color: '#8B6F47',
          opacity: 0.25
        },
        borderWidth: 8,
        borderColor: '#FFFFFF'
      },
      
      // Section divider
      {
        id: 'deco-divider-1',
        type: 'shape',
        shapeType: 'rectangle',
        x: 175,
        y: 680,
        width: 100,
        height: 3,
        fill: '#D4A574',
        opacity: 0.5,
        rotation: 0,
        zIndex: 1,
        visible: true,
        locked: false
      },
      
      // Ceremony title
      {
        id: 'text-ceremony-title',
        type: 'text',
        content: 'The Ceremony',
        x: 25,
        y: 720,
        width: 400,
        height: 50,
        fontSize: 38,
        fontFamily: 'Playfair Display',
        color: '#8B6F47',
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1,
        rotation: 0,
        zIndex: 2,
        visible: true,
        locked: false
      },
      
      // Decorative flower
      {
        id: 'text-flower-ceremony',
        type: 'text',
        content: '✿',
        x: 25,
        y: 780,
        width: 400,
        height: 35,
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#D4A574',
        textAlign: 'center',
        opacity: 0.7,
        rotation: 0,
        zIndex: 2,
        visible: true,
        locked: false
      },
      
      // Info box background
      {
        id: 'info-box-ceremony',
        type: 'shape',
        shapeType: 'rectangle',
        x: 50,
        y: 840,
        width: 350,
        height: 180,
        fill: '#FFFFFF',
        opacity: 0.7,
        rotation: 0,
        borderRadius: 15,
        zIndex: 1,
        visible: true,
        locked: false,
        boxShadow: '0 4px 20px rgba(139, 111, 71, 0.15)'
      },
      
      // Time icon
      {
        id: 'text-time-icon',
        type: 'text',
        content: '🕐',
        x: 25,
        y: 870,
        width: 400,
        height: 30,
        fontSize: 20,
        fontFamily: 'Arial',
        textAlign: 'center',
        opacity: 1,
        rotation: 0,
        zIndex: 3,
        visible: true,
        locked: false
      },
      
      // Time details
      {
        id: 'text-ceremony-time',
        type: 'text',
        content: 'Monday, 23rd May 2025\n10:00 AM',
        x: 25,
        y: 910,
        width: 400,
        height: 45,
        fontSize: 15,
        fontFamily: 'Montserrat',
        color: '#8B7355',
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 1.6,
        opacity: 1,
        rotation: 0,
        zIndex: 3,
        visible: true,
        locked: false
      },
      
      // Location icon
      {
        id: 'text-location-icon',
        type: 'text',
        content: '📍',
        x: 25,
        y: 965,
        width: 400,
        height: 25,
        fontSize: 18,
        fontFamily: 'Arial',
        textAlign: 'center',
        opacity: 1,
        rotation: 0,
        zIndex: 3,
        visible: true,
        locked: false
      },
      
      // Location details
      {
        id: 'text-ceremony-location',
        type: 'text',
        content: 'St. Mary Cathedral\n123 Anywhere St., Any City',
        x: 25,
        y: 995,
        width: 400,
        height: 40,
        fontSize: 13,
        fontFamily: 'Montserrat',
        color: '#8B7355',
        fontWeight: '400',
        textAlign: 'center',
        lineHeight: 1.5,
        opacity: 0.9,
        rotation: 0,
        zIndex: 3,
        visible: true,
        locked: false
      },
      
      // ==================== PAGE 3: RECEPTION DETAILS ====================
      
      // Wedding rings photo
      {
        id: 'image-rings',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=300&h=200&fit=crop',
        x: 75,
        y: 1680,
        width: 300,
        height: 200,
        originalWidth: 300,
        originalHeight: 200,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: 2,
        flipX: false,
        flipY: false,
        borderRadius: 12,
        filter: 'brightness(1.1) saturate(1.1)',
        shadow: {
          enabled: true,
          offsetX: 0,
          offsetY: 6,
          blur: 20,
          color: '#8B6F47',
          opacity: 0.2
        },
        borderWidth: 6,
        borderColor: '#FFFFFF'
      },
      
      // Decorative flowers around rings
      {
        id: 'image-flower-accent-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=80&h=80&fit=crop',
        x: 20,
        y: 1650,
        width: 60,
        height: 60,
        originalWidth: 80,
        originalHeight: 80,
        rotation: -15,
        opacity: 0.4,
        visible: true,
        locked: false,
        zIndex: 1,
        flipX: false,
        flipY: false,
        borderRadius: 30,
        filter: 'brightness(1.2) saturate(0.8)'
      },
      
      {
        id: 'image-flower-accent-2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=80&h=80&fit=crop',
        x: 370,
        y: 1850,
        width: 60,
        height: 60,
        originalWidth: 80,
        originalHeight: 80,
        rotation: 15,
        opacity: 0.4,
        visible: true,
        locked: false,
        zIndex: 1,
        flipX: true,
        flipY: false,
        borderRadius: 30,
        filter: 'brightness(1.2) saturate(0.8)'
      },
      
      // Section divider
      {
        id: 'deco-divider-2',
        type: 'shape',
        shapeType: 'rectangle',
        x: 175,
        y: 1310,
        width: 100,
        height: 3,
        fill: '#D4A574',
        opacity: 0.5,
        rotation: 0,
        zIndex: 1,
        visible: true,
        locked: false
      },
      
      // Reception title
      {
        id: 'text-reception-title',
        type: 'text',
        content: 'The Reception',
        x: 25,
        y: 1350,
        width: 400,
        height: 50,
        fontSize: 38,
        fontFamily: 'Playfair Display',
        color: '#8B6F47',
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1,
        rotation: 0,
        zIndex: 2,
        visible: true,
        locked: false
      },
      
      // Decorative rings
      {
        id: 'text-rings',
        type: 'text',
        content: '💍',
        x: 25,
        y: 1410,
        width: 400,
        height: 35,
        fontSize: 24,
        fontFamily: 'Arial',
        textAlign: 'center',
        opacity: 0.8,
        rotation: 0,
        zIndex: 2,
        visible: true,
        locked: false
      },
      
      // Info box background
      {
        id: 'info-box-reception',
        type: 'shape',
        shapeType: 'rectangle',
        x: 50,
        y: 1470,
        width: 350,
        height: 180,
        fill: '#FFFFFF',
        opacity: 0.7,
        rotation: 0,
        borderRadius: 15,
        zIndex: 1,
        visible: true,
        locked: false,
        boxShadow: '0 4px 20px rgba(139, 111, 71, 0.15)'
      },
      
      // Time icon
      {
        id: 'text-reception-time-icon',
        type: 'text',
        content: '🕐',
        x: 25,
        y: 1500,
        width: 400,
        height: 30,
        fontSize: 20,
        fontFamily: 'Arial',
        textAlign: 'center',
        opacity: 1,
        rotation: 0,
        zIndex: 3,
        visible: true,
        locked: false
      },
      
      // Time details
      {
        id: 'text-reception-time',
        type: 'text',
        content: 'Monday, 23rd May 2025\n6:00 PM - 11:00 PM',
        x: 25,
        y: 1540,
        width: 400,
        height: 45,
        fontSize: 15,
        fontFamily: 'Montserrat',
        color: '#8B7355',
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 1.6,
        opacity: 1,
        rotation: 0,
        zIndex: 3,
        visible: true,
        locked: false
      },
      
      // Location icon
      {
        id: 'text-reception-location-icon',
        type: 'text',
        content: '🏛️',
        x: 25,
        y: 1595,
        width: 400,
        height: 25,
        fontSize: 18,
        fontFamily: 'Arial',
        textAlign: 'center',
        opacity: 1,
        rotation: 0,
        zIndex: 3,
        visible: true,
        locked: false
      },
      
      // Location details
      {
        id: 'text-reception-location',
        type: 'text',
        content: 'Grand Ballroom Hotel\n456 Celebration Ave., Any City',
        x: 25,
        y: 1625,
        width: 400,
        height: 40,
        fontSize: 13,
        fontFamily: 'Montserrat',
        color: '#8B7355',
        fontWeight: '400',
        textAlign: 'center',
        lineHeight: 1.5,
        opacity: 0.9,
        rotation: 0,
        zIndex: 3,
        visible: true,
        locked: false
      },
      
      // Dress code section
      {
        id: 'text-dress-code-label',
        type: 'text',
        content: 'DRESS CODE',
        x: 25,
        y: 1720,
        width: 400,
        height: 25,
        fontSize: 11,
        fontFamily: 'Montserrat',
        color: '#8B7355',
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 4,
        opacity: 0.8,
        rotation: 0,
        zIndex: 2,
        visible: true,
        locked: false
      },
      
      {
        id: 'text-dress-code',
        type: 'text',
        content: 'Formal Attire',
        x: 25,
        y: 1750,
        width: 400,
        height: 30,
        fontSize: 16,
        fontFamily: 'Playfair Display',
        color: '#8B6F47',
        fontWeight: 'normal',
        fontStyle: 'italic',
        textAlign: 'center',
        opacity: 1,
        rotation: 0,
        zIndex: 2,
        visible: true,
        locked: false
      },
      
      // ==================== PAGE 4: THANK YOU ====================
      
      // Couple portrait photo
      {
        id: 'image-couple-portrait',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=280&h=350&fit=crop',
        x: 85,
        y: 2050,
        width: 280,
        height: 350,
        originalWidth: 280,
        originalHeight: 350,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: 2,
        flipX: false,
        flipY: false,
        borderRadius: 140,
        filter: 'brightness(1.05) contrast(1.05) saturate(1.1)',
        shadow: {
          enabled: true,
          offsetX: 0,
          offsetY: 10,
          blur: 30,
          color: '#8B6F47',
          opacity: 0.3
        },
        borderWidth: 10,
        borderColor: '#FFFFFF'
      },
      
      // Decorative floral wreath around photo
      {
        id: 'image-wreath-left',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=100&h=150&fit=crop',
        x: 20,
        y: 2150,
        width: 70,
        height: 100,
        originalWidth: 100,
        originalHeight: 150,
        rotation: -10,
        opacity: 0.35,
        visible: true,
        locked: false,
        zIndex: 1,
        flipX: false,
        flipY: false,
        borderRadius: 0,
        filter: 'brightness(1.2) saturate(0.7)'
      },
      
      {
        id: 'image-wreath-right',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=100&h=150&fit=crop',
        x: 360,
        y: 2150,
        width: 70,
        height: 100,
        originalWidth: 100,
        originalHeight: 150,
        rotation: 10,
        opacity: 0.35,
        visible: true,
        locked: false,
        zIndex: 1,
        flipX: true,
        flipY: false,
        borderRadius: 0,
        filter: 'brightness(1.2) saturate(0.7)'
      },
      
      // Background decorative shape
      {
        id: 'deco-shape-thank-1',
        type: 'shape',
        shapeType: 'circle',
        x: -80,
        y: 2100,
        width: 220,
        height: 220,
        fill: 'rgba(236, 201, 175, 0.12)',
        opacity: 1,
        rotation: 0,
        zIndex: 0,
        visible: true,
        locked: false
      },
      
      {
        id: 'deco-shape-thank-2',
        type: 'shape',
        shapeType: 'circle',
        x: 310,
        y: 2250,
        width: 200,
        height: 200,
        fill: 'rgba(218, 165, 140, 0.1)',
        opacity: 1,
        rotation: 0,
        zIndex: 0,
        visible: true,
        locked: false
      },
      
      // Decorative line
      {
        id: 'deco-line-thank',
        type: 'shape',
        shapeType: 'rectangle',
        x: 175,
        y: 1980,
        width: 100,
        height: 2,
        fill: '#D4A574',
        opacity: 0.5,
        rotation: 0,
        zIndex: 1,
        visible: true,
        locked: false
      },
      
      // Heart icon
      {
        id: 'text-heart-thank',
        type: 'text',
        content: '♥',
        x: 25,
        y: 2020,
        width: 400,
        height: 50,
        fontSize: 40,
        fontFamily: 'Arial',
        color: '#D4A574',
        textAlign: 'center',
        opacity: 0.8,
        rotation: 0,
        zIndex: 2,
        visible: true,
        locked: false
      },
      
      // Thank you title
      {
        id: 'text-thank-you',
        type: 'text',
        content: 'Thank You',
        x: 25,
        y: 2090,
        width: 400,
        height: 60,
        fontSize: 48,
        fontFamily: 'Great Vibes',
        color: '#8B6F47',
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1,
        rotation: 0,
        zIndex: 3,
        visible: true,
        locked: false,
        textShadow: {
          enabled: true,
          offsetX: 0,
          offsetY: 2,
          blur: 6,
          color: '#D4A574',
          opacity: 0.25
        }
      },
      
      // Thank you message
      {
        id: 'text-thank-message',
        type: 'text',
        content: 'Your presence at our wedding is\nthe greatest gift of all.\n\nWe look forward to celebrating\nthis special day with you.',
        x: 25,
        y: 2170,
        width: 400,
        height: 100,
        fontSize: 14,
        fontFamily: 'Playfair Display',
        color: '#8B7355',
        fontWeight: 'normal',
        textAlign: 'center',
        lineHeight: 1.8,
        opacity: 0.9,
        rotation: 0,
        zIndex: 3,
        visible: true,
        locked: false
      },
      
      // Decorative ornament
      {
        id: 'text-ornament-thank',
        type: 'text',
        content: '◆',
        x: 25,
        y: 2290,
        width: 400,
        height: 25,
        fontSize: 14,
        fontFamily: 'Arial',
        color: '#D4A574',
        textAlign: 'center',
        opacity: 0.6,
        rotation: 0,
        zIndex: 2,
        visible: true,
        locked: false
      },
      
      // Couple names signature
      {
        id: 'text-signature',
        type: 'text',
        content: 'With Love,\nJonathan & Juliana',
        x: 25,
        y: 2330,
        width: 400,
        height: 55,
        fontSize: 18,
        fontFamily: 'Great Vibes',
        color: '#8B6F47',
        fontWeight: 'normal',
        textAlign: 'center',
        lineHeight: 1.5,
        opacity: 1,
        rotation: 0,
        zIndex: 3,
        visible: true,
        locked: false
      },
      
      // Bottom decorative flowers
      {
        id: 'text-flower-bottom-1',
        type: 'text',
        content: '✿',
        x: 150,
        y: 2420,
        width: 50,
        height: 40,
        fontSize: 20,
        fontFamily: 'Arial',
        color: '#D4A574',
        textAlign: 'center',
        opacity: 0.5,
        rotation: -20,
        zIndex: 1,
        visible: true,
        locked: false
      },
      
      {
        id: 'text-flower-bottom-2',
        type: 'text',
        content: '✿',
        x: 250,
        y: 2420,
        width: 50,
        height: 40,
        fontSize: 20,
        fontFamily: 'Arial',
        color: '#D4A574',
        textAlign: 'center',
        opacity: 0.5,
        rotation: 20,
        zIndex: 1,
        visible: true,
        locked: false
      }
    ]
  }
};

export default ultraPremiumTemplate;
