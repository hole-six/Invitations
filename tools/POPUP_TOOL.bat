@echo off
chcp 65001 >nul
title ULTIMATE EDITABLE MAKER
color 0A
cls
echo.
echo ========================================
echo   🔥 ULTIMATE EDITABLE MAKER 🔥
echo ========================================
echo.
echo 📌 Tool tự động thêm:
echo    - data-editable cho TEXT
echo    - data-image-editable cho IMAGE
echo.
echo 🎯 Đặt tên thông minh dựa trên nội dung
echo 💾 Backup tự động trước khi sửa
echo.
echo ========================================
echo.
echo Đang khởi động GUI...
echo.

cd /d "%~dp0"
python ULTIMATE_EDITABLE_TOOL.py

if %errorlevel% neq 0 (
    echo.
    echo ❌ Có lỗi xảy ra!
    echo Vui lòng kiểm tra đã cài Python chưa.
    echo.
    pause
) else (
    echo.
    echo ✅ Tool đã đóng!
    timeout /t 2 >nul
)
