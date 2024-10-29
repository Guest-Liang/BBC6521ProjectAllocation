import { createRouter, createWebHistory } from 'vue-router'
import AllocationCountChart from '../components/AllocationCountChart.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: AllocationCountChart,
    },
  ],
})

export default router
