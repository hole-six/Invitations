-- ============================================
-- INSERT ELEGANT SIMPLE WEDDING TEMPLATE
-- Thiệp cưới giản dị nhưng hoành tráng
-- ============================================

USE `wedding_invitations`;

-- Insert template
INSERT INTO `templates` (
    `uuid`,
    `name`,
    `slug`,
    `description`,
    `thumbnail_url`,
    `category_id`,
    `is_premium`,
    `template_type`,
    `html_content`,
    `design_data`,
    `tags`,
    `is_active`,
    `usage_count`,
    `created_at`,
    `updated_at`
) VALUES (
    UUID(),
    'Elegant Simple Wedding',
    'elegant-simple-wedding',
    'Thiệp cưới giản dị nhưng sang trọng với thiết kế tối giản và thanh lịch',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    4,
    0,
    'html',
    '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thiệp Cưới</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Montserrat:wght@300;400;600&family=Great+Vibes&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ''Montserrat'', sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .invitation-container {
            max-width: 800px;
            width: 100%;
            background: white;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            overflow: hidden;
            animation: fadeIn 1s ease-in;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .header-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 80px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .header-section::before {
            content: "";
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: movePattern 20s linear infinite;
        }

        @keyframes movePattern {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
        }

        .header-content {
            position: relative;
            z-index: 1;
        }

        .wedding-title {
            font-family: ''Playfair Display'', serif;
            font-size: 18px;
            color: white;
            letter-spacing: 8px;
            text-transform: uppercase;
            margin-bottom: 30px;
            font-weight: 400;
        }

        .couple-names {
            font-family: ''Great Vibes'', cursive;
            font-size: 72px;
            color: white;
            margin: 20px 0;
            line-height: 1.2;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .wedding-date {
            font-family: ''Montserrat'', sans-serif;
            font-size: 20px;
            color: rgba(255,255,255,0.95);
            letter-spacing: 3px;
            margin-top: 30px;
            font-weight: 300;
        }

        .content-section {
            padding: 60px 40px;
        }

        .section-title {
            font-family: ''Playfair Display'', serif;
            font-size: 32px;
            color: #667eea;
            text-align: center;
            margin-bottom: 30px;
            position: relative;
            padding-bottom: 15px;
        }

        .section-title::after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 2px;
            background: linear-gradient(90deg, transparent, #667eea, transparent);
        }

        .invitation-text {
            text-align: center;
            font-size: 18px;
            line-height: 1.8;
            color: #555;
            margin-bottom: 50px;
            font-weight: 300;
        }

        .event-details {
            background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
            padding: 40px;
            border-radius: 10px;
            margin: 40px 0;
        }

        .detail-item {
            display: flex;
            align-items: center;
            margin: 25px 0;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            transition: transform 0.3s ease;
        }

        .detail-item:hover {
            transform: translateX(10px);
        }

        .detail-icon {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20px;
            flex-shrink: 0;
        }

        .detail-icon svg {
            width: 24px;
            height: 24px;
            fill: white;
        }

        .detail-content {
            flex: 1;
        }

        .detail-label {
            font-size: 12px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 5px;
        }

        .detail-value {
            font-size: 18px;
            color: #333;
            font-weight: 600;
        }

        .gallery-section {
            padding: 60px 40px;
            background: #f9f9f9;
        }

        .gallery-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 40px;
        }

        .gallery-item {
            aspect-ratio: 1;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            overflow: hidden;
            position: relative;
            cursor: pointer;
            transition: transform 0.3s ease;
        }

        .gallery-item:hover {
            transform: scale(1.05);
        }

        .gallery-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .message-section {
            padding: 60px 40px;
            text-align: center;
        }

        .message-text {
            font-family: ''Playfair Display'', serif;
            font-size: 24px;
            color: #555;
            font-style: italic;
            line-height: 1.8;
            max-width: 600px;
            margin: 0 auto 40px;
        }

        .rsvp-button {
            display: inline-block;
            padding: 18px 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 2px;
            text-transform: uppercase;
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }

        .rsvp-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
        }

        .footer-section {
            background: #2d3748;
            color: white;
            padding: 40px;
            text-align: center;
        }

        .footer-text {
            font-size: 14px;
            opacity: 0.8;
            line-height: 1.6;
        }

        .hearts {
            font-size: 24px;
            margin: 20px 0;
            animation: heartbeat 1.5s ease-in-out infinite;
        }

        @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }

        @media (max-width: 768px) {
            .header-section {
                padding: 60px 20px;
            }

            .couple-names {
                font-size: 48px;
            }

            .content-section {
                padding: 40px 20px;
            }

            .section-title {
                font-size: 24px;
            }

            .detail-item {
                flex-direction: column;
                text-align: center;
            }

            .detail-icon {
                margin-right: 0;
                margin-bottom: 15px;
            }

            .gallery-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        [data-editable] {
            cursor: text;
            transition: background-color 0.3s ease;
        }

        [data-editable]:hover {
            background-color: rgba(102, 126, 234, 0.05);
            outline: 1px dashed rgba(102, 126, 234, 0.3);
        }
    </style>
</head>
<body>
    <div class="invitation-container">
        <!-- Header Section -->
        <div class="header-section">
            <div class="header-content">
                <div class="wedding-title" data-editable="true">Wedding Invitation</div>
                <div class="couple-names" data-editable="true">
                    <span data-editable="true">Alexander</span> & <span data-editable="true">Isabella</span>
                </div>
                <div class="wedding-date" data-editable="true">25 . 12 . 2025</div>
            </div>
        </div>

        <!-- Content Section -->
        <div class="content-section">
            <h2 class="section-title" data-editable="true">Trân trọng kính mời</h2>
            <p class="invitation-text" data-editable="true">
                Với niềm vui và hạnh phúc, chúng tôi xin trân trọng kính mời Quý khách<br>
                đến dự buổi lễ thành hôn của chúng tôi.<br>
                Sự hiện diện của Quý khách là niềm vinh hạnh cho gia đình chúng tôi.
            </p>

            <!-- Event Details -->
            <div class="event-details">
                <div class="detail-item">
                    <div class="detail-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
                        </svg>
                    </div>
                    <div class="detail-content">
                        <div class="detail-label">Ngày</div>
                        <div class="detail-value" data-editable="true">Thứ Bảy, 25 tháng 12 năm 2025</div>
                    </div>
                </div>

                <div class="detail-item">
                    <div class="detail-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                        </svg>
                    </div>
                    <div class="detail-content">
                        <div class="detail-label">Thời gian</div>
                        <div class="detail-value" data-editable="true">14:00 Chiều</div>
                    </div>
                </div>

                <div class="detail-item">
                    <div class="detail-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                    </div>
                    <div class="detail-content">
                        <div class="detail-label">Địa điểm</div>
                        <div class="detail-value" data-editable="true">Grand Ballroom - Khách sạn Luxury Palace</div>
                    </div>
                </div>

                <div class="detail-item">
                    <div class="detail-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                    </div>
                    <div class="detail-content">
                        <div class="detail-label">Địa chỉ</div>
                        <div class="detail-value" data-editable="true">123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Gallery Section -->
        <div class="gallery-section">
            <h2 class="section-title" data-editable="true">Khoảnh khắc đáng nhớ</h2>
            <div class="gallery-grid">
                <div class="gallery-item">
                    <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=400" alt="Wedding Photo 1" data-editable="true">
                </div>
                <div class="gallery-item">
                    <img src="https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400" alt="Wedding Photo 2" data-editable="true">
                </div>
                <div class="gallery-item">
                    <img src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400" alt="Wedding Photo 3" data-editable="true">
                </div>
                <div class="gallery-item">
                    <img src="https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400" alt="Wedding Photo 4" data-editable="true">
                </div>
            </div>
        </div>

        <!-- Message Section -->
        <div class="message-section">
            <p class="message-text" data-editable="true">
                "Tình yêu không làm cho thế giới quay tròn.<br>
                Tình yêu là thứ làm cho cuộc hành trình đáng giá."
            </p>
            <div class="hearts">❤️ 💕 ❤️</div>
            <a href="#rsvp" class="rsvp-button" data-editable="true">Xác nhận tham dự</a>
        </div>

        <!-- Footer Section -->
        <div class="footer-section">
            <p class="footer-text" data-editable="true">
                Cảm ơn bạn đã dành thời gian đọc thiệp mời của chúng tôi.<br>
                Rất mong được đón tiếp bạn trong ngày trọng đại này!
            </p>
            <div class="hearts">💑</div>
            <p class="footer-text" data-editable="true">
                © 2025 Wedding Invitation | Made with Love
            </p>
        </div>
    </div>

    <script>
        // Make elements editable on click
        document.querySelectorAll(''[data-editable="true"]'').forEach(element => {
            element.addEventListener(''click'', function() {
                if (!this.isContentEditable) {
                    this.contentEditable = true;
                    this.focus();
                    
                    // Select all text
                    const range = document.createRange();
                    range.selectNodeContents(this);
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            });

            element.addEventListener(''blur'', function() {
                this.contentEditable = false;
            });

            element.addEventListener(''keydown'', function(e) {
                if (e.key === ''Enter'' && !e.shiftKey) {
                    e.preventDefault();
                    this.blur();
                }
            });
        });

        // Smooth scroll for RSVP button
        document.querySelector(''.rsvp-button'').addEventListener(''click'', function(e) {
            e.preventDefault();
            alert(''Chức năng RSVP sẽ được kích hoạt sau khi thiệp được xuất bản!'');
        });
    </script>
</body>
</html>',
    NULL,
    '["wedding", "elegant", "simple", "modern", "luxury"]',
    1,
    0,
    NOW(),
    NOW()
);

SELECT '✅ Elegant Simple Wedding template inserted successfully!' as status;
SELECT * FROM templates WHERE slug = 'elegant-simple-wedding';
