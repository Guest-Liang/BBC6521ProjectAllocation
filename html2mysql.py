import requests
import time
from datetime import datetime, timedelta
import mysql.connector
import pandas as pd
import atexit
import yaml

with open('./config/mysqlinfo.yaml', 'r') as file:
    config = yaml.safe_load(file)

LOGfile = f'./html存档/0000/log.log'
current_time = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
filename = f'./html存档/0000/{current_time}.html'

def save_webpage(url):
    global current_time, filename
    current_time = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
    filename = f'./html存档/0000/{current_time}.html'
    max_retries = 5
    retry_count = 0

    while retry_count < max_retries:
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            content = response.text

            with open(filename, 'w', encoding='utf-8') as file:
                file.write(content)
            
            message = f"Saved {url} to {filename}"
            print(message)
            with open(LOGfile, "a", encoding="utf-8") as log_file:
                log_file.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {message}\n")
            return

        except Exception as e:
            retry_count += 1
            message = f"Retry {retry_count}/{max_retries} for {url} due to error: {e}"
            print(message)
            with open(LOGfile, "a", encoding="utf-8") as log_file:
                log_file.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {message}\n")
            if retry_count == max_retries:
                error_message = f"Failed to save {url} after {max_retries} retries: {e}"
                print(error_message)
                with open(LOGfile, "a", encoding="utf-8") as log_file:
                    log_file.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {error_message}\n")
            else:
                time.sleep(10)

url = "http://18.218.128.52/live24.html"

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
    exit(1)

cursor = conn.cursor()

def close_db_connection():
    cursor.close()
    conn.close()
    print("Database connection closed.")

atexit.register(close_db_connection)

while True:
    now = datetime.now()
    next_update = now + timedelta(minutes=(5 - now.minute % 5))
    next_update = next_update.replace(second=10, microsecond=0)
    if next_update <= now:
        next_update += timedelta(minutes=5)
    
    next_update_message = f"Next update at: {next_update.strftime('%Y-%m-%d %H:%M:%S')}"
    print(next_update_message)
    with open(LOGfile, "a", encoding="utf-8") as log_file:
        log_file.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {next_update_message}\n")

    wait_time = (next_update - now).total_seconds()
    time.sleep(wait_time)

    save_webpage(url)


    tables = pd.read_html(filename)
    df = tables[0]
    data = df

    datetime_value = filename[14:33].replace("-", "")

    for _, row in data.iterrows():
        allocated_to = row['Allocated to (BUPT no.)'] if not pd.isna(row['Allocated to (BUPT no.)']) else None
        project_id = row['Project ID']

        sql = config['database']['py_query']['insert_project_data']
        print(f"[{datetime.now().strftime('%Y-%m-%d-%H-%M-%S')}] ({_}) INSERT INTO project_data {datetime_value, project_id, allocated_to}")
        cursor.execute(sql, (datetime_value, project_id, allocated_to))

    conn.commit()
