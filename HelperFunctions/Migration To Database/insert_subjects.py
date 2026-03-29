import mysql.connector
import pandas as pd

conn = mysql.connector.connect(
    host = 'localhost',
    user = 'root',
    password = 'subhojit@mysql',
    database = 'exam_performance_db'
)

cursor = conn.cursor()

subject_code_map_path = '../../CSVs/subjects_code_map.csv'

df = pd.read_csv(subject_code_map_path)

for index, row in df.iterrows():
    subject_code = str(row['subject_code']).strip()
    subject_name = str(row['subject_name']).strip()
    short_name = str(row['short_name']).strip()[:10] if pd.notna(row.get('short_name')) else subject_code[:10]

    cursor.execute("""INSERT IGNORE INTO Subjects(subject_code, subject_name, short_name, credits)
    VALUES (%s, %s, %s, %s)
    """, (subject_code, subject_name, short_name, 0))

conn.commit()
cursor.close()
conn.close()
