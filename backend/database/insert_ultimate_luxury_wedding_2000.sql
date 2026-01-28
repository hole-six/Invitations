-- =====================================================
-- ULTIMATE LUXURY WEDDING TEMPLATE 2000+ LINES
-- Template thiệp cưới đỉnh cao thế giới
-- Với đầy đủ hiệu ứng, animations, và nội dung chúc
-- =====================================================

INSERT INTO templates (
    name,
    description,
    category,
    thumbnail_url,
    html_content,
    is_premium,
    price,
    created_at
) VALUES (
    'Ultimate Luxury Wedding 2000+',
    'Template thiệp cưới đỉnh cao thế giới với 2000+ dòng code, đầy đủ hiệu ứng 3D, animations, particles, parallax scrolling, và hàng trăm lời chúc ý nghĩa',
    'wedding',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} - {{groom_name}} ❤️ {{bride_name}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:wght@400;700&family=Montserrat:wght@300;400;600&family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        :root {
            --primary-gold: #D4AF37;
            --secondary-gold: #FFD700;
            --rose-gold: #B76E79;
            --champagne: #F7E7CE;
            --ivory: #FFFFF0;
            --burgundy: #800020;
            --navy: #000080;
        }
        
        body {
            font-family: "Montserrat", sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            overflow-x: hidden;
            color: #333;
        }
        
        /* ==================== LOADING SCREEN ==================== */
        .loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, var(--primary-gold) 0%, var(--rose-gold) 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 99999;
            animation: fadeOut 1s ease 3s forwards;
        }
        
        @keyframes fadeOut {
            to {
                opacity: 0;
                visibility: hidden;
            }
        }
        
        .loading-heart {
            width: 100px;
            height: 100px;
            position: relative;
            animation: heartbeat 1.5s ease-in-out infinite;
        }
        
        .loading-heart::before,
        .loading-heart::after {
            content: "";
            position: absolute;
            width: 52px;
            height: 80px;
            background: white;
            border-radius: 50px 50px 0 0;
        }
        
        .loading-heart::before {
            left: 50px;
            transform: rotate(-45deg);
            transform-origin: 0 100%;
        }
        
        .loading-heart::after {
            left: 0;
            transform: rotate(45deg);
            transform-origin: 100% 100%;
        }
        
        @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            25% { transform: scale(1.1); }
            50% { transform: scale(1); }
            75% { transform: scale(1.15); }
        }
        
        .loading-text {
            margin-top: 50px;
            font-family: "Great Vibes", cursive;
            font-size: 2.5rem;
            color: white;
            animation: fadeInOut 2s ease-in-out infinite;
        }
        
        @keyframes fadeInOut {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
        }
        
        /* ==================== PARTICLES BACKGROUND ==================== */
        .particles {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
        }
        
        .particle {
            position: absolute;
            width: 10px;
            height: 10px;
            background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
            border-radius: 50%;
            animation: float 15s infinite ease-in-out;
        }
        
        @keyframes float {
            0%, 100% {
                transform: translateY(0) translateX(0) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) translateX(100px) rotate(360deg);
                opacity: 0;
            }
        }
        
        /* ==================== HERO SECTION ==================== */
        .hero {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            background: linear-gradient(135deg, rgba(212,175,55,0.9) 0%, rgba(183,110,121,0.9) 100%),
                        url("https://images.unsplash.com/photo-1519741497674-611481863552?w=1920") center/cover;
            position: relative;
            overflow: hidden;
            padding: 2rem;
        }
        
        .hero::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.3) 100%);
            animation: pulse 4s ease-in-out infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 0.8; }
        }
        
        .hero-content {
            position: relative;
            z-index: 2;
            animation: fadeInUp 1.5s ease-out 0.5s both;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .hero-ornament {
            width: 150px;
            height: 150px;
            margin: 0 auto 2rem;
            animation: rotate360 20s linear infinite;
        }
        
        @keyframes rotate360 {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .hero-title {
            font-family: "Great Vibes", cursive;
            font-size: 5rem;
            color: white;
            text-shadow: 0 0 30px rgba(255,255,255,0.5), 0 0 60px rgba(212,175,55,0.8);
            margin-bottom: 1rem;
            animation: glow 2s ease-in-out infinite;
        }
        
        @keyframes glow {
            0%, 100% {
                text-shadow: 0 0 30px rgba(255,255,255,0.5), 0 0 60px rgba(212,175,55,0.8);
            }
            50% {
                text-shadow: 0 0 40px rgba(255,255,255,0.8), 0 0 80px rgba(212,175,55,1);
            }
        }
        
        .hero-names {
            font-family: "Playfair Display", serif;
            font-size: 4rem;
            font-weight: 700;
            color: var(--ivory);
            margin: 2rem 0;
            letter-spacing: 0.1em;
            animation: fadeInScale 1.5s ease-out 1s both;
        }
        
        @keyframes fadeInScale {
            from {
                opacity: 0;
                transform: scale(0.8);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
