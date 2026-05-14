<template>
  <main class="dashboard-shell">
    <section class="hero-panel" aria-labelledby="dashboard-title">
      <div class="hero-copy">
        <p class="eyebrow">BBC6521 Allocation Command Center</p>
        <h1 id="dashboard-title" class="main-title">
          Project Allocation 2024/25 · Student View
        </h1>
        <p class="hero-summary">
          一个用于追踪项目分配趋势、BUPT/QMUL 配额变化、项目历史与学生去向的学术数据指挥舱。
        </p>
      </div>
      <div class="mission-card" aria-label="Mission timeline notice">
        <span class="mission-label">Timeline Note</span>
        <p class="comments">第1天为2024年10月23日</p>
        <p class="comments">
          【2024-10-25 23:35，最后一名学生选上了BUPT的项目，系统于2024-10-25
          23:45将剩余的BUPT未分配项目设置为了'Not Available, BUPT Quota full'】
        </p>
      </div>
    </section>

    <nav class="shell-nav" aria-label="Dashboard views">
      <el-button class="custom-button" type="primary" plain @click="showAllocationCountChart">总分配折线图</el-button>
      <el-button class="custom-button" type="primary" plain @click="showAllocationByPrefixChart">BUPT和QMUL分配折线图</el-button>
      <el-button class="custom-button" type="primary" plain @click="showProjectAllocationChart">分配情况查询（项目）</el-button>
      <el-button class="custom-button" type="primary" plain @click="showProjectAllocationStu">分配情况查询（学号）</el-button>
    </nav>

    <section class="content-card">
      <component
        :is="currentChartComponent"
        class="chart-component"
      />
    </section>
  </main>
</template>

<script lang="ts">
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
      currentChartComponent: 'AllocationCountChart',
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
.dashboard-shell {
  position: relative;
  width: 100%;
  min-height: 100vh;
  padding: var(--space-8);
  overflow: hidden;
  background:
    radial-gradient(circle at 12% 10%, var(--color-shell-spotlight), transparent 26rem),
    radial-gradient(circle at 86% 4%, var(--color-shell-spotlight-alt), transparent 24rem),
    linear-gradient(145deg, var(--color-void), var(--color-void-soft) 48%, var(--color-navy));
  color: var(--color-text);
}

.dashboard-shell::before {
  position: fixed;
  inset: 0;
  pointer-events: none;
  content: '';
  background-image:
    linear-gradient(var(--color-grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-grid-line) 1px, transparent 1px);
  background-size: 4rem 4rem;
  mask-image: linear-gradient(to bottom, var(--color-grid-mask), transparent 82%);
}

.hero-panel,
.shell-nav,
.content-card {
  position: relative;
  z-index: 1;
  width: min(100%, var(--layout-max));
  margin: 0 auto;
}

.hero-panel {
  min-height: var(--hero-min-height);
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(20rem, 0.55fr);
  gap: var(--space-6);
  align-items: stretch;
}

.hero-copy,
.mission-card,
.content-card {
  border: var(--border-hairline) solid var(--color-glass-border);
  box-shadow: var(--shadow-soft), var(--shadow-inset);
}

.hero-copy {
  position: relative;
  min-height: var(--hero-min-height);
  padding: clamp(var(--space-8), 5vw, var(--space-16));
  border-radius: var(--radius-xl);
  background:
    linear-gradient(135deg, var(--color-hero-panel), var(--color-hero-panel-deep)),
    linear-gradient(90deg, var(--color-hero-accent), transparent);
  overflow: hidden;
}

.hero-copy::after {
  position: absolute;
  right: clamp(var(--space-6), 8vw, var(--space-16));
  bottom: calc(var(--space-8) * -1);
  width: clamp(8rem, 22vw, 18rem);
  height: clamp(8rem, 22vw, 18rem);
  border: var(--border-hairline) solid var(--color-orbit-line);
  border-radius: 50%;
  content: '';
  box-shadow:
    0 0 0 var(--space-5) var(--color-orbit-glow),
    0 0 0 var(--space-10) var(--color-orbit-glow-alt);
}

.eyebrow,
.mission-label {
  color: var(--color-accent-strong);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.main-title {
  max-width: 16ch;
  margin-top: var(--space-4);
  color: var(--color-paper-soft);
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 700;
  letter-spacing: -0.045em;
  line-height: 0.92;
}

.hero-summary {
  max-width: 46rem;
  margin-top: var(--space-5);
  color: var(--color-hero-text-muted);
  font-size: var(--text-md);
}

.mission-card {
  align-self: stretch;
  padding: var(--space-6);
  border-radius: var(--radius-xl);
  background:
    linear-gradient(145deg, var(--color-paper-overlay), var(--color-paper-overlay-deep)),
    var(--color-paper);
  color: var(--color-ink);
}

.mission-card .mission-label {
  color: var(--color-accent);
}

.comments {
  margin-top: var(--space-3);
  color: var(--color-ink-muted);
  font-size: var(--text-sm);
  line-height: 1.75;
}

.shell-nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-6);
  padding: var(--space-3);
  border: var(--border-hairline) solid var(--color-nav-border);
  border-radius: var(--radius-xl);
  background: var(--color-shell-panel);
  box-shadow: var(--shadow-inset);
  backdrop-filter: blur(16px);
}

.shell-nav .el-button {
  flex: 1 1 13rem;
  margin: 0;
  border-color: var(--color-nav-control-border);
  background: var(--color-shell-control);
  color: var(--color-paper-soft);
}

.shell-nav .el-button:hover,
.shell-nav .el-button:focus {
  border-color: var(--color-accent-strong);
  background: var(--color-shell-control-hover);
  color: var(--color-paper-soft);
  box-shadow: 0 0.875rem 1.75rem var(--color-nav-shadow);
  transform: translateY(-1px);
}

.content-card {
  margin-top: var(--space-6);
  padding: var(--space-5);
  border-radius: var(--radius-xl);
  background:
    linear-gradient(145deg, var(--color-content-overlay), var(--color-content-overlay-deep)),
    var(--color-paper);
}

.chart-component {
  width: 100%;
}

@media (max-width: 980px) {
  .dashboard-shell {
    padding: var(--space-4);
  }

  .hero-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .dashboard-shell {
    padding: var(--space-3);
  }

  .hero-copy,
  .mission-card,
  .content-card {
    border-radius: var(--radius-lg);
  }

  .content-card {
    padding: var(--space-3);
  }
}
</style>
