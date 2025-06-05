import json
import csv

# 读取JSON文件
with open('../HealtyDiet_Project/data/foods/foods.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
    foods = data['foods']

# 准备CSV文件
with open('foods.csv', 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.writer(csvfile)
    
    # 写入表头
    writer.writerow(['id', 'name', 'calories', 'protein', 'carbs', 'fat', 
                    'vitaminA', 'vitaminC', 'vitaminD', 'vitaminE',
                    'calcium', 'iron', 'magnesium', 'potassium',
                    'servingSize', 'unit', 'description'])
    
    # 写入数据
    for food in foods:
        writer.writerow([
            food['id'],
            food['name'],
            food['calories'],
            food['protein'],
            food['carbs'],
            food['fat'],
            food['vitamins']['A'],
            food['vitamins']['C'],
            food['vitamins']['D'],
            food['vitamins']['E'],
            food['minerals']['calcium'],
            food['minerals']['iron'],
            food['minerals']['magnesium'],
            food['minerals']['potassium'],
            food['servingSize'],
            food['unit'],
            food['description']
        ])

print("CSV文件已成功生成！")