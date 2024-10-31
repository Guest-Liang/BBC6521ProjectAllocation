import json

def split_json_by_custom_ranges(input_file, output_dir, id_ranges):
    """
    根据指定的id范围将JSON数据保存到不同的文件中
    :param input_file: 输入的JSON文件路径
    :param output_dir: 输出的文件目录
    :param id_ranges: 指定的id范围列表，每个范围是一个元组 (start_id, end_id)
    """
    # 读取 JSON 文件
    with open(input_file, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    # 初始化用于存储分区数据的字典
    split_data = {f"{start}_{end}": [] for start, end in id_ranges}
    
    # 将每条记录放入对应的范围分区中
    for record in data:
        record_id = record["i"]
        for start, end in id_ranges:
            if start <= record_id <= end:
                split_data[f"{start}_{end}"].append(record)
                break
    
    # 将每个范围的数据保存到独立的 JSON 文件
    for range_key, records in split_data.items():
        if records:  # 仅当有数据时才保存
            output_file = f"{output_dir}/data_{range_key}.json"
            with open(output_file, 'w', encoding='utf-8') as out_file:
                json.dump(records, out_file, ensure_ascii=False, indent=4)
            print(f"Saved {len(records)} records to {output_file}")

# 使用示例
custom_ranges = [
    (1, 69462), 
    (69463, 265590), 
    (265591, 461718), 
    (461719, 657846),
    (657847, 853974),
    (853975, 1050102),
    (1050103, 1246230),
    (1246231, 1442358),
    (1442359, 1638486)
] 
split_json_by_custom_ranges('../QMULProjectRecord_bak/1031_zip.json', './jsondata', custom_ranges)
