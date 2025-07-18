<template>
  <div id="AllocationByPrefixChart">
    <VChart v-if="isChartVisible" :option="chartOption" />
  </div>
</template>

<script setup lang="ts">
import * as cmImports from './api/commonImports'
cmImports.commonImports()
import * as api from './api/apiService'

import { ref, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { ElLoading, ElMessageBox } from 'element-plus'

const isChartVisible = ref(false)
const chartOption = ref(
  Object.assign({}, cmImports.commonChartOptions, {
    title: Object.assign({}, cmImports.commonChartOptions.title, {
      text: 'BUPT and QMUL Project Allocation Data',
    }),
    legend: Object.assign({}, cmImports.commonChartOptions.legend, {
      data: ['BUPT 已分配', 'BUPT 未分配', 'QMUL 已分配', 'QMUL 未分配'],
    }),
    series: [
      {
        name: 'BUPT 已分配',
        data: [] as number[],
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 2,
        },
      },
      {
        name: 'BUPT 未分配',
        data: [] as number[],
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 2,
        },
      },
      {
        name: 'QMUL 已分配',
        data: [] as number[],
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 2,
        },
      },
      {
        name: 'QMUL 未分配',
        data: [] as number[],
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 2,
        },
      },
    ],
  }),
)

const fetchPrefixData = async () => {
  const loading = ElLoading.service({
    target: '#AllocationByPrefixChart',
    lock: true,
    text: 'Fetching Data',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    const data = await api.fetchAllocationDataByPrefix()

    const buptSeries = cmImports.fillTimeSeriesByPrefix(data, 'BUPT')
    const qmulSeries = cmImports.fillTimeSeriesByPrefix(data, 'QMUL')
    chartOption.value.xAxis.data = buptSeries.x // 时间轴一致

    chartOption.value.series[0].data = buptSeries.allocated
    chartOption.value.series[1].data = buptSeries.unallocated
    chartOption.value.series[2].data = qmulSeries.allocated
    chartOption.value.series[3].data = qmulSeries.unallocated
    isChartVisible.value = true
  } catch (error) {
    ElMessageBox.alert(
      `
      <div>Error fetching allocation by prefix data</div>
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
  fetchPrefixData()
})
</script>

<style scoped>
#AllocationByPrefixChart {
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
