import re
import mysql.connector
import json

conn = mysql.connector.connect(
    host = 'localhost',
    user = 'root',
    password = 'subhojit@mysql',
    database = 'exam_performance_db'
)

cursor = conn.cursor()

with open('../../directory_map.json', 'r') as f:
    directory_map = json.load(f)

def create_hierarchy():
    school_ids = {}
    dept_ids = {}
    prog_ids = {}
    batch_ids = {}
    semester_count = 0

    try:
        for school_name_raw, departments in directory_map.items():
            school_name = school_name_raw.replace('_', ' ')

            cursor.execute("INSERT IGNORE INTO Schools (school_name) VALUES (%s)", (school_name,))
            cursor.execute("SELECT school_id FROM Schools WHERE school_name = %s", (school_name,))
            school_ids[school_name_raw] = cursor.fetchone()[0]

            for dept_name_raw, programs in departments.items():
                dept_name = dept_name_raw.replace('_', ' ')

                cursor.execute("""
                               INSERT IGNORE INTO Departments (department_name, school_id) VALUES (%s, %s)
                               """, (dept_name, school_ids[school_name_raw]))
                cursor.execute("""
                               SELECT department_id FROM Departments WHERE department_name = %s AND school_id = %s
                               """, (dept_name, school_ids[school_name_raw]))
                dept_key = (school_name_raw, dept_name_raw)
                dept_ids[dept_key] = cursor.fetchone()[0]

                for prog_name_raw, batches in programs.items():
                    prog_name = prog_name_raw.replace('_', ' ')

                    cursor.execute("""
                                   INSERT IGNORE INTO Programs (program_name, department_id) VALUES (%s, %s)
                                   """, (prog_name, dept_ids[dept_key]))
                    cursor.execute("""
                                   SELECT program_id FROM Programs WHERE program_name = %s AND department_id = %s
                                   """, (prog_name, dept_ids[dept_key]))
                    prog_key = (dept_key[0], dept_key[1], prog_name_raw)
                    prog_ids[prog_key] = cursor.fetchone()[0]

                    if isinstance(batches, dict):
                        for batch_year, semester_files in batches.items():
                            cursor.execute("""
                                           INSERT IGNORE INTO Batches (batch_year, program_id) VALUES (%s, %s)
                                           """, (batch_year, prog_ids[prog_key]))
                            cursor.execute("""
                                           SELECT batch_id FROM Batches WHERE batch_year = %s AND program_id = %s
                                           """, (batch_year, prog_ids[prog_key]))
                            batch_key = (prog_key[0], prog_key[1], prog_key[2], batch_year)
                            batch_ids[batch_key] = cursor.fetchone()[0]

                            if isinstance(semester_files, list):
                                for semester_file in semester_files:
                                    semester_num_match = re.search(r'(\d+)', semester_file)
                                    if semester_num_match:
                                        semester_num = int(semester_num_match.group(1))

                                        cursor.execute("""
                                                       INSERT IGNORE INTO Semesters (semester_number, batch_id) VALUES (%s, %s)
                                                       """, (semester_num, batch_ids[batch_key]))
                                        semester_count += 1

        conn.commit()
        print(f"   Total Schools: {len(school_ids)}")
        print(f"   Total Departments: {len(dept_ids)}")
        print(f"   Total Programs: {len(prog_ids)}")
        print(f"   Total Batches: {len(batch_ids)}")
        print(f"   Total Semesters: {semester_count}")

    except Exception as e:
        print(f"\n❌ An error occurred: {e}")
        conn.rollback()

    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    create_hierarchy()
