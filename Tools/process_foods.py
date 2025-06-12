import pandas as pd
import json
import os
import numpy as np
from pathlib import Path

# 文件路径
excel_file = 'foods.xlsx'
food_types_json = '..\\HealtyDiet_Project\\data\\foods\\foodTypes.json'
output_dir = '..\\HealtyDiet_Project\\data\\foods'

def main():
    try:
        # 获取所有标签页名称
        print(f"正在读取Excel文件: {excel_file}")
        sheet_names = pd.ExcelFile(excel_file).sheet_names
        print(f"Excel文件中的标签页: {sheet_names}")
        
        # 读取foodTypes.json文件
        try:
            with open(food_types_json, 'r', encoding='utf-8') as f:
                existing_types = json.load(f)
                print(f"成功读取foodTypes.json文件")
        except Exception as e:
            print(f"读取foodTypes.json文件时出错: {e}")
            return
        
        # 确保foodTypes存在
        if 'foodTypes' not in existing_types:
            print("foodTypes.json文件格式不正确，缺少'foodTypes'键")
            return
        
        food_types_data = existing_types['foodTypes']
        
        # 处理每个标签页，按Type分组并导出到对应的JSON文件
        for sheet_name in sheet_names:
            print(f"\n处理标签页: {sheet_name}")
            # 读取当前标签页
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            # 显示Excel文件的前几行和列名，用于调试
            print(f"标签页 {sheet_name} 的前5行:")
            print(df.head())
            print(f"列名: {df.columns.tolist()}")
            
            # 获取当前标签页中的所有唯一食物类型
            unique_types = set(df['type'].dropna().unique())
            
            # 按Type分组并导出到对应的JSON文件
            for food_type in unique_types:
                # 检查该类型是否在foodTypes.json中定义
                if food_type in food_types_data:
                    # 获取文件名
                    file_name = food_types_data[food_type].get('fileName', f"{food_type}.json")
                    
                    # 过滤出当前Type的所有食物，并且只保留有id的行
                    type_foods_df = df[(df['type'] == food_type) & (df['id'].notna())].copy()
                    
                    # 处理NaN值，将其替换为None（在JSON中会转换为null）
                    # 对于servingSize列，如果为NaN，设置默认值为100
                    type_foods_df['servingSize'] = type_foods_df['servingSize'].fillna(100)
                    
                    # 确保id字段为整数类型
                    if 'id' in type_foods_df.columns:
                        type_foods_df['id'] = type_foods_df['id'].astype(int)
                    
                    # 将其他列的NaN值替换为None
                    type_foods = type_foods_df.replace({np.nan: None}).to_dict('records')
                    
                    # 重构数据结构以匹配foods.json格式
                    for food in type_foods:
                        # 处理alias别名字段，将逗号分隔的别名转换为列表
                        if 'alias' in food and food['alias'] is not None:
                            food['alias'] = [alias.strip() for alias in str(food['alias']).split(',') if alias.strip()]
                        else:
                            food['alias'] = []
                            
                        food['vitamins'] = {
                            "A": food.pop('vitaminA', 0),
                            "C": food.pop('vitaminC', 0),
                            "D": food.pop('vitaminD', 0),
                            "E": food.pop('vitaminE', 0)
                        }
                        food['minerals'] = {
                            "calcium": food.pop('calcium', 0),
                            "iron": food.pop('iron', 0),
                            "magnesium": food.pop('magnesium', 0),
                            "potassium": food.pop('potassium', 0)
                        }
                    
                    # 构建输出文件路径
                    output_file = os.path.join(output_dir, file_name)
                    
                    # 将食物列表转换为以id为key的字典
                    foods_by_id = {}
                    for food in type_foods:
                        # 由于我们已经在前面过滤了没有id的行，这里应该所有食物都有id
                        foods_by_id[str(food['id'])] = food
                    
                    # 保存到JSON文件
                    with open(output_file, 'w', encoding='utf-8') as f:
                        json.dump({food_type: foods_by_id}, f, ensure_ascii=False, indent=4)
                    
                    print(f"已导出 {food_type} 类型的食物到 {output_file}")
                else:
                    print(f"警告: 食物类型 '{food_type}' 在foodTypes.json中未定义，跳过导出")
        
        print("处理完成!")
        
    except Exception as e:
        print(f"处理过程中出错: {e}")

if __name__ == "__main__":
    main()