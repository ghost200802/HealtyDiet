import pandas as pd
import json
import os

# 文件路径
excel_file = 'foods.xlsx'
food_types_json = '..\\HealtyDiet_Project\\data\\foods\\foodTypes.json'

def main():
    # 获取所有标签页名称
    sheet_names = pd.ExcelFile(excel_file).sheet_names
    print(f'Excel 文件中的标签页: {sheet_names}')
    
    # 初始化食物类型字典
    food_types_data = {"foodTypes": {}}
    
    # 尝试读取现有的 foodTypes.json 文件
    try:
        if os.path.exists(food_types_json):
            with open(food_types_json, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
                if "foodTypes" in existing_data:
                    food_types_data["foodTypes"] = existing_data["foodTypes"]
    except Exception as e:
        print(f"读取现有 foodTypes.json 文件时出错: {e}")
    
    # 处理每个标签页
    for sheet_name in sheet_names:
        print(f'\n处理标签页: {sheet_name}')
        # 读取当前标签页
        df = pd.read_excel(excel_file, sheet_name=sheet_name)
        
        # 提取当前标签页中的食物类型和子类型
        for food_type in df['type'].unique():
            if pd.notna(food_type) and isinstance(food_type, str):
                # 如果食物类型不在字典中，则添加
                if food_type not in food_types_data["foodTypes"]:
                    food_types_data["foodTypes"][food_type] = {
                        "subTypes": [],
                        "fileName": f"{food_type}.json"
                    }
                
                # 提取子类型
                subtypes = df[df['type'] == food_type]['subType'].unique()
                for subtype in subtypes:
                    if pd.notna(subtype) and isinstance(subtype, str):
                        # 如果子类型不在列表中，则添加
                        if subtype not in food_types_data["foodTypes"][food_type]["subTypes"]:
                            food_types_data["foodTypes"][food_type]["subTypes"].append(subtype)
    
    # 打印提取的食物类型和子类型
    print("\n提取的食物类型和子类型:")
    for food_type, info in food_types_data["foodTypes"].items():
        print(f"\n{food_type}:")
        print(f"  文件名: {info.get('fileName', '')}")
        print(f"  子类型: {', '.join(info.get('subTypes', []))}")
    
    # 将数据格式化为 JSON 字符串
    json_str = json.dumps(food_types_data, ensure_ascii=False, indent=4)
    print("\n生成的 JSON 数据:")
    print(json_str)
    
    # 如果文件存在，先删除
    if os.path.exists(food_types_json):
        os.remove(food_types_json)
        print(f"已删除现有的 {food_types_json} 文件")
    
    # 直接保存到文件，不询问
    with open(food_types_json, 'w', encoding='utf-8') as f:
        f.write(json_str)
    print(f"数据已保存到 {food_types_json}")

if __name__ == "__main__":
    main()