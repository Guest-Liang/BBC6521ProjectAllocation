<template>
  <div id="app">
    <h1 style="text-align: center">
      BBC6521 Project Allocation 2024/25: Project Allocation - Student View
    </h1>
    <div class="mb-4" style="margin-top: 5px">
      <el-button type="primary" plain @click="showAllocationCountChart">总分配折线图</el-button>
      <span>&nbsp;</span>
      <el-button type="primary" plain @click="showAllocationByPrefixChart">BUPT和QMUL分配折线图</el-button>
      <span>&nbsp;</span>
      <el-button type="primary" plain @click="showProjectAllocationChart">分配情况查询（项目）</el-button>
      <span>&nbsp;</span>
      <el-button type="primary" plain @click="showProjectAllocationStu">分配情况查询（学号）</el-button>
    </div>
    <h4 style="margin-top: 5px">注：第1天为2024年10月23日</h4>
    <h4>
      【2024-10-25 23:35，最后一名学生选上了BUPT的项目，系统于2024-10-25
      23:45将剩余的BUPT未分配项目设置为了'Not Available, BUPT Quota full'】
    </h4>
    <component
      :is="currentChartComponent"
      style="
        border-radius: 15px;
        background-color: white;
        margin-bottom: 10px;
        overflow: hidden;
      "
    />
  </div>
</template>

<script>
import AllocationCountChart from './components/AllocationCountChart.vue'
import AllocationByPrefixChart from './components/AllocationByPrefixChart.vue'
import ProjectAllocationChart from './components/ProjectAllocationChart.vue'
import ProjectAllocationStu from './components/ProjectAllocationStu.vue'

export default {
  name: 'App',
  components: {
    AllocationCountChart,
    AllocationByPrefixChart,
    ProjectAllocationChart,
    ProjectAllocationStu,
  },
  data() {
    return {
      currentChartComponent: 'AllocationCountChart', // 默认显示
    }
  },
  methods: {
    showAllocationCountChart() {
      this.currentChartComponent = 'AllocationCountChart'
    },
    showAllocationByPrefixChart() {
      this.currentChartComponent = 'AllocationByPrefixChart'
    },
    showProjectAllocationChart() {
      this.currentChartComponent = 'ProjectAllocationChart'
    },
    showProjectAllocationStu() {
      this.currentChartComponent = 'ProjectAllocationStu'
    },
  },
}
</script>

<style>
#app {
  max-width: 3000px;
  padding: 0px 10px;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgb(255, 234, 199);
}
/* loading 图标属性 */
.el-loading-spinner .path {
  -webkit-animation: loading-dash 1.5s ease-in-out infinite;
  animation: loading-dash 1.5s ease-in-out infinite;
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 60;
  stroke-width: 4;
  stroke-linecap: round;
  stroke: #ffffff !important;
}
/* loading文字属性 */
.el-loading-spinner .el-loading-text {
  color: #ffffff !important;
  margin: 3px 0;
  font-size: 14px;
}
</style>
