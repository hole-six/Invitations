-- Insert MEGA EFFECTS Passport Template - CỰC ĐỈNH!
USE `wedding_invitations`;

INSERT INTO `templates` (
    `uuid`, `name`, `slug`, `description`, `thumbnail_url`, `category_id`,
    `is_premium`, `html_content`, `design_data`, `tags`, `is_active`, `created_at`, `updated_at`
) VALUES (
    UUID(),
    'Mega Effects Passport - Ultimate',
    'mega-effects-passport',
    'Thiệp cưới với SIÊU NHIỀU hiệu ứng: particles, parallax, 3D, glow, confetti, animations!',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    1,
    1,
    '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Great+Vibes&family=Montserrat:wght@300;400;600;700;800&family=Playfair+Display:wght@400;700&family=Cormorant+Garamond:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: "Montserrat", sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            overflow-x: hidden;
            position: relative;
        }
        
        /* PARTICLES BACKGROUND */
        .particles {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        }
        .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255,255,255,0.8);
            border-radius: 50%;
            animation: float-particle 20s infinite;
        }
        @keyframes float-particle {
            0% { transform: translateY(100vh) translateX(0) scale(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh) translateX(100px) scale(1); opacity: 0; }
        }
        
        /* MAIN CONTAINER */
        .container {
            max-width: 700px;
            margin: 50px auto;
            position: relative;
            z-index: 10;
            perspective: 1000px;
        }
        
        /* PASSPORT CARD WITH 3D EFFECT */
        .passport-card {
            background: #fdfbf7;
            border-radius: 20px;
            box-shadow: 
                0 50px 100px rgba(0,0,0,0.3),
                0 0 0 1px rgba(255,255,255,0.1),
                inset 0 0 100px rgba(212,175,55,0.1);
            transform-style: preserve-3d;
            transition: transform 0.6s;
            position: relative;
            overflow: hidden;
        }
        .passport-card:hover {
            transform: rotateY(5deg) rotateX(5deg);
        }
        
        /* ANIMATED GRADIENT BORDER */
        .passport-card::before {
            content: "";
            position: absolute;
            inset: -2px;
            background: linear-gradient(45deg, #d4af37, #fcf6ba, #b38728, #fbf5b7, #aa771c);
            border-radius: 20px;
            z-index: -1;
            animation: rotate-gradient 4s linear infinite;
            background-size: 400% 400%;
        }
        @keyframes rotate-gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        /* GLOWING HEADER */
        .header {
            background: linear-gradient(135deg, #1a2639 0%, #2c3e50 100%);
            padding: 80px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: "";
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 70%);
            animation: pulse-glow 3s ease-in-out infinite;
        }
        @keyframes pulse-glow {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.2); opacity: 0.8; }
        }
        
        .title {
            font-family: "Cinzel", serif;
            font-size: 56px;
            font-weight: 700;
            background: linear-gradient(45deg, #d4af37, #fcf6ba, #d4af37);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            text-shadow: 0 0 30px rgba(212,175,55,0.5);
            animation: shimmer 3s ease-in-out infinite;
            position: relative;
            z-index: 1;
            letter-spacing: 6px;
        }
        @keyframes shimmer {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.3); }
        }
        
        .subtitle {
            color: rgba(255,255,255,0.9);
            font-size: 16px;
            letter-spacing: 4px;
            margin-top: 20px;
            position: relative;
            z-index: 1;
            animation: fade-in-up 1s ease-out;
        }
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* FLOATING HEARTS */
        .hearts {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            pointer-events: none;
        }
        .heart {
            position: absolute;
            font-size: 20px;
            animation: float-heart 15s infinite;
            opacity: 0;
        }
        @keyframes float-heart {
            0% { transform: translateY(100%) rotate(0deg); opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { transform: translateY(-100%) rotate(360deg); opacity: 0; }
        }
        
        /* PHOTO SECTION WITH PARALLAX */
        .photo-section {
            padding: 60px 40px;
            background: white;
            position: relative;
        }
        .photo-wrapper {
            position: relative;
            margin-bottom: 40px;
            transform-style: preserve-3d;
        }
        .couple-photo {
            width: 100%;
            height: 500px;
            object-fit: cover;
            border-radius: 10px;
            box-shadow: 
                0 20px 60px rgba(0,0,0,0.3),
                0 0 0 10px rgba(212,175,55,0.1);
            transition: transform 0.3s;
            animation: photo-entrance 1s ease-out;
        }
        @keyframes photo-entrance {
            from { opacity: 0; transform: scale(0.8) rotateY(-20deg); }
            to { opacity: 1; transform: scale(1) rotateY(0); }
        }
        .couple-photo:hover {
            transform: scale(1.05) translateZ(20px);
        }
        
        /* SPARKLES OVERLAY */
        .sparkles {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }
        .sparkle {
            position: absolute;
            width: 6px;
            height: 6px;
            background: #d4af37;
            border-radius: 50%;
            animation: sparkle-twinkle 2s infinite;
        }
        @keyframes sparkle-twinkle {
            0%, 100% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
        }
        
        /* NAMES WITH GLOW */
        .names {
            font-family: "Great Vibes", cursive;
            font-size: 64px;
            text-align: center;
            background: linear-gradient(45deg, #1a2639, #2c3e50, #1a2639);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            margin: 40px 0;
            animation: text-glow 2s ease-in-out infinite;
            text-shadow: 0 0 20px rgba(26,38,57,0.3);
        }
        @keyframes text-glow {
            0%, 100% { filter: drop-shadow(0 0 10px rgba(26,38,57,0.5)); }
            50% { filter: drop-shadow(0 0 20px rgba(26,38,57,0.8)); }
        }
        
        /* DATA CARDS WITH HOVER EFFECTS */
        .data-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
            margin: 50px 0;
        }
        .data-card {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
        }
        .data-card::before {
            content: "";
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent);
            transition: left 0.5s;
        }
        .data-card:hover::before {
            left: 100%;
        }
        .data-card:hover {
            transform: translateY(-10px) scale(1.05);
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        .data-label {
            font-size: 12px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 10px;
        }
        .data-value {
            font-size: 24px;
            font-weight: 700;
            color: #1a2639;
        }
        
        /* ROTATING STAMP */
        .stamp {
            position: absolute;
            top: 60px;
            right: 40px;
            width: 140px;
            height: 140px;
            border: 5px double #c0392b;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(-15deg);
            animation: stamp-rotate 10s linear infinite;
            box-shadow: 0 0 20px rgba(192,57,43,0.5);
        }
        @keyframes stamp-rotate {
            0% { transform: rotate(-15deg); }
            50% { transform: rotate(-5deg); }
            100% { transform: rotate(-15deg); }
        }
        .stamp-text {
            font-family: "Courier Prime", monospace;
            font-size: 16px;
            font-weight: bold;
            color: #c0392b;
            text-align: center;
            line-height: 1.3;
        }
        
        /* BOARDING PASS WITH SLIDE-IN */
        .boarding-pass {
            background: white;
            margin: 40px;
            padding: 50px;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            animation: slide-in-right 1s ease-out;
            position: relative;
        }
        @keyframes slide-in-right {
            from { opacity: 0; transform: translateX(100px); }
            to { opacity: 1; transform: translateX(0); }
        }
        
        .boarding-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 3px dashed #ccc;
        }
        .airline {
            font-size: 24px;
            font-weight: 800;
            color: #1a2639;
            letter-spacing: 3px;
        }
        .class-badge {
            background: linear-gradient(45deg, #d4af37, #fcf6ba);
            color: #1a2639;
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 700;
            box-shadow: 0 5px 15px rgba(212,175,55,0.4);
            animation: badge-pulse 2s ease-in-out infinite;
        }
        @keyframes badge-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        .flight-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
            margin: 40px 0;
        }
        .flight-item {
            text-align: center;
        }
        .flight-label {
            font-size: 12px;
            color: #888;
            margin-bottom: 10px;
        }
        .flight-value {
            font-size: 32px;
            font-weight: 700;
            color: #1a2639;
            animation: count-up 2s ease-out;
        }
        @keyframes count-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* ANIMATED BARCODE */
        .barcode {
            text-align: center;
            font-size: 50px;
            letter-spacing: 4px;
            color: #1a2639;
            margin-top: 40px;
            animation: barcode-scan 3s ease-in-out infinite;
        }
        @keyframes barcode-scan {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        /* FOOTER WITH CONFETTI */
        .footer {
            text-align: center;
            padding: 80px 40px;
            background: linear-gradient(135deg, #fdfbf7 0%, #f8f9fa 100%);
            position: relative;
            overflow: hidden;
        }
        .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            background: #d4af37;
            animation: confetti-fall 5s linear infinite;
        }
        @keyframes confetti-fall {
            0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        
        .rsvp-button {
            display: inline-block;
            padding: 20px 50px;
            background: linear-gradient(45deg, #1a2639, #2c3e50);
            color: white;
            font-size: 18px;
            font-weight: 700;
            border-radius: 50px;
            text-decoration: none;
            box-shadow: 0 10px 30px rgba(26,38,57,0.3);
            transition: all 0.3s;
            animation: button-float 3s ease-in-out infinite;
            position: relative;
            overflow: hidden;
        }
        .rsvp-button::before {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255,255,255,0.3);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
        }
        .rsvp-button:hover::before {
            width: 300px;
            height: 300px;
        }
        .rsvp-button:hover {
            transform: translateY(-5px) scale(1.05);
            box-shadow: 0 20px 40px rgba(26,38,57,0.4);
        }
        @keyframes button-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        .footer-message {
            font-family: "Great Vibes", cursive;
            font-size: 36px;
            color: #1a2639;
            margin-top: 40px;
            animation: fade-in 2s ease-out;
        }
        
        /* RESPONSIVE */
        @media (max-width: 768px) {
            .container { margin: 20px; }
            .title { font-size: 36px; }
            .names { font-size: 42px; }
            .couple-photo { height: 350px; }
            .data-grid, .flight-grid { grid-template-columns: 1fr; }
            .boarding-pass { margin: 20px; padding: 30px; }
        }
    </style>
</head>
<body>
    <!-- PARTICLES -->
    <div class="particles" id="particles"></div>
    
    <div class="container">
        <div class="passport-card">
            <!-- HEADER -->
            <div class="header">
                <div class="hearts" id="hearts"></div>
                <h1 class="title">PASSPORT<br>TO LOVE</h1>
                <p class="subtitle">WEDDING INVITATION</p>
            </div>
            
            <!-- PHOTO SECTION -->
            <div class="photo-section">
                <div class="photo-wrapper">
                    <img src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80" 
                         alt="Couple" 
                         class="couple-photo"
                         data-editable="couple_photo">
                    <div class="sparkles" id="sparkles"></div>
                </div>
                
                <div class="names">
                    {{groom_name}} & {{bride_name}}
                </div>
                
                <div class="data-grid">
                    <div class="data-card">
                        <div class="data-label">Date of Happiness</div>
                        <div class="data-value">{{event_date}}</div>
                    </div>
                    <div class="data-card">
                        <div class="data-label">Time</div>
                        <div class="data-value">{{event_time}}</div>
                    </div>
                    <div class="data-card">
                        <div class="data-label">Place of Union</div>
                        <div class="data-value">{{event_location}}</div>
                    </div>
                    <div class="data-card">
                        <div class="data-label">Address</div>
                        <div class="data-value">{{event_address}}</div>
                    </div>
                </div>
                
                <div class="stamp">
                    <div class="stamp-text">APPROVED<br>LOVE</div>
                </div>
            </div>
            
            <!-- BOARDING PASS -->
            <div class="boarding-pass">
                <div class="boarding-header">
                    <div class="airline">AIRLINES OF LOVE</div>
                    <div class="class-badge">FIRST CLASS</div>
                </div>
                
                <div class="flight-grid">
                    <div class="flight-item">
                        <div class="flight-label">GATE</div>
                        <div class="flight-value">01</div>
                    </div>
                    <div class="flight-item">
                        <div class="flight-label">TIME</div>
                        <div class="flight-value">{{event_time}}</div>
                    </div>
                    <div class="flight-item">
                        <div class="flight-label">SEAT</div>
                        <div class="flight-value">VIP</div>
                    </div>
                </div>
                
                <div class="barcode">|| ||| || ||| || |||</div>
            </div>
            
            <!-- FOOTER -->
            <div class="footer">
                <div id="confetti"></div>
                <a href="#" class="rsvp-button">✈ XÁC NHẬN THAM DỰ</a>
                <div class="footer-message">Rất hân hạnh được đón tiếp!</div>
            </div>
        </div>
    </div>
    
    <script>
        // CREATE PARTICLES
        const particlesContainer = document.getElementById("particles");
        for(let i = 0; i < 50; i++) {
            const particle = document.createElement("div");
            particle.className = "particle";
            particle.style.left = Math.random() * 100 + "%";
            particle.style.animationDelay = Math.random() * 20 + "s";
            particle.style.animationDuration = (15 + Math.random() * 10) + "s";
            particlesContainer.appendChild(particle);
        }
        
        // CREATE FLOATING HEARTS
        const heartsContainer = document.getElementById("hearts");
        const heartSymbols = ["❤", "💕", "💖", "💗", "💝"];
        for(let i = 0; i < 20; i++) {
            const heart = document.createElement("div");
            heart.className = "heart";
            heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
            heart.style.left = Math.random() * 100 + "%";
            heart.style.animationDelay = Math.random() * 15 + "s";
            heart.style.animationDuration = (10 + Math.random() * 10) + "s";
            heartsContainer.appendChild(heart);
        }
        
        // CREATE SPARKLES
        const sparklesContainer = document.getElementById("sparkles");
        for(let i = 0; i < 30; i++) {
            const sparkle = document.createElement("div");
            sparkle.className = "sparkle";
            sparkle.style.left = Math.random() * 100 + "%";
            sparkle.style.top = Math.random() * 100 + "%";
            sparkle.style.animationDelay = Math.random() * 2 + "s";
            sparklesContainer.appendChild(sparkle);
        }
        
        // CREATE CONFETTI
        const confettiContainer = document.getElementById("confetti");
        const colors = ["#d4af37", "#c0392b", "#1a2639", "#fcf6ba"];
        for(let i = 0; i < 50; i++) {
            const confetti = document.createElement("div");
            confetti.className = "confetti";
            confetti.style.left = Math.random() * 100 + "%";
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 5 + "s";
            confetti.style.animationDuration = (3 + Math.random() * 4) + "s";
            confettiContainer.appendChild(confetti);
        }
        
        // 3D TILT EFFECT ON MOUSE MOVE
        const card = document.querySelector(".passport-card");
        document.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        document.addEventListener("mouseleave", () => {
            card.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
        });
    </script>
</body>
</html>',
    NULL,
    '["passport", "effects", "animations", "particles", "3d", "luxury", "premium"]',
    1,
    NOW(),
    NOW()
);

SELECT '✅ MEGA EFFECTS Passport template inserted!' as status;
SELECT '🎉 Template với SIÊU NHIỀU hiệu ứng đã sẵn sàng!' as message;
