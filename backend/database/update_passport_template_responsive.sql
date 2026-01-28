-- Update Passport Template to be Responsive
USE `wedding_invitations`;

UPDATE `templates` 
SET `html_content` = '<!DOCTYPE html>
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
            max-width: 600px;
            min-height: 900px;
            background: #fdfbf7;
            position: relative;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .top-navy {
            width: 100%;
            padding: 60px 40px;
            background: #1a2639;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .title {
            font-family: "Cinzel", serif;
            font-size: 48px;
            font-weight: 700;
            text-align: center;
            line-height: 1.2;
            background: linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            margin-bottom: 15px;
        }
        .subtitle {
            font-size: 14px;
            color: rgba(255,255,255,0.7);
            letter-spacing: 3px;
        }
        .content {
            padding: 60px 50px;
            text-align: center;
        }
        .names {
            font-family: "Great Vibes", cursive;
            font-size: 52px;
            color: #1a2639;
            margin: 40px 0;
            line-height: 1.3;
        }
        .date {
            font-size: 28px;
            font-weight: 600;
            color: #1a2639;
            margin: 30px 0;
        }
        .time {
            font-size: 20px;
            color: #666;
            margin: 15px 0;
        }
        .location {
            font-size: 24px;
            color: #1a2639;
            margin: 40px 0 15px;
            font-weight: 600;
        }
        .address {
            font-size: 16px;
            color: #666;
            line-height: 1.8;
        }
        .stamp {
            position: absolute;
            top: 420px;
            right: 50px;
            width: 100px;
            height: 100px;
            border: 4px double #c0392b;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(-15deg);
            color: #c0392b;
            font-family: "Courier Prime", monospace;
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 1px;
            box-shadow: 0 0 0 3px rgba(192, 57, 43, 0.3);
            opacity: 0.85;
        }
        .divider {
            width: 80px;
            height: 3px;
            background: linear-gradient(to right, transparent, #d4af37, transparent);
            margin: 30px auto;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .container {
                max-width: 390px;
                min-height: 850px;
            }
            .top-navy {
                padding: 40px 30px;
            }
            .title {
                font-size: 32px;
            }
            .subtitle {
                font-size: 12px;
            }
            .content {
                padding: 40px 30px;
            }
            .names {
                font-size: 36px;
            }
            .date {
                font-size: 20px;
            }
            .time {
                font-size: 16px;
            }
            .location {
                font-size: 18px;
            }
            .address {
                font-size: 14px;
            }
            .stamp {
                width: 80px;
                height: 80px;
                top: 320px;
                right: 30px;
                font-size: 10px;
            }
            .divider {
                width: 60px;
                height: 2px;
                margin: 20px auto;
            }
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
</html>'
WHERE `slug` = 'passport-to-love-html';

-- Also update invitations that use this template
UPDATE `invitations` 
SET `html_content` = (SELECT `html_content` FROM `templates` WHERE `slug` = 'passport-to-love-html')
WHERE `template_type` = 'html' 
AND `template_id` = (SELECT `id` FROM `templates` WHERE `slug` = 'passport-to-love-html');

SELECT '✅ Template updated to responsive design!' as status;
SELECT 'Refresh your invitation page to see the changes' as note;
