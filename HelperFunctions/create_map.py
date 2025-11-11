import os
import json

def create_directory_map():
    """
    Scans the Datasets directory and creates a map of all departments,
    programs, batches, and semester files. This map is saved to a JSON file.
    """
    root_dir = '../Datasets'
    dir_map = {}


    if not os.path.isdir(root_dir):
        print(f"The '{root_dir}' directory was not found.")
        return {}


    for school in sorted(os.listdir(root_dir)): # Schools
        school_path = os.path.join(root_dir, school)
        if not os.path.isdir(school_path):
            continue
        dir_map[school] = {}
        for department in sorted(os.listdir(school_path)): # Departments
            dept_path = os.path.join(school_path, department)
            if not os.path.isdir(dept_path):
                continue
            dir_map[school][department] = {}
            for program in sorted(os.listdir(dept_path)): # Programs
                prog_path = os.path.join(dept_path, program)
                if not os.path.isdir(prog_path):
                    continue
                dir_map[school][department][program] = {}
                for batch in sorted(os.listdir(prog_path)): # Batches
                    batch_path = os.path.join(prog_path, batch)
                    if not os.path.isdir(batch_path):
                        continue
                    semesters = [f for f in sorted(os.listdir(batch_path)) if f.endswith('.csv')]
                    if semesters:
                        dir_map[school][department][program][batch] = semesters
    return dir_map

if __name__ == '__main__':
    directory_map = create_directory_map()

    if directory_map:
        with open('../directory_map.json', 'w') as f:
            json.dump(directory_map, f, indent=4)