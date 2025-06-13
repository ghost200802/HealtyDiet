import json
import os
import sys

# 获取当前脚本所在目录
current_dir = os.path.dirname(os.path.abspath(__file__))

# 设置输入和输出路径
dishs_raw_file = os.path.join(current_dir, '..', 'HealtyDiet_Project', 'data', 'dishs', 'dishsRaw.json')
dishs_file = os.path.join(current_dir, '..', 'HealtyDiet_Project', 'data', 'dishs', 'dishs.json')
foods_types_file = os.path.join(current_dir, '..', 'HealtyDiet_Project', 'data', 'foods', 'foodTypes.json')
output_file = os.path.join(current_dir, 'missing_ingredients.json')

# 食物类别文件路径字典
food_files = {}

def load_food_types():
    """加载食物类型定义"""
    try:
        with open(foods_types_file, 'r', encoding='utf-8') as f:
            food_types_data = json.load(f)
            return food_types_data['foodTypes']
    except Exception as e:
        print(f"加载食物类型文件时出错: {e}")
        sys.exit(1)

def load_all_foods(food_types):
    """加载所有食物数据"""
    all_foods = {}
    food_aliases = {}  # 用于存储食物别名到食物名称的映射
    
    for food_type, type_info in food_types.items():
        file_name = type_info.get('fileName')
        if file_name:
            food_file_path = os.path.join(current_dir, '..', 'HealtyDiet_Project', 'data', 'foods', file_name)
            food_files[food_type] = food_file_path
            
            try:
                with open(food_file_path, 'r', encoding='utf-8') as f:
                    food_data = json.load(f)
                    # 将每个食物类型的数据合并到总字典中
                    if food_type in food_data:
                        for food_id, food_info in food_data[food_type].items():
                            # 使用食物名称作为键
                            if 'name' in food_info:
                                food_name = food_info['name']
                                food_data = {
                                    'id': food_info['id'],
                                    'type': food_type,
                                    'subType': food_info.get('subType', '')
                                }
                                
                                # 添加主名称到食物字典
                                all_foods[food_name] = food_data
                                
                                # 处理别名列表
                                aliases = food_info.get('alias', [])
                                if aliases:
                                    for alias in aliases:
                                        # 将每个别名也添加到食物字典中，指向相同的数据
                                        food_aliases[alias] = food_name
            except Exception as e:
                print(f"加载食物文件 {file_name} 时出错: {e}")
    
    return all_foods, food_aliases

def load_dishes():
    """加载所有菜品数据"""
    try:
        with open(dishs_raw_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"加载菜品文件时出错: {e}")
        sys.exit(1)

def check_ingredients(dishes, all_foods, food_aliases):
    """检查菜品中的食材是否存在于食物数据库中"""
    missing_ingredients = {}
    
    for dish_id, dish_info in dishes.items():
        dish_name = dish_info.get('name', f'未命名菜品 {dish_id}')
        foods_list = dish_info.get('foods', [])
        
        # 检查每个食材
        missing_in_dish = []
        for ingredient in foods_list:
            # 首先检查食材名称是否直接匹配
            if ingredient in all_foods:
                continue
            # 然后检查食材名称是否匹配别名
            elif ingredient in food_aliases:
                continue
            else:
                missing_in_dish.append(ingredient)
        
        # 如果有缺失的食材，添加到结果中
        if missing_in_dish:
            missing_ingredients[dish_id] = {
                'name': dish_name,
                'missing_ingredients': missing_in_dish
            }
    
    return missing_ingredients

def collect_all_ingredients(dishes):
    """收集所有菜品中的食材并去重"""
    all_ingredients = set()
    
    for dish_id, dish_info in dishes.items():
        foods_list = dish_info.get('foods', [])
        for ingredient in foods_list:
            all_ingredients.add(ingredient)
    
    # 转换为排序后的列表
    return sorted(list(all_ingredients))

def collect_all_missing_ingredients(missing_ingredients):
    """收集所有缺失的食材并去重"""
    all_missing = set()
    
    for dish_id, dish_info in missing_ingredients.items():
        missing_list = dish_info.get('missing_ingredients', [])
        for ingredient in missing_list:
            all_missing.add(ingredient)
    
    # 转换为排序后的列表
    return sorted(list(all_missing))

