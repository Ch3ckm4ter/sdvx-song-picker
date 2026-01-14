import json
import os
from pathlib import Path

# 현재 파일의 디렉토리 기준으로 상대 경로 설정
current_dir = Path(__file__).parent
data_folder = current_dir / 'data'

# List to store all data
merged_data = []

# Read all JSON files from the data folder
for json_file in sorted(data_folder.glob('*.json')):
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # If the JSON file contains a list, extend; otherwise append
            if isinstance(data, list):
                merged_data.extend(data)
            else:
                merged_data.append(data)
        print(f"✓ Merged: {json_file.name}")
    except Exception as e:
        print(f"✗ Error reading {json_file.name}: {e}")

# Write the merged data to data.json
output_file = current_dir / 'data.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(merged_data, f, indent=2, ensure_ascii=False)

print(f"\n✓ Successfully merged {len(merged_data)} items into {output_file}")