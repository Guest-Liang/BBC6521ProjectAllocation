<template>
  <div id="AllocationCountChart">
    <VChart
      style="border-radius: 20px"
      v-if="isChartVisible"
      :option="chartOption"
    />
  </div>
</template>

<script setup lang="ts">
import * as cmImports from './api/commonImports'
cmImports.commonImports() // 通用函数等都在此
import * as api from './api/apiService'

import { ref, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { ElLoading, ElMessageBox } from 'element-plus'

let isChartVisible = ref(false)
const chartOption = ref(
  Object.assign({}, cmImports.commonChartOptions, {
    title: Object.assign({}, cmImports.commonChartOptions.title, {
      text: 'Project Allocation Data',
    }),
    legend: Object.assign({}, cmImports.commonChartOptions.legend, {
      data: ['已分配 Allocated', '未分配 Unallocated'],
    }),
    series: [
      {
        name: '已分配 Allocated',
        data: [],
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 2,
        },
      },
      {
        name: '未分配 Unallocated',
        data: [],
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 2,
        },
      },
    ],
  }),
)

const fetchChartData = async () => {
  const loading = ElLoading.service({
    target: '#AllocationCountChart',
    lock: true,
    text: 'Fetching Data',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    const data = await api.fetchAllocationData()
    console.log(data)

    chartOption.value.xAxis.data = data.map((item: { datetime: any }) =>
      cmImports.formatDateToLocal(item.datetime),
    )
    chartOption.value.series[0].data = data.map(
      (item: { allocated_count: any }) => item.allocated_count,
    )
    chartOption.value.series[1].data = data.map(
      (item: { unallocated_count: any }) => item.unallocated_count,
    )
    isChartVisible.value = true
  } catch (error) {
    ElMessageBox.alert(
      `
      <div>Error fetching data</div>
      <div>${error}</div>`,
      'Error',
      {
        type: 'error',
        confirmButtonText: 'OK',
        dangerouslyUseHTMLString: true,
      },
    )
  } finally {
    loading.close()
  }
}

onMounted(() => {
  fetchChartData()
})
</script>

<style scoped>
#AllocationCountChart {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.v-chart {
  width: 100%;
  height: 100%;
}
</style>