def remove_dishes_with_missing_ingredients(dishes, missing_ingredients):
    """从菜品数据中移除含有缺失食材的菜品"""
    # 创建一个新的菜品字典，只包含没有缺失食材的菜品
    filtered_dishes = {}
    removed_count = 0
    
    for dish_id, dish_info in dishes.items():
        # 如果菜品ID不在缺失食材列表中，则保留该菜品
        if dish_id not in missing_ingredients:
            filtered_dishes[dish_id] = dish_info
        else:
            removed_count += 1
    
    print(f"已移除 {removed_count} 道含有缺失食材的菜品")
    return filtered_dishes

def convert_ingredients_to_ids(dishes, all_foods, food_aliases):
    """将菜品中的食材名称转换为食材ID，忽略找不到的食材"""
    converted_dishes = {}
    missing_count = 0
    
    for dish_id, dish_info in dishes.items():
        # 创建菜品的副本
        converted_dish = dish_info.copy()
        foods_list = dish_info.get('foods', [])
        foods_ids = []
        
        # 转换每个食材名称为ID，忽略找不到的食材
        for ingredient in foods_list:
            # 直接匹配食物名称
            if ingredient in all_foods:
                food_id = all_foods[ingredient]['id']
                foods_ids.append(food_id)
            # 通过别名匹配食物
            elif ingredient in food_aliases:
                food_name = food_aliases[ingredient]
                food_id = all_foods[food_name]['id']
                foods_ids.append(food_id)
            else:
                # 找不到的食材，记录但不添加到foods_ids
                missing_count += 1
        
        # 更新菜品的食材列表为ID列表
        converted_dish['foods'] = foods_ids
        converted_dishes[dish_id] = converted_dish
    
    if missing_count > 0:
        print(f"注意：有 {missing_count} 个食材未找到，已从foods字段中忽略")
    
    return converted_dishes

def main():
    print("开始检查菜品中的食材...")
    
    # 加载食物类型
    food_types = load_food_types()
    print(f"已加载 {len(food_types)} 种食物类型")
    
    # 加载所有食物
    all_foods, food_aliases = load_all_foods(food_types)
    print(f"已加载 {len(all_foods)} 种食物，{len(food_aliases)} 个食物别名")
    
    # 加载所有菜品
    dishes = load_dishes()
    print(f"已加载 {len(dishes)} 道菜品")
    
    # 收集所有食材并去重
    all_ingredients = collect_all_ingredients(dishes)
    print(f"菜品中共有 {len(all_ingredients)} 种不同的食材")
    
    # 检查食材
    missing_ingredients = check_ingredients(dishes, all_foods, food_aliases)
    
    # 收集所有缺失的食材并去重
    all_missing = collect_all_missing_ingredients(missing_ingredients)
    print(f"菜品中共有 {len(all_missing)} 种不同的缺失食材")
    
    # 不再移除含有缺失食材的菜品，直接使用原始数据
    print(f"保留所有 {len(dishes)} 道菜品，包括那些含有缺失食材的菜品")
    
    # 将食材名称转换为ID，忽略找不到的食材
    converted_dishes = convert_ingredients_to_ids(dishes, all_foods, food_aliases)
    print(f"已将 {len(converted_dishes)} 道菜品的食材名称转换为ID")
    
    # 将转换后的菜品数据保存到dishs.json文件
    with open(dishs_file, 'w', encoding='utf-8') as f:
        json.dump(converted_dishes, f, ensure_ascii=False, indent=4)
    print(f"已将转换后的菜品数据保存到 {dishs_file}")
    
    # 输出结果
    result = {
        "missing_ingredients": missing_ingredients,
        "all_unique_ingredients": all_ingredients,
        "all_unique_missing_ingredients": all_missing
    }
    
    # 保存到JSON文件
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=4)
    
    print(f"结果已保存到 {output_file}")
    
    # 打印部分结果
    if missing_ingredients:
        print(f"\n发现 {len(missing_ingredients)} 道菜品中有缺失的食材，但这些菜品仍被保留")
        print("\n部分缺失食材示例:")
        count = 0
        for dish_id, info in missing_ingredients.items():
            print(f"菜品: {info['name']} (ID: {dish_id})")
            print(f"缺失食材: {', '.join(info['missing_ingredients'])}")
            count += 1
            if count >= 5:  # 只显示前5个
                break
        print("\n注意：这些缺失的食材不会被添加到最终的foods字段中")
    else:
        print("所有菜品中的食材都存在于食物数据库中")
    
    print(f"\n所有去重后的食材已保存到 {output_file} 文件中的 'all_unique_ingredients' 字段")
    print(f"所有去重后的缺失食材已保存到 {output_file} 文件中的 'all_unique_missing_ingredients' 字段")

if __name__ == "__main__":
    main()