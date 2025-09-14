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
        print(f"Error: The '{root_dir}' directory was not found.")
        return {}

    for school in sorted(os.listdir(root_dir)):
        school_path = os.path.join(root_dir, school)
        if os.path.isdir(school_path):
            dir_map[school] = {}
            # 2. The rest of the loops are nested inside
            for department in sorted(os.listdir(school_path)):
                dept_path = os.path.join(school_path, department)
                if os.path.isdir(dept_path):
                    dir_map[school][department] = {}
                    for program in sorted(os.listdir(dept_path)):
                        # ...and so on for program, batch, and semester
                        prog_path = os.path.join(dept_path, program)
                        if os.path.isdir(prog_path):
                            dir_map[school][department][program] = {}
                            for batch in sorted(os.listdir(prog_path)):
                                batch_path = os.path.join(prog_path, batch)
                                if os.path.isdir(batch_path):
                                    semesters = [f for f in sorted(os.listdir(batch_path)) if f.endswith('.csv')]
                                    if semesters:
                                        dir_map[school][department][program][batch] = semesters
    return dir_map

if __name__ == '__main__':
    directory_map = create_directory_map()

    if directory_map:
        with open('../directory_map.json', 'w') as f:
            json.dump(directory_map, f, indent=2)