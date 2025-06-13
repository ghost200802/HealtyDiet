@echo off
cd /d "%~dp0Tools"
python get_food_types.py
python process_foods.py
python process_dishsRaw.py
python process_dishs.py
pause