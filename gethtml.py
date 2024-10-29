import requests
import time
from datetime import datetime, timedelta

def save_webpage(url):
    current_time = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
    filename = f"{current_time}.html"
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
            with open("log.log", "a", encoding="utf-8") as log_file:
                log_file.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {message}\n")
            return

        except Exception as e:
            retry_count += 1
            message = f"Retry {retry_count}/{max_retries} for {url} due to error: {e}"
            print(message)
            with open("log.log", "a", encoding="utf-8") as log_file:
                log_file.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {message}\n")

            if retry_count == max_retries:
                error_message = f"Failed to save {url} after {max_retries} retries: {e}"
                print(error_message)
                with open("log.log", "a", encoding="utf-8") as log_file:
                    log_file.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {error_message}\n")
            else:
                time.sleep(10)

url = "http://18.218.128.52/live24.html"

# 每5分钟的10秒更新
while True:
    now = datetime.now()
    # 计算下一次5分钟周期的时间点（向上取整到最近的5分钟）
    next_update = now + timedelta(minutes=(5 - now.minute % 5))
    next_update = next_update.replace(second=10, microsecond=0)
    
    # 如果当前时间已经超过了下一个更新时间点，则加5分钟
    if next_update <= now:
        next_update += timedelta(minutes=5)
    
    next_update_message = f"Next update at: {next_update.strftime('%Y-%m-%d %H:%M:%S')}"
    print(next_update_message)
    with open("log.log", "a", encoding="utf-8") as log_file:
        log_file.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {next_update_message}\n")
    
    # 需要等待的秒数
    wait_time = (next_update - now).total_seconds()
    time.sleep(wait_time)
    
    save_webpage(url)
