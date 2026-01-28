// Modern Photo Wedding Template
// Template hiện đại với nhiều ảnh cặp đôi

export const modernPhotoTemplate = {
  id: 101,
  name: 'Modern Photo Gallery',
  slug: 'modern-photo-gallery',
  category: 'Hiện Đại',
  description: 'Template hiện đại với gallery ảnh cặp đôi đẹp mắt',
  thumbnail: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400',
  isPremium: true,
  isFeatured: true,
  designData: {
    canvas: {
      width: 450,
      height: 1890, // 3 pages
      background: '#FFFFFF',
      backgroundImage: null,
      pages: 3
    },
    elements: [
      // ==================== PAGE 1: HERO WITH PHOTO ====================
      
      // Large hero photo
      {
        id: 'image-hero',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=450&h=600&fit=crop',
        x: 0,
        y: 0,
        width: 450,
        height: 600,
        originalWidth: 450,
        originalHeight: 600,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: 0,
        flipX: false,
        flipY: false,
        borderRadius: 0,
        filter: 'brightness(0.85) contrast(1.1)'
      },
      
      // Dark overlay
      {
        id: 'overlay-hero',
        type: 'shape',
        shapeType: 'rectangle',
        x: 0,
        y: 0,
        width: 450,
        height: 600,
        fill: 'rgba(0, 0, 0, 0.4)',
        opacity: 1,
        rotation: 0,
        zIndex: 1,
        visible: true,
        locked: false
      },
      
      // Save the date badge
      {
        id: 'badge-save-date',
        type: 'shape',
        shapeType: 'rectangle',
        x: 150,
        y: 80,
        width: 150,
        height: 40,
        fill: 'rgba(255, 255, 255, 0.15)',
        opacity: 1,
        rotation: 0,
        borderRadius: 20,
        zIndex: 2,
        visible: true,
        locked: false
      },
      
      {
        id: 'text-save-date',
        type: 'text',
        content: 'SAVE THE DATE',
        x: 25,
        y: 90,
        width: 400,
        height: 25,
        fontSize: 11,
        fontFamily: 'Montserrat',
        color: '#FFFFFF',
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 4,
        opacity: 1,
        rotation: 0,
        zIndex: 3,
        visible: true,
        locked: false
      },
      
      // Couple names
      {
        id: 'text-couple-names',
        type: 'text',
        content: 'DAVID & EMMA',
        x: 25,
        y: 250,
        width: 400,
        height: 70,
        fontSize: 48,
        fontFamily: 'Montserrat',
        color: '#FFFFFF',
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: 2,
        opacity: 1,
        rotation: 0,
        zIndex: 3,
        visible: true,
        locked: false,
        textShadow: {
          enabled: true,
          offsetX: 0,
          offsetY: 4,
          blur: 12,
          color: '#000000',
          opacity: 0.5
        }
      },
      
      // Date
      {
        id: 'text-date',
        type: 'text',
        content: '15.06.2025',
        x: 25,
        y: 340,
        width: 400,
        height: 40,
        fontSize: 32,
        fontFamily: 'Montserrat',
        color: '#FFFFFF',
        fontWeight: '300',
        textAlign: 'center',
        letterSpacing: 3,
        opacity: 1,
        rotation: 0,
        zIndex: 3,
        visible: true,
        locked: false
      },
      
      // Location
      {
        id: 'text-location-hero',
        type: 'text',
        content: 'NEW YORK CITY',
        x: 25,
        y: 400,
        width: 400,
        height: 30,
        fontSize: 14,
        fontFamily: 'Montserrat',
        color: '#FFFFFF',
        fontWeight: '400',
        textAlign: 'center',
        letterSpacing: 6,
        opacity: 0.9,
        rotation: 0,
        zIndex: 3,
        visible: true,
        locked: false
      },
      
      // Scroll indicator
      {
        id: 'text-scroll',
        type: 'text',
        content: '↓',
        x: 25,
        y: 540,
        width: 400,
        height: 40,
        fontSize: 32,
        fontFamily: 'Arial',
        color: '#FFFFFF',
        textAlign: 'center',
        opacity: 0.7,
        rotation: 0,
        zIndex: 3,
        visible: true,
        locked: false
      },
      
      // ==================== PAGE 2: PHOTO GRID ====================
      
      // Section title
      {
        id: 'text-our-story',
        type: 'text',
        content: 'Our Story',
        x: 25,
        y: 660,
        width: 400,
        height: 50,
        fontSize: 36,
        fontFamily: 'Playfair Display',
        color: '#2C3E50',
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1,
        rotation: 0,
        zIndex: 2,
        visible: true,
        locked: false
      },
      
      // Photo 1 - Left
      {
        id: 'image-story-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=200&h=250&fit=crop',
        x: 25,
        y: 740,
        width: 200,
        height: 250,
        originalWidth: 200,
        originalHeight: 250,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: 1,
        flipX: false,
        flipY: false,
        borderRadius: 10,
        filter: 'brightness(1.05) contrast(1.05)',
        shadow: {
          enabled: true,
          offsetX: 0,
          offsetY: 6,
          blur: 20,
          color: '#000000',
          opacity: 0.15
        }
      },
      
      // Photo 2 - Right
      {
        id: 'image-story-2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=200&h=250&fit=crop',
        x: 225,
        y: 740,
        width: 200,
        height: 250,
        originalWidth: 200,
        originalHeight: 250,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: 1,
        flipX: false,
        flipY: false,
        borderRadius: 10,
        filter: 'brightness(1.05) contrast(1.05)',
        shadow: {
          enabled: true,
          offsetX: 0,
          offsetY: 6,
          blur: 20,
          color: '#000000',
          opacity: 0.15
        }
      },
      
      // Photo 3 - Full width
      {
        id: 'image-story-3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&h=200&fit=crop',
        x: 25,
        y: 1010,
        width: 400,
        height: 200,
        originalWidth: 400,
        originalHeight: 200,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: 1,
        flipX: false,
        flipY: false,
        borderRadius: 10,
        filter: 'brightness(1.05) contrast(1.05)',
        shadow: {
          enabled: true,
          offsetX: 0,
          offsetY: 6,
          blur: 20,
          color: '#000000',
          opacity: 0.15
        }
      },
      
      // Story text
      {
        id: 'text-story',
        type: 'text',
        content: 'We met in the spring of 2020.\nIt was love at first sight.\nNow we\'re ready to say "I do".',
        x: 25,
        y: 1230,
        width: 400,
        height: 70,
        fontSize: 14,
        fontFamily: 'Montserrat',
        color: '#7F8C8D',
        fontWeight: '400',
        textAlign: 'center',
        lineHeight: 1.8,
        opacity: 1,
        rotation: 0,
        zIndex: 2,
        visible: true,
        locked: false
      },
      
      // ==================== PAGE 3: DETAILS ====================
      
      // Details title
      {
        id: 'text-details-title',
        type: 'text',
        content: 'Wedding Details',
        x: 25,
        y: 1380,
        width: 400,
        height: 50,
        fontSize: 36,
        fontFamily: 'Playfair Display',
        color: '#2C3E50',
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1,
        rotation: 0,
        zIndex: 2,
        visible: true,
        locked: false
      },
      
      // Venue photo
      {
        id: 'image-venue',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1519167758481-83f29da8c2b6?w=400&h=250&fit=crop',
        x: 25,
        y: 1460,
        width: 400,
        height: 250,
        originalWidth: 400,
        originalHeight: 250,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: 1,
        flipX: false,
        flipY: false,
        borderRadius: 15,
        filter: 'brightness(1.05)',
        shadow: {
          enabled: true,
          offsetX: 0,
          offsetY: 8,
          blur: 25,
          color: '#000000',
          opacity: 0.2
        }
      },
      
      // Details box
      {
        id: 'details-box',
        type: 'shape',
        shapeType: 'rectangle',
        x: 50,
        y: 1730,
        width: 350,
        height: 120,
        fill: '#ECF0F1',
        opacity: 1,
        rotation: 0,
        borderRadius: 12,
        zIndex: 1,
        visible: true,
        locked: false
      },
      
      {
        id: 'text-details-info',
        type: 'text',
        content: '📅 June 15, 2025 • 4:00 PM\n📍 The Grand Hotel\n123 Park Avenue, New York',
        x: 25,
        y: 1755,
        width: 400,
        height: 70,
        fontSize: 14,
        fontFamily: 'Montserrat',
        color: '#2C3E50',
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 1.8,
        opacity: 1,
        rotation: 0,
        zIndex: 2,
        visible: true,
        locked: false
      }
    ]
  }
};

export default modernPhotoTemplate;
