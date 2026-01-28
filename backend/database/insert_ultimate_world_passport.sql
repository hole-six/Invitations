-- Insert Ultimate World Passport Wedding Template
USE `wedding_invitations`;

INSERT INTO `templates` (
    `uuid`, `name`, `slug`, `description`, `thumbnail_url`, `category_id`,
    `is_premium`, `html_content`, `design_data`, `tags`, `is_active`, `created_at`, `updated_at`
) VALUES (
    UUID(),
    'Ultimate World Passport',
    'ultimate-world-passport',
    'Thiệp cưới phong cách hộ chiếu thế giới - Siêu sang trọng với hiệu ứng vàng, tem dấu, và boarding pass',
    'https://images.unsplash.com/photo-1544642899-f0d6e5f6ed6f?w=800',
    1,
    1,
    '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Great+Vibes&family=Montserrat:wght@300;400;600;700&family=Playfair+Display:wght@400;700&family=Courier+Prime:wght@400;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: "Montserrat", sans-serif;
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        .passport-container {
            width: 100%;
            max-width: 600px;
            background: #fdfbf7;
            box-shadow: 0 30px 80px rgba(0,0,0,0.3);
            position: relative;
            overflow: hidden;
        }
        
        /* PASSPORT COVER */
        .passport-cover {
            background: #1a2639;
            padding: 80px 40px;
            text-align: center;
            position: relative;
        }
        .passport-title {
            font-family: "Cinzel", serif;
            font-size: 48px;
            font-weight: 700;
            background: linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            margin-bottom: 20px;
            letter-spacing: 4px;
        }
        .passport-subtitle {
            color: rgba(255,255,255,0.7);
            font-size: 14px;
            letter-spacing: 3px;
        }
        
        /* PHOTO ID PAGE */
        .photo-page {
            padding: 60px 40px;
            background: white;
            position: relative;
        }
        .couple-photo {
            width: 100%;
            height: 400px;
            object-fit: cover;
            border-radius: 4px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .couple-names {
            font-family: "Great Vibes", cursive;
            font-size: 52px;
            color: #1a2639;
            text-align: center;
            margin: 30px 0;
        }
        
        /* DATA FIELDS */
        .data-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 40px 0;
        }
        .data-field label {
            display: block;
            font-size: 10px;
            color: #888;
            font-family: "Courier Prime", monospace;
            margin-bottom: 5px;
            letter-spacing: 1px;
        }
        .data-field .value {
            font-size: 18px;
            font-weight: 700;
            color: #1a2639;
        }
        .data-field .value.highlight {
            color: #c0392b;
            font-size: 20px;
        }
        
        /* STAMP */
        .stamp {
            position: absolute;
            top: 50px;
            right: 40px;
            width: 120px;
            height: 120px;
            border: 4px double #c0392b;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(-15deg);
            opacity: 0.85;
        }
        .stamp-text {
            font-family: "Courier Prime", monospace;
            font-size: 14px;
            font-weight: bold;
            color: #c0392b;
            text-align: center;
            line-height: 1.3;
        }
        
        /* BOARDING PASS */
        .boarding-pass {
            background: white;
            margin: 40px;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            position: relative;
        }
        .boarding-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px dashed #ccc;
        }
        .airline-name {
            font-size: 18px;
            font-weight: 800;
            color: #1a2639;
            letter-spacing: 2px;
        }
        .class-badge {
            background: #d4af37;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
        }
        .flight-details {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 30px 0;
        }
        .flight-field label {
            display: block;
            font-size: 10px;
            color: #888;
            margin-bottom: 5px;
        }
        .flight-field .value {
            font-size: 24px;
            font-weight: 700;
            color: #1a2639;
        }
        .barcode {
            text-align: center;
            font-size: 40px;
            letter-spacing: 3px;
            color: #1a2639;
            margin-top: 30px;
            opacity: 0.8;
        }
        
        /* FOOTER */
        .footer {
            text-align: center;
            padding: 60px 40px;
            background: #fdfbf7;
        }
        .rsvp-circle {
            width: 120px;
            height: 120px;
            background: #1a2639;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin: 0 auto 30px;
        }
        .rsvp-icon {
            font-size: 40px;
            transform: rotate(-45deg);
        }
        .rsvp-text {
            color: #d4af37;
            font-size: 12px;
            font-weight: 700;
            margin-top: 10px;
        }
        .footer-message {
            font-family: "Great Vibes", cursive;
            font-size: 24px;
            color: #1a2639;
        }
        
        /* ANIMATIONS */
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }
        .floating {
            animation: float 3s ease-in-out infinite;
        }
        
        /* RESPONSIVE */
        @media (max-width: 768px) {
            .passport-container { max-width: 390px; }
            .passport-title { font-size: 32px; }
            .couple-names { font-size: 36px; }
            .couple-photo { height: 300px; }
            .data-grid { grid-template-columns: 1fr; gap: 20px; }
            .flight-details { grid-template-columns: 1fr; }
            .boarding-pass { margin: 20px; padding: 30px; }
        }
    </style>
</head>
<body>
    <div class="passport-container">
        <!-- PASSPORT COVER -->
        <div class="passport-cover">
            <div class="passport-title">PASSPORT<br>TO LOVE</div>
            <div class="passport-subtitle">WEDDING INVITATION</div>
        </div>
        
        <!-- PHOTO ID PAGE -->
        <div class="photo-page">
            <img src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80" 
                 alt="Couple Photo" 
                 class="couple-photo"
                 data-editable="couple_photo">
            
            <div class="couple-names">
                {{groom_name}} & {{bride_name}}
            </div>
            
            <div class="data-grid">
                <div class="data-field">
                    <label>DATE OF HAPPINESS</label>
                    <div class="value highlight">{{event_date}}</div>
                </div>
                <div class="data-field">
                    <label>TIME</label>
                    <div class="value">{{event_time}}</div>
                </div>
                <div class="data-field">
                    <label>PLACE OF UNION</label>
                    <div class="value">{{event_location}}</div>
                </div>
                <div class="data-field">
                    <label>ADDRESS</label>
                    <div class="value">{{event_address}}</div>
                </div>
            </div>
            
            <!-- STAMP -->
            <div class="stamp">
                <div class="stamp-text">APPROVED<br>LOVE</div>
            </div>
        </div>
        
        <!-- BOARDING PASS -->
        <div class="boarding-pass">
            <div class="boarding-header">
                <div class="airline-name">AIRLINES OF LOVE</div>
                <div class="class-badge">FIRST CLASS</div>
            </div>
            
            <div class="flight-details">
                <div class="flight-field">
                    <label>GATE</label>
                    <div class="value">01</div>
                </div>
                <div class="flight-field">
                    <label>TIME</label>
                    <div class="value">{{event_time}}</div>
                </div>
                <div class="flight-field">
                    <label>SEAT</label>
                    <div class="value">VIP</div>
                </div>
            </div>
            
            <div class="barcode">|| ||| || ||| || |||</div>
        </div>
        
        <!-- FOOTER -->
        <div class="footer">
            <div class="rsvp-circle floating">
                <div class="rsvp-icon">✈</div>
                <div class="rsvp-text">XÁC NHẬN</div>
            </div>
            <div class="footer-message">Rất hân hạnh được đón tiếp!</div>
        </div>
    </div>
</body>
</html>',
    NULL,
    '["passport", "travel", "luxury", "gold", "boarding-pass"]',
    1,
    NOW(),
    NOW()
);

SELECT '✅ Ultimate World Passport template inserted!' as status;
SELECT * FROM `templates` WHERE `slug` = 'ultimate-world-passport';
