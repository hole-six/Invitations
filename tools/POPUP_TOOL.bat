@echo off
chcp 65001 >nul
title ULTIMATE EDITABLE MAKER
color 0A
cls

echo.
echo ========================================
echo    ULTIMATE EDITABLE MAKER
echo ========================================
echo.
echo Tool tu dong them:
echo    - data-editable cho TEXT
echo    - data-image-editable cho IMAGE
echo.
echo Dat ten thong minh dua tren noi dung
echo Backup tu dong truoc khi sua
echo.
echo ========================================
echo.
echo Dang khoi dong GUI...
echo.

cd /d "%~dp0"
python ULTIMATE_EDITABLE_TOOL.py

if %errorlevel% neq 0 (
    echo.
    echo Co loi xay ra!
    echo Vui long kiem tra da cai Python chua.
    echo.
    pause
) else (
    echo.
    echo Tool da dong!
    timeout /t 2 >nul
)