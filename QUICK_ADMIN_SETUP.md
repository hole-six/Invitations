# 🚀 QUICK ADMIN SETUP - 3 BƯỚC

## Bước 1: Thêm Role Column
```bash
mysql -u root -p wedding_invitations < backend/database/add_user_role.sql
```

## Bước 2: Tạo Admin Account
```bash
mysql -u root -p wedding_invitations < backend/database/insert_admin_user.sql
```

## Bước 3: Đăng Nhập Admin
```
URL: http://localhost:3000/login

📧 Email: admin@admin.com
🔑 Password: admin123
```

## Truy Cập Admin Panel
```
http://localhost:3000/admin/templates
```

---

## 👤 ACCOUNTS ĐÃ TẠO:

### Admin Account:
- Email: `admin@admin.com`
- Password: `admin123`
- Role: `admin`
- Quyền: Truy cập admin panel, tạo templates

### Test User Account:
- Email: `test@test.com`
- Password: `test123`
- Role: `user`
- Quyền: Sử dụng templates, tạo invitations

---

## ⚡ HOẶC CHẠY TRỰC TIẾP TRONG phpMyAdmin:

### 1. Thêm Role Column:
```sql
USE `wedding_invitations`;

ALTER TABLE `users` 
ADD COLUMN `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user' AFTER `phone`;
```

### 2. Insert Admin User:
```sql
INSERT INTO `users` (
    `uuid`, `email`, `password`, `full_name`, `phone`, `role`, `status`, `created_at`, `updated_at`
) VALUES (
    UUID(), 
    'admin@admin.com', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Admin User', 
    '0999999999',
    'admin',
    'active', 
    NOW(), 
    NOW()
);
```

### 3. Insert Test User:
```sql
INSERT INTO `users` (
    `uuid`, `email`, `password`, `full_name`, `phone`, `role`, `status`, `created_at`, `updated_at`
) VALUES (
    UUID(), 
    'test@test.com', 
    '$2y$10$gPld1xlWL76NRBqbvEcpXehaSn0pac6.wuvUbFeQwAWQx4ecTbHiK',
    'Test User', 
    '0123456789',
    'user',
    'active', 
    NOW(), 
    NOW()
);
```

---

## ✅ KIỂM TRA:

```sql
-- Xem tất cả users và role
SELECT id, email, full_name, role, status FROM users;
```

Kết quả mong đợi:
```
| id | email              | full_name  | role  | status |
|----|-------------------|------------|-------|--------|
| 1  | admin@admin.com   | Admin User | admin | active |
| 2  | test@test.com     | Test User  | user  | active |
```

---

## 🎯 SAU KHI SETUP:

1. Đăng nhập với `admin@admin.com` / `admin123`
2. Vào `/admin/templates`
3. Paste HTML template (1000+ dòng)
4. Xem live preview
5. Click "Tạo Template"

Done! 🎉
