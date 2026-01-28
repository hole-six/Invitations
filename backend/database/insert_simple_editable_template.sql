-- Template đơn giản để demo EDITABLE TEXT concept
USE `wedding_invitations`;

INSERT INTO `templates` (
    `uuid`, `name`, `slug`, `description`, `thumbnail_url`, `category_id`,
    `is_premium`, `html_content`, `design_data`, `tags`, `is_active`, `created_at`, `updated_at`
) VALUES (
    UUID(),
    'Simple Editable Demo',
    'simple-editable-demo',
    'Template đơn giản để demo tính năng edit mọi chữ trên thiệp',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    1,
    0,
    '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: "Georgia", serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .card {
            background: white;
            max-width: 600px;
            width: 100%;
            border-radius: 20px;
            padding: 60px 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
        }
        .header-text {
            font-size: 14px;
            color: #888;
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-bottom: 20px;
        }
        .main-title {
            font-size: 48px;
            color: #333;
            margin-bottom: 30px;
            font-weight: bold;
        }
        .couple-photo {
            width: 100%;
            height: 400px;
            object-fit: cover;
            border-radius: 15px;
            margin: 30px 0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .names {
            font-size: 36px;
            color: #667eea;
            margin: 30px 0;
        }
        .info-section {
            margin: 40px 0;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 15px;
        }
        .info-title {
            font-size: 24px;
            color: #333;
            margin-bottom: 20px;
            font-weight: bold;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 15px 0;
            padding: 15px;
            background: white;
            border-radius: 10px;
        }
        .info-label {
            font-size: 14px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .info-value {
            font-size: 16px;
            color: #333;
            font-weight: 600;
        }
        .message {
            font-size: 18px;
            color: #666;
            line-height: 1.8;
            margin: 30px 0;
            font-style: italic;
        }
        .button {
            display: inline-block;
            padding: 15px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0;
            transition: transform 0.3s;
        }
        .button:hover {
            transform: translateY(-3px);
        }
        .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="card">
        <!-- Header - CÓ THỂ EDIT -->
        <div class="header-text" data-editable="header_text">You Are Invited To</div>
        
        <!-- Main Title - CÓ THỂ EDIT -->
        <h1 class="main-title" data-editable="main_title">Our Wedding Celebration</h1>
        
        <!-- Photo - CÓ THỂ THAY ẢNH -->
        <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80" 
             alt="Couple" 
             class="couple-photo"
             data-editable="couple_photo">
        
        <!-- Names - TỰ ĐỘNG TỪ FORM -->
        <div class="names">{{groom_name}} & {{bride_name}}</div>
        
        <!-- Info Section -->
        <div class="info-section">
            <!-- Section Title - CÓ THỂ EDIT -->
            <div class="info-title" data-editable="info_section_title">Event Details</div>
            
            <div class="info-row">
                <!-- Label - CÓ THỂ EDIT -->
                <div class="info-label" data-editable="label_date">Date</div>
                <!-- Value - TỰ ĐỘNG TỪ FORM -->
                <div class="info-value">{{event_date}}</div>
            </div>
            
            <div class="info-row">
                <div class="info-label" data-editable="label_time">Time</div>
                <div class="info-value">{{event_time}}</div>
            </div>
            
            <div class="info-row">
                <div class="info-label" data-editable="label_location">Location</div>
                <div class="info-value">{{event_location}}</div>
            </div>
            
            <div class="info-row">
                <div class="info-label" data-editable="label_address">Address</div>
                <div class="info-value">{{event_address}}</div>
            </div>
        </div>
        
        <!-- Message - CÓ THỂ EDIT -->
        <div class="message" data-editable="invitation_message">
            We would be honored to have you join us on our special day. 
            Your presence would mean the world to us!
        </div>
        
        <!-- Button - CÓ THỂ EDIT TEXT -->
        <a href="#" class="button" data-editable="button_text">RSVP Now</a>
        
        <!-- Footer - CÓ THỂ EDIT -->
        <div class="footer" data-editable="footer_text">
            With love and gratitude, {{groom_name}} & {{bride_name}}
        </div>
    </div>
</body>
</html>',
    NULL,
    '["simple", "demo", "editable", "beginner"]',
    1,
    NOW(),
    NOW()
);

SELECT '✅ Simple Editable Demo template created!' as status;
SELECT '📝 Template này có 10 text fields có thể edit + 1 ảnh!' as message;

