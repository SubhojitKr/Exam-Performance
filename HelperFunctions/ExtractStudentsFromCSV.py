import pandas as pd
import mysql.connector

DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = "subhojit@mysql"
DB_NAME = "exam_performance_db"
CSV_FILE = "../CSVs/student_master.csv"

def connect_db():
    return mysql.connector.connect(
        host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME
    )

def migrate():
    try:
        df = pd.read_csv(CSV_FILE).where(pd.notnull, None)
    except:
        return

    conn = connect_db()
    cursor = conn.cursor()
    conn.autocommit = False

    cursor.execute("SELECT P.program_name, B.batch_year, B.batch_id FROM Batches B JOIN Programs P ON B.program_id = P.program_id")
    batch_map = {(row[0], row[1]): row[2] for row in cursor.fetchall()}

    for _, row in df.iterrows():
        prog_name = str(row['program_name_raw']).replace('_', ' ')
        batch_year = str(row['batch_year'])

        batch_id = batch_map.get((prog_name, batch_year))

        if not batch_id: continue

        is_active = 1 if str(row['is_active']).lower() == 'true' else 0

        sql = """INSERT IGNORE INTO Students (enrollment_no, name, section, program_type, batch_id, phone_number, email, entry_year, status, is_active) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        val = (
            str(row['enrollment_no']),
            row['name'],
            row['section'],
            row['program_type'],
            batch_id,
            row['phone_number'],
            row['email'],
            row['entry_year'],
            row['status'],
            is_active
        )

        cursor.execute(sql, val)

    conn.commit()
    cursor.close()
    conn.close()

if __name__ == "__main__":
    migrate()