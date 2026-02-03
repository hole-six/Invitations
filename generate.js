const fs = require("fs");
const path = require("path");

const prefix = "mau";      // tên (tách riêng)
const start = 1;
const end = 100;

// path generate-html
const outputDir = path.join(__dirname, "generate-html");

// tạo folder nếu chưa có
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

for (let i = start; i <= end; i++) {
  const fileName = `${prefix}${i}.html`;
  const filePath = path.join(outputDir, fileName);

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${prefix} ${i}</title>
</head>
<body>
  <h1>Tên mẫu: ${prefix}</h1>
  <p>Số thứ tự: ${i}</p>
</body>
</html>
`.trim();

  fs.writeFileSync(filePath, html, "utf8");
}

console.log("✅ Đã tạo file trong thư mục generate-html");
