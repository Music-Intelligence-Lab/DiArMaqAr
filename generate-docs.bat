@echo off
echo Generating TypeScript documentation...
npm run docs
echo.
echo Opening documentation in browser...
start docs/api/index.html
echo.
echo Documentation generated successfully!
echo You can find it at: docs/api/index.html
pause
