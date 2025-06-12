@echo off
cd /d "%~dp0Tools"
python process_foods.py
python process_dishs.py
pause