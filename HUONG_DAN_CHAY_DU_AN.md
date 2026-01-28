# 🚀 HƯỚNG DẪN CHẠY DỰ ÁN THIỆP CƯỚI

## ✅ **TRẠNG THÁI HIỆN TẠI**
- ✅ Backend PHP: `http://localhost:8000` (ĐANG CHẠY)
- ✅ Frontend React: `http://localhost:5173` (ĐANG CHẠY)
- ✅ Database: `wedding_invitations` (SẴN SÀNG)

---

## 📋 **CÁC BƯỚC ĐÃ HOÀN THÀNH**

### 1. **Database Setup** ✅
- Import file: `backend/database/reset_clean_database.sql`
- Database: `wedding_invitations`
- 6 bảng chính đã được tạo
- Dữ liệu mẫu đã được thêm

### 2. **Backend PHP** ✅
- Server: `http://localhost:8000`
- API endpoints hoạt động
- Authentication system sẵn sàng

### 3. **Frontend React** ✅
- Server: `http://localhost:5173`
- UI components đã load
- API integration hoạt động

---

## 🔗 **TRUY CẬP HỆ THỐNG**

### **Trang Chủ**
```
http://localhost:5173
```

### **Đăng Nhập Admin**
```
URL: http://localhost:5173/login
Email: admin@admin.com
Password: 123456
```

### **Đăng Nhập User**
```
URL: http://localhost:5173/login
Email: test@test.com
Password: 123456
```

### **Admin Panel**
```
http://localhost:5173/admin/templates
```

### **Collection Templates**
```
http://localhost:5173/collection
```

### **Management Dashboard**
```
http://localhost:5173/management
```

---

## 🛠️ **API ENDPOINTS**

### **Authentication**
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /api/auth/me` - Thông tin user

### **Templates**
- `GET /api/templates` - Danh sách templates
- `POST /api/templates` - Tạo template (Admin)
- `GET /api/categories` - Danh mục

### **Invitations**
- `GET /api/invitations` - Danh sách thiệp
- `POST /api/invitations/from-template` - Tạo từ template
- `PUT /api/invitations/{id}` - Cập nhật thiệp
- `POST /api/invitations/{id}/publish` - Xuất bản

---

## 🎯 **TÍNH NĂNG CHÍNH**

### **1. Trang Chủ**
- Hero section với animation
- Template showcase
- Statistics display
- Responsive design

### **2. Collection Page**
- Grid layout templates
- Filter & search
- Category navigation
- Template preview

### **3. Ultimate HTML Editor**
- Visual form editor
- Real-time preview
- Image upload
- Music integration
- Custom fields support

### **4. Management Dashboard**
- Stats overview
- Invitation management
- Status tracking
- CRUD operations

### **5. Admin Panel**
- Template creation
- User management
- System analytics
- Content management

---

## 🔧 **TROUBLESHOOTING**

### **Nếu Backend không chạy:**
```bash
cd backend
php -S localhost:8000 -t public
```

### **Nếu Frontend không chạy:**
```bash
cd frontend
npm install
npm run dev
```

### **Nếu Database lỗi:**
1. Mở phpMyAdmin
2. Import lại: `backend/database/reset_clean_database.sql`
3. Kiểm tra connection trong `backend/config/app.php`

### **Nếu API không hoạt động:**
1. Kiểm tra CORS settings
2. Verify database connection
3. Check `.htaccess` file

---

## 📱 **RESPONSIVE DESIGN**

### **Mobile (< 768px)**
- Touch-friendly interface
- Optimized forms
- Mobile navigation
- Swipe gestures

### **Tablet (768px - 1024px)**
- Grid layouts
- Touch interactions
- Responsive images
- Adaptive typography

### **Desktop (> 1024px)**
- Full feature set
- Multi-column layouts
- Hover effects
- Keyboard shortcuts

---

## 🎨 **TEMPLATE SYSTEM**

### **Canvas Templates**
- Visual drag & drop
- Element positioning
- Style customization
- Export capabilities

### **HTML Templates**
- Full HTML/CSS/JS
- Data-editable attributes
- Dynamic content
- Music integration

### **Premium Features**
- Advanced animations
- Multiple layouts
- Custom fonts
- Priority support

---

## 🔐 **SECURITY FEATURES**

### **Authentication**
- JWT token system
- Password hashing (bcrypt)
- Session management
- Role-based access

### **Data Protection**
- Input validation
- SQL injection prevention
- XSS protection
- File upload security

### **Privacy**
- Private invitations
- Password protection
- Guest access control
- GDPR compliance

---

## 📊 **PERFORMANCE**

### **Frontend Optimization**
- Code splitting
- Lazy loading
- Image optimization
- Bundle optimization

### **Backend Performance**
- Database indexing
- Query optimization
- Caching strategies
- API rate limiting

---

## 🚀 **NEXT STEPS**

### **Immediate Actions**
1. ✅ Test login functionality
2. ✅ Create sample invitation
3. ✅ Test template system
4. ✅ Verify admin panel

### **Development Tasks**
- [ ] Add more templates
- [ ] Implement payment system
- [ ] Add email notifications
- [ ] Mobile app development

### **Production Deployment**
- [ ] Server configuration
- [ ] Domain setup
- [ ] SSL certificate
- [ ] CDN integration

---

## 📞 **SUPPORT**

### **Documentation**
- API documentation: `/api/docs`
- User guide: Available in system
- Developer docs: Code comments

### **Contact**
- Technical support: Available
- Bug reports: GitHub issues
- Feature requests: Contact admin

---

*Hệ thống đã sẵn sàng sử dụng! 🎉*

**Truy cập:** `http://localhost:5173`  
**Admin:** `admin@admin.com` / `123456`  
**User:** `test@test.com` / `123456`