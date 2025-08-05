@echo off
git add .
git commit -m "Auto-save: %date% %time%"
git push origin main
