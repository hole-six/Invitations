-- ═══════════════════════════════════════════════════════════════
-- INSERT ALL TEST DATA - Complete Test Dataset
-- ═══════════════════════════════════════════════════════════════

USE `wedding_invitations`;

-- ============================================
-- 1. INSERT PASSPORT TO LOVE HTML TEMPLATE
-- ============================================

INSERT INTO `templates` (
    `uuid`, `name`, `slug`, `description`, `thumbnail_url`, `category_id`,
    `is_premium`, `html_content`, `design_data`, `tags`, `is_active`, `created_at`, `updated_at`
) VALUES (
    UUID(),
    'Passport to Love HTML',
    'passport-to-love-html',
    'Thiệp cưới phong cách hộ chiếu - HTML Editor',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    1,
    1,
    '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Great+Vibes&family=Montserrat:wght@400;600;700&family=Courier+Prime&display=swap" rel="stylesheet">
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
        .container {
            width: 100%;
            max-width: 390px;
            height: 850px;
            background: #fdfbf7;
            position: relative;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .top-navy {
            width: 100%;
            height: 200px;
            background: #1a2639;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .title {
            font-family: "Cinzel", serif;
            font-size: 32px;
            font-weight: 700;
            text-align: center;
            line-height: 1.2;
            background: linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 12px;
            color: rgba(255,255,255,0.7);
            letter-spacing: 2px;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .names {
            font-family: "Great Vibes", cursive;
            font-size: 36px;
            color: #1a2639;
            margin: 30px 0;
        }
        .date {
            font-size: 20px;
            font-weight: 600;
            color: #1a2639;
            margin: 20px 0;
        }
        .time {
            font-size: 16px;
            color: #666;
            margin: 10px 0;
        }
        .location {
            font-size: 18px;
            color: #1a2639;
            margin: 30px 0 10px;
            font-weight: 600;
        }
        .address {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
        }
        .stamp {
            position: absolute;
            top: 320px;
            right: 30px;
            width: 80px;
            height: 80px;
            border: 3px double #c0392b;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(-15deg);
            color: #c0392b;
            font-family: "Courier Prime", monospace;
            font-size: 10px;
            font-weight: bold;
            letter-spacing: 1px;
            box-shadow: 0 0 0 2px rgba(192, 57, 43, 0.3);
            opacity: 0.85;
        }
        .divider {
            width: 60px;
            height: 2px;
            background: linear-gradient(to right, transparent, #d4af37, transparent);
            margin: 20px auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="top-navy">
            <div class="title">PASSPORT<br>TO LOVE</div>
            <div class="subtitle">WEDDING INVITATION</div>
        </div>
        
        <div class="content">
            <div class="divider"></div>
            
            <div class="names">
                {{groom_name}} & {{bride_name}}
            </div>
            
            <div class="divider"></div>
            
            <div class="date">{{event_date}}</div>
            <div class="time">{{event_time}}</div>
            
            <div class="divider"></div>
            
            <div class="location">{{event_location}}</div>
            <div class="address">{{event_address}}</div>
        </div>
        
        <div class="stamp">APPROVED</div>
    </div>
</body>
</html>',
    NULL,
    '[]',
    1,
    NOW(),
    NOW()
);

-- ============================================
-- 2. INSERT PASSPORT TO LOVE CANVAS TEMPLATE
-- ============================================

INSERT INTO `templates` (
    `uuid`, `name`, `slug`, `description`, `thumbnail_url`, `category_id`,
    `is_premium`, `html_content`, `design_data`, `tags`, `is_active`, `created_at`, `updated_at`
) VALUES (
    UUID(),
    'Passport to Love Canvas',
    'passport-to-love-canvas',
    'Thiệp cưới phong cách hộ chiếu - Canvas Editor',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    1,
    1,
    NULL,
    '{
      "fonts": [
        "https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap",
        "https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap",
        "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap"
      ],
      "globalStyles": ".gold-text { background: linear-gradient(to right, #bf953f, #fcf6ba, #b38728); -webkit-background-clip: text; background-clip: text; color: transparent; }",
      "canvas": {
        "width": 390,
        "height": 850,
        "background": "#fdfbf7"
      },
      "elements": [
        {
          "id": "navy-bg",
          "type": "shape",
          "shapeType": "rectangle",
          "x": 0,
          "y": 0,
          "width": 390,
          "height": 200,
          "fill": "#1a2639",
          "zIndex": 0
        },
        {
          "id": "title",
          "type": "text",
          "content": "PASSPORT TO LOVE",
          "x": 20,
          "y": 60,
          "width": 350,
          "height": 80,
          "fontSize": 32,
          "fontFamily": "Cinzel",
          "color": "#d4af37",
          "fontWeight": "bold",
          "textAlign": "center",
          "className": "gold-text",
          "zIndex": 1
        },
        {
          "id": "names",
          "type": "text",
          "content": "{{groom_name}} & {{bride_name}}",
          "x": 20,
          "y": 280,
          "width": 350,
          "height": 60,
          "fontSize": 36,
          "fontFamily": "Great Vibes",
          "color": "#1a2639",
          "textAlign": "center",
          "zIndex": 1
        },
        {
          "id": "date",
          "type": "text",
          "content": "{{event_date}}",
          "x": 20,
          "y": 400,
          "width": 350,
          "height": 40,
          "fontSize": 20,
          "fontFamily": "Montserrat",
          "color": "#1a2639",
          "fontWeight": "600",
          "textAlign": "center",
          "zIndex": 1
        },
        {
          "id": "location",
          "type": "text",
          "content": "{{event_location}}",
          "x": 20,
          "y": 500,
          "width": 350,
          "height": 40,
          "fontSize": 18,
          "fontFamily": "Montserrat",
          "color": "#1a2639",
          "fontWeight": "600",
          "textAlign": "center",
          "zIndex": 1
        }
      ]
    }',
    '[]',
    1,
    NOW(),
    NOW()
);

SELECT '✅ Templates inserted!' as status;

-- ============================================
-- 3. CREATE TEST INVITATIONS
-- ============================================

-- HTML Invitation
SET @html_template_id = (SELECT id FROM templates WHERE slug = 'passport-to-love-html' LIMIT 1);

INSERT INTO invitations (
    uuid, user_id, template_id, title, slug,
    template_type, html_content,
    design_data, 
    status, visibility, 
    event_date, event_time, event_location, event_address,
    groom_name, bride_name,
    published_at, created_at, updated_at
)
SELECT 
    UUID(), 
    1,
    @html_template_id,
    'Passport to Love - HTML Version',
    'passport-html-demo',
    'html',
    html_content,
    NULL,
    'published',
    'public',
    '2025-12-31',
    '14:00:00',
    'Grand Ballroom Hotel',
    '123 Wedding Street, City Center',
    'Alexander',
    'Isabella',
    NOW(),
    NOW(),
    NOW()
FROM templates 
WHERE slug = 'passport-to-love-html';

-- Canvas Invitation
SET @canvas_template_id = (SELECT id FROM templates WHERE slug = 'passport-to-love-canvas' LIMIT 1);

INSERT INTO invitations (
    uuid, user_id, template_id, title, slug,
    template_type, html_content,
    design_data, 
    status, visibility, 
    event_date, event_time, event_location, event_address,
    groom_name, bride_name,
    published_at, created_at, updated_at
)
SELECT 
    UUID(), 
    1,
    @canvas_template_id,
    'Passport to Love - Canvas Version',
    'passport-canvas-demo',
    'canvas',
    NULL,
    design_data,
    'published',
    'public',
    '2025-12-31',
    '14:00:00',
    'Grand Ballroom Hotel',
    '123 Wedding Street, City Center',
    'Alexander',
    'Isabella',
    NOW(),
    NOW(),
    NOW()
FROM templates 
WHERE slug = 'passport-to-love-canvas';

SELECT '✅ Test invitations created!' as status;

-- ============================================
-- 4. SHOW RESULTS
-- ============================================

SELECT '═══════════════════════════════════════════' as '';
SELECT '✅ TẤT CẢ DỮ LIỆU TEST ĐÃ ĐƯỢC NHẬP!' as '';
SELECT '═══════════════════════════════════════════' as '';

SELECT '' as '';
SELECT 'TEMPLATES:' as '';
SELECT id, name, slug, is_active FROM templates ORDER BY id;

SELECT '' as '';
SELECT 'INVITATIONS:' as '';
SELECT id, title, slug, status, visibility, template_type 
FROM invitations 
ORDER BY id;

SELECT '' as '';
SELECT '═══════════════════════════════════════════' as '';
SELECT 'XEM THIỆP MỜI:' as '';
SELECT 'HTML Version: http://localhost:5173/invitation/passport-html-demo' as '';
SELECT 'Canvas Version: http://localhost:5173/invitation/passport-canvas-demo' as '';
SELECT '═══════════════════════════════════════════' as '';
