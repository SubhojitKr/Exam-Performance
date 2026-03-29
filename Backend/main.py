import pandas as pd             # data processing
import numpy as np
import json                     # for reading JSON files
from js import console          # provides access to the browser's JS console
from pyscript import window     # provides access to the browser's global window object, used it to call functions defined in JS

SUBJECT_CODE_MAP = {}


""" 
HELPER FUNCTIONS
"""
def get_analytics_data(df, subject_columns):
    failing_grades = ['F', 'FF']
    total_students = len(df)

    fail_counts_per_student = df[subject_columns].isin(failing_grades).sum(axis=1)

    # Categorizing Students
    passed_students = int((fail_counts_per_student == 0).sum())
    promoted_students = int(((fail_counts_per_student >= 1) & (fail_counts_per_student <= 5)).sum())
    failed_students = int((fail_counts_per_student > 5).sum())

    if total_students > 0:
        pass_percentage = (passed_students / total_students) * 100
        promoted_percentage = (promoted_students / total_students) * 100
        fail_percentage = (failed_students / total_students) * 100
    else:
        pass_percentage = 0
        promoted_percentage = 0
        fail_percentage = 0

    return {
        "total_students": total_students,
        "passed_students": passed_students,
        "promoted_students": promoted_students,
        "failed_students": failed_students,
        "pass_percentage": pass_percentage,
        "promoted_percentage": promoted_percentage,
        "fail_percentage": fail_percentage
    }
def get_top_students_sgpa_data(df):
    df['SGPA'] = pd.to_numeric(df['SGPA'], errors='coerce')
    top_3_df = df.nlargest(3, 'SGPA')[['Name', 'SGPA']]
    return top_3_df.to_dict('records')
def get_top_students_cgpa_data(df):
    df['CGPA'] = pd.to_numeric(df['CGPA'], errors='coerce')
    top_3_df = df.nlargest(3, 'CGPA')[['Name', 'CGPA']]
    return top_3_df.to_dict('records')
def calculate_subject_analysis(df, subject_columns, code_to_name_map):
    failing_grades = ['F', 'FF']
    subject_analysis_results = {}

    for subject in subject_columns:
        subject_info = code_to_name_map.get(subject, {})
        subject_name = subject_info.get('name', subject)

        appeared_students = df[(df[subject].notna()) & (df[subject] != '-')]
        appeared_count = len(appeared_students)

        pass_count = 0
        fail_count = 0
        pass_percentage = 0.0
        fail_percentage = 0.0

        if appeared_count > 0:
            fail_count = int(appeared_students[subject].isin(failing_grades).sum())
            pass_count = appeared_count - fail_count
            pass_percentage = (pass_count / appeared_count) * 100
            fail_percentage = (fail_count / appeared_count) * 100

        subject_analysis_results[subject] = {
            'name': subject_name,
            'code': subject,
            'appeared': int(appeared_count),
            'pass_percentage': pass_percentage,
            'fail_percentage': fail_percentage,
            'pass_count': pass_count,
            'fail_count': fail_count
        }
    return subject_analysis_results
def load_semester_data(filepath):
    try:
        df = pd.read_csv(filepath).replace(np.nan, None)

        # excluding columns that are not subject
        exclude_columns = ['Name', 'Enrollment', 'SGPA', 'CGPA', 'Result', 'Gender', 'Performance', 'Program_Type']
        subject_columns = [c for c in df.columns if c not in exclude_columns]

        df.fillna('?', inplace=True)
        analytics_data = get_analytics_data(df, subject_columns)
        top_students_sgpa_list = get_top_students_sgpa_data(df)
        top_students_cgpa_list = get_top_students_cgpa_data(df)
        subject_wise_analysis = calculate_subject_analysis(df, subject_columns, SUBJECT_CODE_MAP)

        all_students_list = df.replace({np.nan: None}).to_dict('records')

        dashboard_data = {
            "subjects": subject_columns,
            "students": all_students_list,
            "analytics": analytics_data,
            "top_performers_sgpa": top_students_sgpa_list,
            "top_performers_cgpa": top_students_cgpa_list,
            'subject_wise_analysis': subject_wise_analysis,
            'subject_map': SUBJECT_CODE_MAP
        }
        window.buildDashboard(json.dumps(dashboard_data))
    except Exception as e:
        console.error(f"Python Error loading {filepath}: {str(e)}")
        window.showLoadingError(str(e))
def main():
    global SUBJECT_CODE_MAP
    try:
        with open("directory_map.json", "r") as f:
            json_map = f.read()
        window.startApp(json_map)

        with open("subjects_code_map.json", "r") as f:
            SUBJECT_CODE_MAP = json.load(f)

    except Exception as e:
        console.error(f"Python Error during initialization: {str(e)}")
        window.showLoadingError("Could not load the directory map file.")


""" 
MAIN
"""
window.pyLoadSemester = load_semester_data
main()
