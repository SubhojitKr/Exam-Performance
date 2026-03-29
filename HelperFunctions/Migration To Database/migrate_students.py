import os
import json
import pandas as pd
import mysql.connector

conn = mysql.connector.connect(
    host = 'localhost',
    user = 'root',
    password = 'subhojit@mysql',
    database = 'exam_performance_db'
)
cursor = conn.cursor()

with open('../../directory_map.json', 'r') as f:
    directory_map = json.load(f)


def get_batch_id(cursor, prog_name, batch_year):
    cursor.execute("""
                   SELECT B.batch_id FROM Batches B
                   JOIN Programs P ON B.program_id = P.program_id
                   WHERE P.program_name = %s AND B.batch_year = %s
                   """, (prog_name, batch_year))
    result = cursor.fetchone()
    return result[0] if result else None

def migrate_students():
    total_students_inserted = 0
    try:
        for school_name, departments in directory_map.items():
            for dept_name, programs in departments.items():
                for prog_name_raw, batches in programs.items():
                    prog_name = prog_name_raw.replace('_', ' ')

                    if isinstance(batches, dict):
                        for batch_year, semester_files in batches.items():

                            # 1. Look up the Batch ID from the DB
                            batch_id = get_batch_id(cursor, prog_name, batch_year)
                            if not batch_id: continue

                            # 2. Process each CSV file in the batch
                            for sem_file in semester_files:

                                # Construct the full CSV path
                                file_path = os.path.join(
                                    './Datasets',
                                    school_name,
                                    dept_name,
                                    prog_name_raw,
                                    batch_year,
                                    sem_file
                                ).replace("\\", "/")

                                if not os.path.exists(file_path): continue

                                df = pd.read_csv(file_path).where(pd.notnull, None)

                                # Insert Students from this CSV
                                for _, row in df.iterrows():

                                    # Data preparation (using defaults if columns are missing)
                                    enrollment = str(row['Enrollment'])
                                    name = row['Name']
                                    p_type = row.get('Program_Type', 'Regular')

                                    cursor.execute("""
                                                   INSERT IGNORE INTO Students (enrollment_no, name, section, program_type, batch_id) 
                                        VALUES (%s, %s, %s, %s, %s)
                                                   """, (enrollment, name, '-', p_type, batch_id))
                                    total_students_inserted += 1

        conn.commit()
        print(f"Total student records processed: {total_students_inserted}")

    except Exception as e:
        print(f"\n❌ Error during student migration: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    import os
    migrate_students()