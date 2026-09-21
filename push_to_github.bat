@echo off
set "PATH=C:\Users\User\AppData\Local\Programs\Git\cmd;%PATH%"

echo ===================================================
echo   Pushing QR Restaurant System to GitHub
echo   User: Hasan-Hirsi-Hussein
echo ===================================================
echo.

git remote remove origin 2>nul
git remote add origin https://github.com/Hasan-Hirsi-Hussein/qr-restaurant-ordering-system.git
git branch -M main

echo Hubi inaad marka hore repository-ga cusub ka samaysay:
echo https://github.com/new (Magaca: qr-restaurant-ordering-system)
echo.
echo Waxaa hadda bilaabmaya shubista (Pushing to GitHub)...
echo Haddii daaqad login ah kuu soo baxdo, fadlan saxiix (Sign in).
echo.

git push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ===================================================
    echo   GUUL! Code-kii si buuxda ayaa loogu shubay:
    echo   https://github.com/Hasan-Hirsi-Hussein/qr-restaurant-ordering-system
    echo ===================================================
) else (
    echo ===================================================
    echo   Haddii ay khalad ku tusto:
    echo   1. Hubi inaad https://github.com/new ka abuurtay: qr-restaurant-ordering-system
    echo   2. Mar labaad ku celi amarkan.
    echo ===================================================
)
pause
