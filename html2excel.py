import pandas as pd
import glob
import os

html_files = glob.glob('./html存档/linux/1030/*.html')

if html_files:
    workbook_name = html_files[0][20:20+10].replace('-', '') + '.xlsx'
else:
    raise FileNotFoundError("没有找到符合命名规则的HTML文件")

with pd.ExcelWriter(workbook_name) as writer:
    for html_file in html_files:
        tables = pd.read_html(html_file)
        df = tables[0]
        sheet_name = os.path.splitext(html_file)[0][11+20:].replace('-', '')
        df.to_excel(writer, sheet_name=sheet_name, index=False)
        print(f'sheet_name: {sheet_name} successfully written')

print(f"所有表格已成功写入 {workbook_name}")