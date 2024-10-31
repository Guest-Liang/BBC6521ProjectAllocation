import pandas as pd
import mysql.connector
from datetime import datetime
import yaml

with open('./config/mysqlinfo.yaml', 'r') as file:
    config = yaml.safe_load(file)

try:
    print('try connecting')
    conn = mysql.connector.connection.MySQLConnection(
        host=config['database']['host'],
        user=config['database']['user'],
        password=config['database']['password'],
        database=config['database']['databasename'],
    )
    print('connected')
except mysql.connector.Error as err:
    print(f"Errors: {err}")

cursor = conn.cursor()

date_part = '20241030'

df = pd.read_excel(f'{date_part}.xlsx', sheet_name=None)

# project_titles = {}
# for sheet_name, data in df.items():
#     for _, row in data.iterrows():
#         project_id = row['Project ID']
#         project_title = row['Project Title']
#         if project_id not in project_titles:
#             # 避免重复插入相同项目
#             project_titles[project_id] = project_title
#             sql = config['database']['py_query']['insert_projects']
#             print(f"[{datetime.now().strftime("%Y-%m-%d %H:%M:%S")}] Inserting: {project_id}, {project_title}")
#             cursor.execute(sql, (project_id, project_title))
#         else:
#             print(f"[{datetime.now().strftime("%Y-%m-%d %H:%M:%S")}] Project {project_id} already exists")

for sheet_name, data in df.items():
    time_part = sheet_name
    datetime_value = datetime.strptime(date_part + time_part, '%Y%m%d%H%M%S')

    for _, row in data.iterrows():
        sql = config['database']['py_query']['insert_project_data']
        allocated_to= row['Allocated to (BUPT no.)']
        allocated_to = str(allocated_to).replace(".0",'') if not pd.isna(row['Allocated to (BUPT no.)']) else None
        print(f"[{datetime.now().strftime("%Y-%m-%d %H:%M:%S")}] Inserting: {datetime_value}, {row['Project ID']}, {allocated_to}")
        cursor.execute(sql, (datetime_value, row['Project ID'], allocated_to))
conn.commit()
cursor.close()
conn.close()
