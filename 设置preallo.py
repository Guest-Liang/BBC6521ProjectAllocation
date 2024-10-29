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

df = pd.read_excel(f'output.xlsx', sheet_name=None)

for sheet_name, data in df.items():
    for _, row in data.iterrows():
        if row['Index Number'] == 'Pre-allocated':
            sql = config['database']['py_query']['set_pre_allocated']
            print(f"[{datetime.now().strftime("%Y-%m-%d %H:%M:%S")}] Settting {row['Project ID']} field is_pre_allocated to 1")
            cursor.execute(sql, (row['Project ID'],))

conn.commit()
cursor.close()
conn.close()


