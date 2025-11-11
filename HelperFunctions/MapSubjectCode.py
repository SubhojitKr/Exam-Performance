import pandas as pd
import json

csv_file_path = '../CSVs/subjects_code_map.csv'
json_file_path = '../subjects_code_map.json'

try:
    map_df = pd.read_csv(csv_file_path)
    subject_map_dict = {}

    for index, row in map_df.iterrows():
        subject_code = str(row['code'])

        subject_info = {
            "name": str(row['name']),
            "short": str(row['short'])
        }

        subject_map_dict[subject_code] = subject_info

    with open(json_file_path, 'w') as json_file:
        json.dump(subject_map_dict, json_file, indent=4)

except Exception as e:
    print(e)