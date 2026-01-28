@echo off
echo Moving Logo9.jpg to correct location...

REM Create directory if not exists
if not exist "frontend\public\assets\images" mkdir "frontend\public\assets\images"

REM Copy file (keep original as backup)
copy "frontend\src\public\asset\images\Logo9.jpg" "frontend\public\assets\images\Logo9.jpg"

echo Done! Logo moved to: frontend\public\assets\images\Logo9.jpg
echo You can now use it with: /assets/images/Logo9.jpg
pause
