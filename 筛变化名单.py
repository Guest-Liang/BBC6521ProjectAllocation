import requests
from datetime import datetime

BASE_URL = "http://localhost:3000"

def get_project_list():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Fetching project list...")
    response = requests.get(f"{BASE_URL}/api/projects")
    if response.status_code == 200:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Successfully fetched project list.")
        return [project['project_id'] for project in response.json()]
    else:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Error fetching project list: {response.status_code}")
        return []

def get_project_allocation(project_ids):
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Fetching allocation data for {len(project_ids)} projects...")
    response = requests.get(f"{BASE_URL}/api/project-allocation", params={'project_ids': ','.join(project_ids)})
    if response.status_code == 200:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Successfully fetched allocation data.")
        return response.json()
    else:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Error fetching project allocation data: {response.status_code}")
        return {}

def check_project_changes(allocation_data):
    changed_projects = []

    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Checking for changes in project allocation...")
    for project_id, data in allocation_data.items():
        # 找到第一个非空分配的索引
        first_non_null_index = None
        has_changes = False

        for i, entry in enumerate(data):
            if entry['allocated_to'] is not None:
                first_non_null_index = i
                break

        # 如果找到了第一个非空分配的索引，检查后续的分配是否有变化
        if first_non_null_index is not None:
            for entry in data[first_non_null_index + 1:]:
                if entry['allocated_to'] is not None and entry['allocated_to'] != data[first_non_null_index]['allocated_to']:
                    has_changes = True
                    break

        if has_changes:
            changed_projects.append(project_id)
    
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Finished checking. Found {len(changed_projects)} projects with changes.")
    return changed_projects

def get_student_list():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Fetching student list...")
    response = requests.get(f"{BASE_URL}/api/students-list")
    if response.status_code == 200:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Successfully fetched student list.")
        return response.json()  # 直接返回数组
    else:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Error fetching student list: {response.status_code}")
        return []

def get_student_allocation(student_ids):
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Fetching allocation data for {len(student_ids)} students...")
    response = requests.get(f"{BASE_URL}/api/students", params={'student_ids': ','.join(student_ids)})
    if response.status_code == 200:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Successfully fetched allocation data.")
        return response.json()
    else:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Error fetching student allocation data: {response.status_code}")
        return {}

def check_student_changes(student_ids,allocation_data):
    changed_students = []
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Checking for changes in student allocation...")

    for id in student_ids:
        first_project_id = None
        first_project_index=0
        has_changes=False

        for i,data in enumerate(allocation_data):
            if id == data['allocated_to']:
                first_project_id=data['project_id']
                first_project_index=i
                break

        if first_project_id is not None:
            for entry in allocation_data[first_project_index+1:]:
                if id == entry['allocated_to'] and first_project_id != entry['project_id']:
                    has_changes=True
                    break
        
        if has_changes:
            changed_students.append(id)
    
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Finished checking. Found {len(changed_students)} students with changes.")
    return changed_students

def main():
    project_ids = get_project_list()
    if not project_ids:
        return

    allocation_data = get_project_allocation(project_ids)
    changed_projects = check_project_changes(allocation_data)
    if changed_projects:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 有变化的项目有：{len(changed_projects)} 个")
        print(changed_projects)
    else:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 没有项目分配发生变化")

    student_ids = get_student_list()
    if not student_ids:
        return

    student_allocation_data = get_student_allocation(student_ids)
    changed_students = check_student_changes(student_ids,student_allocation_data)
    if changed_students:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 有变化的学生有：{len(changed_students)} 个")
        print(changed_students)
    else:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 没有学生分配发生变化")

if __name__ == "__main__":
    main()