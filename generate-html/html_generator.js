const fs = require('fs');
const path = require('path');

// Lấy đường dẫn thư mục hiện tại (cùng thư mục với file script này: generate-html)
const outputDir = __dirname;

for (let i = 105; i <= 200; i++) {
    const filename = `mau${i}.html`;
    const filepath = path.join(outputDir, filename);

    // Nội dung HTML mẫu cơ bản. Dễ dàng cho bạn paste code đè lên sau này.
    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mẫu thiệp ${i}</title>
</head>
<body>
    <!-- Paste mã HTML của mẫu ${i} vào đây -->
</body>
</html>`;

    // Ghi file
    fs.writeFileSync(filepath, htmlContent, 'utf8');
    console.log(`Đã tạo: ${filename}`);
}

console.log("-----------------------------------------------------");
console.log("HOÀN TẤT TẠO FILE TỪ mau105.html ĐẾN mau200.html!");
console.log("-----------------------------------------------------");