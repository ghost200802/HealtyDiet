import pandas as pd
import os
import json
import numpy as np

# 获取当前脚本所在目录
current_dir = os.path.dirname(os.path.abspath(__file__))

# 设置输入和输出路径
excel_file = os.path.join(current_dir, 'dishs.xlsx')
output_file = os.path.join(current_dir, '..', 'HealtyDiet_Project', 'data', 'dishs', 'dishsRaw.json')

# 确保输出目录存在
os.makedirs(os.path.dirname(output_file), exist_ok=True)

print(f"当前工作目录: {os.getcwd()}")
print(f"Excel文件: {excel_file}")
print(f"输出文件: {output_file}")

try:
    # 读取Excel文件中的所有sheet
    print("读取Excel文件...")
    xls = pd.ExcelFile(excel_file)
    sheet_names = xls.sheet_names
    print(f"找到 {len(sheet_names)} 个工作表: {', '.join(sheet_names)}")
    
    # 初始化所有菜品的字典
    all_dishes = {}
    
    # 处理每个工作表
    for sheet_name in sheet_names:
        print(f"\n处理工作表: {sheet_name}")
        
        # 读取工作表数据
        df = pd.read_excel(excel_file, sheet_name=sheet_name)
        
        # 显示列名，以便了解数据结构
        print(f"列名: {', '.join(df.columns.tolist())}")
        
        # 处理每行数据
        for index, row in df.iterrows():
            # 跳过没有ID的行
            if pd.isna(row.get('id')):
                continue
                
            dish_id = str(int(row['id']))  # 确保ID是字符串
            
            # 创建菜品数据字典
            dish_data = {
                'id': int(row['id']),
            }
            
            # 处理type字段 - 转换为数组
            if 'type' in row and not pd.isna(row['type']):
                type_value = str(row['type'])
                if ',' in type_value or '，' in type_value or '、' in type_value:
                    types = [t.strip() for t in type_value.replace('，', ',').replace('、', ',').split(',')]
                    dish_data['type'] = types
                else:
                    dish_data['type'] = [type_value]
            
            # 处理name字段
            if 'name' in row and not pd.isna(row['name']):
                dish_data['name'] = str(row['name'])
            
            # 处理foods字段 - 转换为数组
            if 'foods' in row and not pd.isna(row['foods']):
                foods_value = str(row['foods'])
                if ',' in foods_value or '，' in foods_value or '、' in foods_value:
                    foods = [f.strip() for f in foods_value.replace('，', ',').replace('、', ',').split(',')]
                    dish_data['foods'] = foods
                else:
                    dish_data['foods'] = [foods_value]
            
            # 将菜品添加到总字典中
            all_dishes[dish_id] = dish_data
    
    # 打印处理结果
    print(f"\n共处理了 {len(all_dishes)} 个菜品")
    
    # 保存到JSON文件
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_dishes, f, ensure_ascii=False, indent=4)
    
    print(f"所有菜品数据已保存到 {output_file}")
    print("处理完成!")
    
except Exception as e:
    print(f"\n发生错误: {e}")