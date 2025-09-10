import pandas as pd
import numpy as np
import json
from js import console
from pyscript import window


def get_analytics_data(df, subject_columns):
    failing_grades = ['F', 'FF']
    total_students = len(df)

    fail_counts_per_student = df[subject_columns].isin(failing_grades).sum(axis=1)

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

    print("promoted_students:", promoted_students)
    print("total_students:", total_students)
    print("promoted raw pct:", promoted_students / total_students * 100)
    print("promoted rounded 2dp:", round(promoted_students / total_students * 100, 2))
    print("promoted rounded 1dp:", f"{promoted_students / total_students * 100:.1f}")

    return {
        "total_students": total_students,
        "passed_students": passed_students,
        "promoted_students": promoted_students,
        "failed_students": failed_students,
        "pass_percentage": pass_percentage,
        "promoted_percentage": promoted_percentage,
        "fail_percentage": fail_percentage
    }

def get_top_students_data(df):
    df['SGPA'] = pd.to_numeric(df['SGPA'], errors='coerce')
    top_3_df = df.nlargest(3, 'SGPA')[['Name', 'SGPA']]
    return top_3_df.to_dict('records')

def load_semester_data(filename):
    try:
        filepath = f"Datasets/{filename}"
        df = pd.read_csv(filepath).replace(np.nan, None)
        subject_columns = [c for c in df.columns if c not in ['Name', 'Enrollment', 'SGPA', 'CGPA', 'Result', 'Gender', 'Performance']]

        analytics_data = get_analytics_data(df, subject_columns)
        top_students_list = get_top_students_data(df)
        df.fillna('-', inplace=True)
        all_students_list = df.to_dict('records')

        dashboard_data = {
            "subjects": subject_columns,
            "students": all_students_list,
            "analytics": analytics_data,
            "top_performers": top_students_list
        }
        window.buildDashboard(json.dumps(dashboard_data))
    except Exception as e:
        console.error(f"Python Error: {str(e)}")
        window.showLoadingError(str(e))

window.pyLoadSemester = load_semester_data
load_semester_data("6th_sem_result.csv")




