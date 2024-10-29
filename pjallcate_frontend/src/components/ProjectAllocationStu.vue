<template>
  <div id="ProjectAllocationStu">
    <div style="display: flex; flex-direction: row; margin-top: 10px">
      <el-input
        v-model="studentId"
        placeholder="请输入学号，多个以英文逗号,分开"
        style="width: 500px"
        @keypress.enter="fetchStudentData"
      ></el-input>
      <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <el-button type="primary" @click="fetchStudentData">查看学号分配信息</el-button>
      <el-button type="primary" @click="fetchChangeStuData">查看有变化的学号信息</el-button>
    </div>
    <el-table
      :data="tableData"
      style="width: 80%; margin-top: 0px"
      :row-class-name="rowClassName"
    >
      <el-table-column
        prop="student_id"
        label="学号"
        min-width="30%"
        width="auto"
      ></el-table-column>
      <el-table-column
        prop="datetime"
        label="分配时间"
        min-width="30%"
        width="auto"
      ></el-table-column>
      <el-table-column
        prop="project_id"
        label="项目 ID"
        min-width="40%"
        width="auto"
      ></el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import * as cmImports from './api/commonImports'
cmImports.commonImports() // 通用函数等都在此
import * as apiService from './api/apiService'

import { ref } from 'vue'
import { ElLoading, ElMessageBox } from 'element-plus'

let studentId = ref<string>('')
const tableData = ref<
  Array<{ student_id: string; datetime: string; project_id: string }>
>([])

const colorMap = new Map<string, string>()
const assignColorsToStudents = (studentIdArray: string[]) => {
  let switchColor = true
  studentIdArray.forEach(student_id => {
    if (!colorMap.has(student_id)) {
      colorMap.set(student_id, switchColor ? 'row-color-1' : 'row-color-2')
      switchColor = !switchColor
    }
  })
}

const rowClassName = ({ row }: { row: { student_id: string } }) => {
  return colorMap.get(row.student_id) || 'row-default'
}

let loading: any = null

const showLoading = (text = 'Loading...') => {
  if (!loading) {
    loading = ElLoading.service({
      target: '#ProjectAllocationStu',
      lock: true,
      text: text,
      background: 'rgba(0, 0, 0, 0.7)',
    })
  } else {
    loading.setText(text)
  }
}

const closeLoading = () => {
  if (loading) {
    loading.close()
    loading = null
  }
}


const fetchStudentData = async () => {
  const studentIds = studentId.value
  if (!studentId.value) {
    ElMessageBox.alert(`请输入学号进行查询`, 'Warning', {
      type: 'error',
      confirmButtonText: 'OK',
    })
    return
  }
  if (!/^\d+(,\d+)*$/.test(studentIds)) {
    ElMessageBox.alert(
      '学号输入格式错误，请确保学号以英文逗号分隔且无空项',
      'Warning',
      {
        type: 'error',
        confirmButtonText: 'OK',
      },
    )
    return
  }

  showLoading('Fetching Student Data')
  await new Promise(resolve => setTimeout(resolve, 1000))

  const studentIdArray = studentIds.split(',').map(id => id.trim())
  assignColorsToStudents(studentIdArray)

  try {
    const data = await apiService.getStudentAllocation(studentIdArray)

    if (!data || Object.keys(data).length === 0) {
      ElMessageBox.alert(
        `<div>数据库无对应数据，请检查后重试</div>`,
        'Error',
        {
          type: 'error',
          confirmButtonText: 'OK',
          dangerouslyUseHTMLString: true,
        },
      )
      return
    }

    tableData.value = []

    // 遍历每个学生，生成分配记录
    studentIdArray.forEach(student_id => {
      const studentData = data
        .sort(
          (a: any, b: any) =>
            new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
        )

      let lastProjectId: string | null = null
      studentData.forEach((item: any) => {
        if (item.allocated_to === student_id) {
          if (item.project_id !== lastProjectId) {
            tableData.value.push({
              student_id: student_id,
              datetime: cmImports.formatDateToLocal(item.datetime),
              project_id: item.project_id,
            })
            lastProjectId = item.project_id
          }          
        }
      })
    })
  } catch (error) {
    ElMessageBox.alert(
      `<div>学号输入错误或数据库无对应数据，请检查后重试</div>
        <div>${error}</div>`,
      'Error',
      {
        type: 'error',
        confirmButtonText: 'OK',
        dangerouslyUseHTMLString: true,
      },
    )
  } finally {
    closeLoading()
  }
}

const fetchChangeStuData = async () => {
  showLoading('Fetching Data')
  let changedStudents: string[] = []
  try {
    loading.setText('Fetching Change Student Data')
    await new Promise(resolve => setTimeout(resolve, 1000))

    const studentIds = await apiService.getStudentList()
    loading.setText('Fetching Allocation Data, it may takes a while')
    await new Promise(resolve => setTimeout(resolve, 200))

    const studentAllocationData = await apiService.getStudentAllocation(studentIds)
    loading.setText('Checking Students Changes, it may takes a while')
    await new Promise(resolve => setTimeout(resolve, 500))

    changedStudents = await apiService.checkStudentChanges(
      studentIds,
      studentAllocationData,
    )
  } catch (error) {
    ElMessageBox.alert(
      `<div>${error}</div>`,
      'Error',
      {
        type: 'error',
        confirmButtonText: 'OK',
        dangerouslyUseHTMLString: true,
      },
    )
  } finally {
    studentId.value = changedStudents.join(',')
    fetchStudentData()
  }
}
</script>

<style>
#ProjectAllocationStu {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.el-table {
  width: 80%;
  margin-top: 20px;
}

.row-color-1 {
  background-color: #f9f9f9 !important;
}

.row-color-2 {
  background-color: #ecf6f8 !important;
}
</style>
