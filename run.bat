@echo off
chcp 65001 >nul
echo ========================================================
echo   R&L Fitness - 10-Slide Workout Web Application
echo   מערכת אימון אינטראקטיבית ב-10 שלבים (עברית RTL + 3D)
echo ========================================================
echo.

where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] הפעלת השרת באמצעות Python Launcher...
    py -3.11 app.py || py app.py
    goto end
)

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] הפעלת השרת באמצעות python...
    python app.py
    goto end
)

if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
    echo [OK] הפעלת השרת מנתיב Python 3.11 המותקן...
    "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" app.py
    goto end
)

echo [שגיאה] לא נמצא Python מותקן במערכת. אנא התקינו Python 3.9+ והריצו שוב.
pause

:end
