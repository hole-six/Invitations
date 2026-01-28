# 🎨 ADMIN TEMPLATE MANAGEMENT SYSTEM - SETUP GUIDE

## ✅ ĐÃ TẠO:

### 1. Database Migration
📁 File: `backend/database/add_user_role.sql`
- Thêm cột `role` vào bảng `users` (ENUM: 'user', 'admin')
- Set user_id = 1 làm admin

### 2. Admin Template Page
📁 File: `frontend/src/pages/AdminTemplatePage.jsx`
- Giao diện đỉnh cao với gradient indigo/purple/pink
- Form tạo template với đầy đủ fields
- Live preview HTML real-time
- Check quyền admin
- Responsive design

### 3. Routes
📁 File: `frontend/src/App.js`
- Thêm route `/admin/templates` (protected)

---

## 🚀 CÁCH SỬ DỤNG:

### Bước 1: Chạy Migration
```bash
# Vào thư mục backend
cd backend

# Chạy migration SQL
mysql -u root -p wedding_invitations < database/add_user_role.sql

# Hoặc import qua phpMyAdmin
```

### Bước 2: Truy cập Admin Panel
```
http://localhost:3000/admin/templates
```

**Lưu ý:** Chỉ user có `role = 'admin'` mới truy cập được!

---

## 📋 TÍNH NĂNG:

### ✨ Create Template Tab:
- **Thông tin cơ bản:**
  - Name (tên template)
  - Slug (URL friendly)
  - Description (mô tả)
  - Thumbnail URL (ảnh preview)
  - Category (Wedding/Birthday/Anniversary)
  - Premium checkbox

- **HTML Content:**
  - Textarea lớn để paste HTML (1000+ dòng)
  - Font mono để dễ đọc code
  - Preview button

- **Live Preview:**
  - Iframe hiển thị HTML real-time
  - Sandbox mode an toàn
  - Responsive preview

### 📝 List Templates Tab:
- Coming soon...
- Sẽ hiển thị danh sách templates
- Edit/Delete/Duplicate functions

---

## 🎨 DESIGN HIGHLIGHTS:

1. **Hero Section:**
   - Gradient indigo → purple → pink
   - Admin badge với shield icon
   - Blur decorative elements

2. **Form Panel:**
   - Clean white card
   - Rounded corners (2xl)
   - Focus states với indigo ring
   - Validation required fields

3. **Preview Panel:**
   - Side-by-side với form
   - Iframe 600px height
   - Empty state với eye icon

4. **Buttons:**
   - Gradient backgrounds
   - Hover scale effects
   - Loading states
   - Disabled states

5. **Fonts:**
   - Playfair Display (headings)
   - Cormorant Garamond (descriptions)
   - System fonts (form inputs)

---

## 🔐 PHÂN QUYỀN:

### Admin User:
- Truy cập `/admin/templates`
- Tạo/sửa/xóa templates
- Quản lý toàn bộ hệ thống

### Regular User:
- Không truy cập được admin panel
- Redirect về homepage với toast error
- Chỉ sử dụng templates có sẵn

---

## 🛠️ TODO - BACKEND API:

Cần tạo API endpoints:

### 1. POST `/api/admin/templates`
```php
// Create new template
// Required: name, slug, html_content
// Optional: description, thumbnail_url, category_id, is_premium, tags
```

### 2. GET `/api/admin/templates`
```php
// List all templates (admin only)
// With pagination, filters
```

### 3. PUT `/api/admin/templates/{id}`
```php
// Update template
```

### 4. DELETE `/api/admin/templates/{id}`
```php
// Delete template
```

### 5. Middleware: AdminMiddleware
```php
// Check if user role === 'admin'
// Return 403 if not admin
```

---

## 📊 DATABASE SCHEMA:

### Users Table (Updated):
```sql
CREATE TABLE `users` (
  ...
  `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  ...
)
```

### Templates Table (Existing):
```sql
CREATE TABLE `templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `is_premium` tinyint(1) DEFAULT '0',
  `html_content` longtext,
  `design_data` longtext,
  `tags` json DEFAULT NULL,
  `usage_count` int(11) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
)
```

---

## 🎯 NEXT STEPS:

1. ✅ Chạy migration `add_user_role.sql`
2. ⏳ Tạo backend API endpoints
3. ⏳ Tạo AdminMiddleware
4. ⏳ Connect frontend với API
5. ⏳ Implement List Templates tab
6. ⏳ Add Edit/Delete functions
7. ⏳ Add file upload cho thumbnail

---

## 💡 TIPS:

- HTML content có thể paste trực tiếp từ file
- Slug nên lowercase, dùng dấu gạch ngang
- Thumbnail URL dùng Unsplash hoặc upload
- Test preview trước khi submit
- Premium templates hiển thị badge vàng

---

Hệ thống Admin Template Management đã sẵn sàng! 🚀
Chỉ cần chạy migration và tạo API là có thể sử dụng ngay!
