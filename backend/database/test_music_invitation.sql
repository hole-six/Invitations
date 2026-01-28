-- Test invitation with music
-- Run this to test music functionality

-- Insert test invitation with MP3 music
INSERT INTO invitations (
  uuid,
  user_id,
  template_id,
  title,
  slug,
  groom_name,
  bride_name,
  event_date,
  event_time,
  event_location,
  event_address,
  template_type,
  html_content,
  music_url,
  music_autoplay,
  status,
  visibility,
  published_at,
  created_at,
  updated_at
) VALUES (
  UUID(),
  1,
  10,
  'Test Music Invitation',
  'test-music-invitation',
  'Nguyễn Văn A',
  'Trần Thị B',
  '2025-12-31',
  '14:00',
  'Nhà Hàng Tiệc Cưới',
  '123 Đường ABC, Quận 1, TP.HCM',
  'html',
  '<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "Playfair Display", serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      background: white;
      border-radius: 30px;
      padding: 60px 40px;
      box-shadow: 0 30px 80px rgba(0,0,0,0.3);
      text-align: center;
    }
    h1 {
      font-size: 48px;
      color: #667eea;
      margin-bottom: 20px;
      font-weight: 700;
    }
    .names {
      font-size: 36px;
      color: #333;
      margin: 30px 0;
      font-weight: 600;
    }
    .date {
      font-size: 24px;
      color: #666;
      margin: 20px 0;
    }
    .location {
      font-size: 18px;
      color: #888;
      margin: 15px 0;
      line-height: 1.6;
    }
    .heart {
      font-size: 60px;
      color: #ff6b9d;
      margin: 30px 0;
      animation: heartbeat 1.5s infinite;
    }
    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>{{title}}</h1>
    <div class="heart">❤️</div>
    <div class="names">{{groom_name}} & {{bride_name}}</div>
    <div class="date">📅 {{event_date}}</div>
    <div class="date">🕐 {{event_time}}</div>
    <div class="location">📍 {{event_location}}</div>
    <div class="location">{{event_address}}</div>
  </div>
</body>
</html>',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  1,
  'published',
  'public',
  NOW(),
  NOW(),
  NOW()
);

-- Get the slug to test
SELECT CONCAT('Test URL: http://localhost:3000/invitation/', slug) as test_url
FROM invitations 
WHERE title = 'Test Music Invitation'
ORDER BY id DESC 
LIMIT 1;
