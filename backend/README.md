# Wedding Invitation System - Backend API

Pure PHP backend với kiến trúc MVC, RESTful API, dễ dàng chuyển đổi sang Golang.

## 🚀 Quick Start

### 1. Cài đặt Dependencies

```bash
composer install
```

### 2. Cấu hình Database

```bash
# Tạo database
mysql -u root -p -e "CREATE DATABASE wedding_invitations CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import schema
mysql -u root -p wedding_invitations < database/schema.sql

# Import sample data (optional)
mysql -u root -p wedding_invitations < database/seeds.sql
```

### 3. Cấu hình Environment

```bash
cp .env.example .env
# Chỉnh sửa .env với thông tin database của bạn
```

### 4. Khởi động Server

```bash
# Development server
php -S localhost:8000 -t public

# Hoặc sử dụng Apache/Nginx
```

## 📁 Cấu trúc Project

```
backend/
├── app/
│   ├── Core/              # Framework core
│   ├── Controllers/       # Request handlers
│   ├── Models/           # Data models
│   ├── Repositories/     # Data access
│   ├── Services/         # Business logic
│   ├── Middleware/       # Request middleware
│   └── Helpers/          # Utility functions
├── config/               # Configuration
├── database/             # Database files
├── public/               # Public directory
├── routes/               # Route definitions
└── storage/              # File storage
```

## 🔐 Authentication

API sử dụng JWT (JSON Web Tokens) cho authentication.

### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "0123456789"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": {...},
    "tokens": {
      "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
      "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
      "token_type": "Bearer",
      "expires_in": 3600
    }
  }
}
```

### Sử dụng Token
```bash
GET /api/invitations
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Thông tin user hiện tại

### Invitations
- `GET /api/invitations` - Danh sách thiệp của user
- `POST /api/invitations` - Tạo thiệp mới
- `GET /api/invitations/{id}` - Chi tiết thiệp
- `PUT /api/invitations/{id}` - Cập nhật thiệp
- `DELETE /api/invitations/{id}` - Xóa thiệp
- `POST /api/invitations/{id}/publish` - Publish thiệp
- `POST /api/invitations/{id}/duplicate` - Nhân bản thiệp
- `GET /api/public/invitations/{slug}` - Xem thiệp công khai

### Templates
- `GET /api/templates` - Danh sách templates
- `GET /api/templates/categories` - Danh mục templates
- `GET /api/templates/{id}` - Chi tiết template

### Guests & RSVP
- `GET /api/invitations/{id}/guests` - Danh sách khách mời
- `POST /api/invitations/{id}/guests` - Thêm khách mời
- `PUT /api/guests/{id}` - Cập nhật khách mời
- `DELETE /api/guests/{id}` - Xóa khách mời
- `POST /api/invitations/{id}/rsvp` - Gửi RSVP (public)
- `GET /api/invitations/{id}/rsvp` - Danh sách RSVP

## 🗄️ Database Schema

### Core Tables
- **users** - Tài khoản người dùng
- **invitations** - Thiệp cưới
- **templates** - Mẫu thiệp
- **invitation_guests** - Danh sách khách mời
- **invitation_rsvp** - Phản hồi RSVP
- **subscription_plans** - Gói dịch vụ
- **payment_transactions** - Lịch sử thanh toán

Xem chi tiết: `database/schema.sql`

## 🔧 Development

### Code Style
- PSR-12 coding standard
- Type declarations
- Strict types enabled

### Testing
```bash
# TODO: Add tests
```

### Debugging
```bash
# Enable debug mode in .env
APP_DEBUG=true
```

## 🚀 Deployment

### Production Checklist
- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Change `JWT_SECRET` to strong random string
- [ ] Configure proper CORS origins
- [ ] Set up SSL certificate
- [ ] Configure database backups
- [ ] Set up monitoring
- [ ] Configure rate limiting

### Apache Configuration
```apache
<VirtualHost *:80>
    ServerName api.yourdomain.com
    DocumentRoot /path/to/backend/public
    
    <Directory /path/to/backend/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    root /path/to/backend/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

## 🔄 Converting to Golang

Kiến trúc được thiết kế để dễ dàng chuyển đổi:

1. **Router** → `gorilla/mux` hoặc `chi`
2. **Database** → `database/sql` với `sqlx`
3. **Models** → Go structs
4. **Controllers** → Handler functions
5. **Middleware** → Standard middleware pattern
6. **JWT** → `golang-jwt/jwt`

## 📚 Documentation

- [Architecture Guide](ARCHITECTURE.md)
- [API Documentation](docs/api.md) - TODO
- [Database Schema](database/schema.sql)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License

## 👥 Support

For support, email support@example.com
