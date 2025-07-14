<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div id="ProjectAllocationChart">
    <div style="display: flex; flex-direction: row; margin-top: 10px">
      <el-select
        v-model="selectedProjectIds"
        multiple
        filterable
        placeholder="请选择项目ID"
        class="custom-select"
      >
        <el-option
          v-for="project in projectList"
          :key="project?.project_id"
          :label="project?.project_id"
          :value="project?.project_id"
        />
      </el-select>
      <el-button class="custom-button" type="primary" @click="fetchPJAlloData">查看所选项目分配信息</el-button>
      <el-button class="custom-button" type="primary" @click="fetchChangePJData_v2">查看有变化的项目信息</el-button>
    </div>
    <el-table
      :data="tableData"
      style="width: 80%; margin-top: 0px"
      :row-class-name="rowClassName"
    >
      <el-table-column
        prop="project_id"
        label="项目 ID"
        min-width="30%"
      ></el-table-column>
      <el-table-column
        prop="datetime"
        label="分配时间"
        min-width="30%"
      ></el-table-column>
      <el-table-column
        prop="allocated_to"
        label="分配给学生"
        min-width="40%"
      ></el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import * as cmImports from './api/commonImports'
cmImports.commonImports()
import * as apiService from './api/apiService'

import { ref, onMounted } from 'vue'
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const projectList = ref<any[]>([])
const selectedProjectIds = ref<string[]>([])
const tableData = ref<
  Array<{ project_id: string; datetime: string; allocated_to: string | null }>
>([])

const colorMap = new Map<string, string>()
const assignColorsToIds = (idArray: string[]) => {
  let switchColor = true
  idArray.forEach(id => {
    if (!colorMap.has(id)) {
      colorMap.set(id, switchColor ? 'row-color-1' : 'row-color-2')
      switchColor = !switchColor
    }
  })
}
const rowClassName = ({ row }: { row: { project_id: string } }) => {
  return colorMap.get(row.project_id) || 'row-default'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let loading: any = null

const showLoading = (text = 'Loading...') => {
  if (!loading) {
    loading = ElLoading.service({
      target: '#ProjectAllocationChart',
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


// 获取所有项目列表
const fetchProjectList = async () => {
  try {
    const data = await apiService.getProjectList()
    data.sort()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    projectList.value = data.map((item: any) => {
      return {
        project_id: item,
      }
    })
  } catch (error) {
    ElMessageBox.alert(
      `
        <div>Error fetching project list, please try fresh pages.</div>
        <div>${error}</div>`,
      'Error',
      {
        type: 'error',
        confirmButtonText: 'OK',
        dangerouslyUseHTMLString: true,
      },
    )
  }
}

const fetchPJAlloData = async () => {
  if (selectedProjectIds.value.length === 0) {
    ElMessage({
      message: '请选择至少一个项目进行查询',
      type: 'warning',
    })
    return
  }
  showLoading('Fetching All Data')
  await new Promise(resolve => setTimeout(resolve, 500))

  try {
    const data = await apiService.getProjectAllocation(selectedProjectIds.value)
    assignColorsToIds(selectedProjectIds.value)
    tableData.value = []

    selectedProjectIds.value.forEach(projectId => {
      const projectData = data[projectId] || []
      projectData.sort(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (a: any, b: any) =>
          new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
      )

      let lastAllocatedTo: string | null = null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      projectData.forEach((item: any) => {
        if (item.allocated_to !== lastAllocatedTo) {
          tableData.value.push({
            project_id: projectId,
            datetime: cmImports.formatDateToLocal(item.datetime),
            allocated_to: item.allocated_to,
          })
          lastAllocatedTo = item.allocated_to
        }
      })
    })
  } catch (error) {
    ElMessageBox.alert(
      `
        <div>Error fetching project data</div>
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fetchChangePJData_v2 = () => {
  selectedProjectIds.value = ['BCHENLEI1','BXUFANGMIN2','QARW7','QASA5','QAW2','QCC5','QFL8','QGG5','QGG8','QHA2','QJZ9','QSP3','BGUOSHAOYONG2','BLUZHAOMING1','QMC3','QVW9','QMC4','QMC5','QMJ8','QMS1','QJL1','QSP4']
  fetchPJAlloData()
}

// Aborted
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fetchChangePJData_v1 = async () => {
  showLoading('Fetching Data')
  let changedProjects: string[] = []
  try {
    loading.setText('Fetching Project Data')
    await new Promise(resolve => setTimeout(resolve, 1000))

    const projectIds = await apiService.getProjectList()
    loading.setText('Fetching Allocation Data, Please Wait')
    await new Promise(resolve => setTimeout(resolve, 200))

    const allocationData = await apiService.getProjectAllocation(projectIds)
    loading.setText('Checking Projects Changes, it may takes a while')
    await new Promise(resolve => setTimeout(resolve, 500))

    changedProjects = await apiService.checkProjectChanges(allocationData)
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
    selectedProjectIds.value = changedProjects
    fetchPJAlloData()
  }

}

onMounted(() => {
  fetchProjectList()
})
</script>

<style scoped>
#ProjectAllocationChart {
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

.custom-select {
  width: 40vw;
  max-height: 4vw;
  overflow-y: auto;
  margin-right: 10px;
}

.row-color-1 {
  background-color: #f9f9f9 !important;
}

.row-color-2 {
  background-color: #ecf6f8 !important;
}

.row-default {
  background-color: #ffffff !important;
}

.custom-button {
  height: 30px;
  padding: 0px 5px;
  font-size: 14px;
}
</style>
