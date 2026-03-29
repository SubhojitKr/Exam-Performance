import os
import json
import pandas as pd
import mysql.connector
import re

# ================= CONFIGURATION =================
DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = "subhojit@mysql"  # <--- UPDATE THIS
DB_NAME = "exam_performance_db"
DIRECTORY_MAP_FILE = "../../directory_map.json"
DATASETS_DIR = "../../Datasets"
# =================================================

def connect_db():
    return mysql.connector.connect(
        host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME
    )

def clean_decimal(value):
    # 1. Handle Pandas/Numpy NaN directly
    if pd.isna(value):
        return None

    # 2. Handle Strings
    val_str = str(value).strip().upper()
    if not val_str or val_str in ['RA', 'NT', '-', 'NAN', 'NONE', 'AB', 'I']:
        return None

    # 3. Try conversion
    try:
        return float(val_str)
    except ValueError:
        return None

def get_mapping(cursor):
    # Batch Map
    cursor.execute("""
                   SELECT P.program_name, B.batch_year, B.batch_id
                   FROM Batches B JOIN Programs P ON B.program_id = P.program_id
                   """)
    batch_map = {(row[0], row[1]): row[2] for row in cursor.fetchall()}

    # Semester Map
    cursor.execute("SELECT batch_id, semester_number, semester_id FROM Semesters")
    semester_map = { (row[0], row[1]): row[2] for row in cursor.fetchall() }

    # Valid Students Map
    cursor.execute("SELECT enrollment_no FROM Students")
    valid_students = {row[0] for row in cursor.fetchall()}

    return batch_map, semester_map, valid_students

def migrate_grades():
    conn = connect_db()
    cursor = conn.cursor()
    conn.autocommit = False

    try:
        with open(DIRECTORY_MAP_FILE, 'r') as f:
            directory_map = json.load(f)

        batch_map, semester_map, valid_students = get_mapping(cursor)

        grades_count = 0
        summary_count = 0
        skipped_students = set()

        print("🚀 Starting Grade Migration...")

        for school, depts in directory_map.items():
            for dept, progs in depts.items():
                for prog_raw, batches in progs.items():
                    prog_name = prog_raw.replace('_', ' ')

                    if isinstance(batches, dict):
                        for batch_year, semester_files in batches.items():

                            batch_key = (prog_name, batch_year)
                            batch_id = batch_map.get(batch_key)
                            if not batch_id: continue

                            for sem_file in semester_files:
                                sem_match = re.search(r'(\d+)', sem_file)
                                sem_num = int(sem_match.group(1)) if sem_match else 0

                                sem_id = semester_map.get((batch_id, sem_num))
                                if not sem_id: continue

                                file_path = os.path.join(DATASETS_DIR, school, dept, prog_raw, batch_year, sem_file).replace("\\", "/")
                                if not os.path.exists(file_path): continue

                                # Read CSV
                                df = pd.read_csv(file_path, dtype={'Enrollment': str})

                                meta_cols = ['Name', 'Enrollment', 'SGPA', 'CGPA', 'Result', 'Gender', 'Performance', 'Program_Type', 'Section', 'S.No.']
                                subject_cols = [c for c in df.columns if c not in meta_cols]

                                for _, row in df.iterrows():
                                    enrollment = str(row.get('Enrollment', '')).strip()

                                    if enrollment not in valid_students:
                                        if enrollment not in skipped_students:
                                            skipped_students.add(enrollment)
                                        continue

                                    # 1. Insert Grades
                                    for sub_code in subject_cols:
                                        grade = str(row.get(sub_code, 'NT')).strip()
                                        if pd.isna(row.get(sub_code)) or grade.upper() == 'NAN': grade = 'NT'

                                        cursor.execute("""
                                                       INSERT IGNORE INTO Grades (enrollment_no, subject_code, semester_id, grade_code)
                                            VALUES (%s, %s, %s, %s)
                                                       """, (enrollment, sub_code, sem_id, grade))
                                        grades_count += 1

                                    # 2. Insert Summary
                                    raw_result = str(row.get('Result', '')).upper()

                                    # Safe Result Logic
                                    if raw_result and 'NAN' not in raw_result:
                                        if 'FAIL' in raw_result: db_result = 'FAIL'
                                        elif 'PASS' in raw_result: db_result = 'PASS'
                                        else: db_result = 'PROMOTED'
                                    else:
                                        # Fallback logic for missing Result column
                                        fail_count = 0
                                        failing_grades = ['F', 'FF', 'AB', 'I']
                                        for sub in subject_cols:
                                            g = str(row.get(sub, 'NT')).strip().upper()
                                            if g in failing_grades: fail_count += 1

                                        if fail_count == 0: db_result = 'PASS'
                                        elif fail_count > 5: db_result = 'FAIL'
                                        else: db_result = 'PROMOTED'

                                    # Clean SGPA/CGPA using the robust function
                                    sgpa = clean_decimal(row.get('SGPA'))
                                    cgpa = clean_decimal(row.get('CGPA'))

                                    cursor.execute("""
                                                   INSERT INTO Student_Semester_Summary
                                                       (enrollment_no, semester_id, sgpa, cgpa, result_status)
                                                   VALUES (%s, %s, %s, %s, %s)
                                                       ON DUPLICATE KEY UPDATE
                                                                            sgpa = VALUES(sgpa),
                                                                            cgpa = VALUES(cgpa),
                                                                            result_status = VALUES(result_status)
                                                   """, (enrollment, sem_id, sgpa, cgpa, db_result))
                                    summary_count += 1

        conn.commit()
        print(f"\n✅ SUCCESS! Migrated {grades_count} grades and {summary_count} summaries.")
        if skipped_students:
            print(f"⚠️ Note: {len(skipped_students)} students from CSVs were skipped because they aren't in the Master Student Table.")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    migrate_grades()