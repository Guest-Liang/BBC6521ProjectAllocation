import axios from 'axios'
import { delay } from './commonImports'
import * as cmImports from './commonImports'

interface AllocationRecord {
  d: string; // datetime 简化为 d
  a: string | null; // allocated_to 简化为 a
  p: string; // project_id 简化为 p
  i: number; // id 简化为 i
}
const BASE_URL = 'http://localhost:3000'
let cachedData: AllocationRecord[] | null = null
const loadAllData = async (): Promise<AllocationRecord[]> => {
  if (!cachedData) {
    const filePaths = [
      '/BBC6521ProjectAllocation/data_1_69462_flat.json',
      '/BBC6521ProjectAllocation/data_69463_265590_flat.json',
      '/BBC6521ProjectAllocation/data_265591_461718_flat.json',
      '/BBC6521ProjectAllocation/data_461719_657846_flat.json',
      '/BBC6521ProjectAllocation/data_657847_853974_flat.json',
      '/BBC6521ProjectAllocation/data_853975_1050102_flat.json',
      '/BBC6521ProjectAllocation/data_1050103_1246230_flat.json'
    ]
    const dataPromises = filePaths.map(async (path) => {
      const response = await fetch(path)
      if (!response.ok) throw new Error(`Failed to fetch ${path}`)
      return response.json() as Promise<AllocationRecord[]>
    })
    const allData = await Promise.all(dataPromises)
    cachedData = allData.flat()
  }
  return cachedData
}

export const isUsingJSON = true

// 获取当前时间，格式化字符串
const getCurrentTimestamp = () => new Date().toLocaleString()

// 获取总的分配数
export const fetchAllocationData = async (): Promise<any> => {
  console.log(`[${getCurrentTimestamp()}] Fetching allocation data...`)
  if (isUsingJSON) {
    console.log('Using JSON source')
    const AllData = await loadAllData()
    const result: { [key: string]: { datetime: string; allocated_count: number; unallocated_count: number } } = {}
    AllData.forEach((record: AllocationRecord) => { 
      if (!result[record.d]) {
        result[record.d] = {
          datetime: cmImports.formatDatefrom8num(record.d),
          allocated_count: 0,
          unallocated_count: 0,
        }
      }
      if (record.a) {
        result[record.d].allocated_count += 1
      } else {
        result[record.d].unallocated_count += 1
      }
    })
    console.log(`[${getCurrentTimestamp()}] Successfully fetched allocation data.`)
    return Object.values(result).sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
  } else {
    console.log('Using API source')
    try {
      const response = await axios.get(`${BASE_URL}/api/allocation-count`)
      console.log(`[${getCurrentTimestamp()}] Successfully fetched allocation data.`)
      return response.data
    } catch (error) {
      console.error(`Error fetching allocation data: ${error}`)
      return []
    }
  }
}

// 获取项目列表
export const getProjectList = async (): Promise<string[]> => {
  console.log(`[${getCurrentTimestamp()}] Fetching project list...`)
  if (isUsingJSON) {
    console.log('Using JSON source')
    const AllData = await loadAllData()
    const projectIds = AllData.slice(0, 681)
      .map((project: AllocationRecord) => project.p)
      .filter((id): id is string => id !== undefined)
    console.log(`[${getCurrentTimestamp()}] Successfully fetched project list.`)
    return projectIds
  } else {
    console.log('Using API source')
    try {
      const response = await axios.get(`${BASE_URL}/api/projects`)
      console.log(`[${getCurrentTimestamp()}] Successfully fetched project list.`)
      return response.data.map((project: any) => project.project_id)
    } catch (error) {
      console.error(
        `[${getCurrentTimestamp()}] Error fetching project list: ${error}`,
      )
      return []
    }
  }
}

// 获取项目分配信息
export const getProjectAllocation = async ( projectIds: string[], ): Promise<any> => {
  console.log(`[${getCurrentTimestamp()}] Fetching allocation data for ${projectIds.length} projects...`,)
  if (isUsingJSON) {
    console.log('Using JSON source')
    const result: { [key: string]: { datetime: string; allocated_to: string | null }[] } = {}
    const batchSize = 5000
    const AllData = await loadAllData()

    for (let i = 0; i < AllData.length; i += batchSize) {
      const batch = AllData.slice(i, i + batchSize)
  
      batch.forEach((record: AllocationRecord) => {
        if (projectIds.includes(record.p)) {
          if (!result[record.p]) {
            result[record.p] = []
          }
          result[record.p].push({
            datetime: cmImports.formatDatefrom8num(record.d),
            allocated_to: record.a
          })
        }
      })
  
      await delay(1)
    }
    console.log(`[${getCurrentTimestamp()}] Successfully fetched allocation data.`)
    return result
  } else {
    console.log('Using API source')
    try {
      const response = await axios.get(`${BASE_URL}/api/project-allocation`, {
        params: { project_ids: projectIds.join(',') },
      })
      console.log(`[${getCurrentTimestamp()}] Successfully fetched allocation data.`,)
      return response.data
    } catch (error) {
      console.error(`[${getCurrentTimestamp()}] Error fetching project allocation data: ${error}`,)
      return {}
    }
  }
}

// 检查项目是否有变化
export const checkProjectChanges = async (allocationData: any): Promise<string[]> => {
  return new Promise((resolve) => {
    const changedProjects: string[] = []
    console.log(`[${getCurrentTimestamp()}] Checking for changes in project allocation...`)
    for (const projectId in allocationData) {
      const data = allocationData[projectId]
      let firstNonNullIndex: number | null = null
      let hasChanges = false

      for (let i = 0; i < data.length; i++) {
        if (data[i].allocated_to !== null) {
          firstNonNullIndex = i
          break
        }
      }

      if (firstNonNullIndex !== null) {
        for (let i = firstNonNullIndex + 1; i < data.length; i++) {
          if (
            data[i].allocated_to !== null &&
            data[i].allocated_to !== data[firstNonNullIndex].allocated_to
          ) {
            hasChanges = true
            break
          }
        }
      }

      if (hasChanges) changedProjects.push(projectId)
    }
    console.log(
      `[${getCurrentTimestamp()}] Finished checking. Found ${changedProjects.length} projects with changes.`,
    )
    resolve(changedProjects)
  })
}

// 获取学生列表
export const getStudentList = async (): Promise<string[]> => {
  console.log(`[${getCurrentTimestamp()}] Fetching student list...`)
  if (isUsingJSON) {
    console.log('Using JSON source')
    const AllData = await loadAllData()
    const studentIds = AllData.slice(-681)
      .map((student: AllocationRecord) => student.a)
      .filter((id): id is string => id !== null && /^\d+$/.test(id))
    console.log(`[${getCurrentTimestamp()}] Successfully fetched student list.`)
    return studentIds
  } else {
    console.log('Using API source')
    try {
      const response = await axios.get(`${BASE_URL}/api/students-list`)
      console.log(`[${getCurrentTimestamp()}] Successfully fetched student list.`)
      return response.data
    } catch (error) {
      console.error(
        `[${getCurrentTimestamp()}] Error fetching student list: ${error}`,
      )
      return []
    }    
  }

}

// 获取学生分配信息
export const getStudentAllocation = async (studentIds: string[], ): Promise<any> => {
  console.log(`[${getCurrentTimestamp()}] Fetching allocation data for ${studentIds.length} students...`,)
  if (isUsingJSON) {
    console.log('Using JSON source')
    const result: {}[] = []
    const batchSize = 2000
    const AllData = await loadAllData()
    
    for (let i = 0; i < AllData.length; i += batchSize) {
      const batch = AllData.slice(i, i + batchSize)
      batch.forEach((record: AllocationRecord) => {
        if (record.a !== null && studentIds.includes(record.a)) {
          result.push({
            project_id: record.p,
            datetime: cmImports.formatDatefrom8num(record.d),
            allocated_to: record.a
          })
        }
      })
      await delay(1)
    }
    console.log(`[${getCurrentTimestamp()}] Successfully fetched allocation data.`)
    return result
  } else {
    console.log('Using API source')
    try {
      const response = await axios.get(`${BASE_URL}/api/students`, {
        params: { student_ids: studentIds.join(',') },
      })
      console.log(
        `[${getCurrentTimestamp()}] Successfully fetched allocation data.`,
      )
      return response.data
    } catch (error) {
      console.error(
        `[${getCurrentTimestamp()}] Error fetching student allocation data: ${error}`,
      )
      return {}
    }    
  }
}

// 检查学生是否有变化
export const checkStudentChanges = async (
  studentIds: string[],
  allocationData: any,
): Promise<string[]> => {
  console.log(`[${getCurrentTimestamp()}] Checking for changes in student allocation...`)

  const changedStudents: string[] = []
  const batchSize = 10

  for (let i = 0; i < studentIds.length; i += batchSize) {
    const batch = studentIds.slice(i, i + batchSize)

    for (const id of batch) {
      let firstProjectId: string | null = null
      let firstProjectIndex = 0
      let hasChanges = false

      for (let j = 0; j < allocationData.length; j++) {
        if (allocationData[j].allocated_to === id) {
          firstProjectId = allocationData[j].project_id
          firstProjectIndex = j
          break
        }
      }

      if (firstProjectId) {
        for (const entry of allocationData.slice(firstProjectIndex + 1)) {
          if (entry.allocated_to === id && entry.project_id !== firstProjectId) {
            hasChanges = true
            break
          }
        }
      }
      if (hasChanges) changedStudents.push(id)
    }

    await delay(1)
  }

  console.log(
    `[${getCurrentTimestamp()}] Finished checking. Found ${changedStudents.length} students with changes.`,
  )
  return changedStudents
}

// 以Q\B前缀区分分配数
export const fetchAllocationDataByPrefix = async (): Promise<any> => {
  console.log(`[${getCurrentTimestamp()}] Fetching allocation data by prefix...`)
  
  if (isUsingJSON) {
    console.log('Using JSON source')
    const AllData = await loadAllData()
    const result: { 
      datetime: string
      project_prefix: string
      allocated_count: string
      unallocated_count: string
    }[] = []

    const tempMap: { [key: string]: { datetime: string; project_prefix: string; allocated_count: number; unallocated_count: number } } = {}

    AllData.forEach((record: AllocationRecord) => { 
      const prefix = record.p.startsWith('Q') ? 'QMUL' : record.p.startsWith('B') ? 'BUPT' : 'Other'
      const key = `${record.d}_${prefix}`

      if (!tempMap[key]) {
        tempMap[key] = {
          datetime: cmImports.formatDatefrom8num(record.d),
          project_prefix: prefix,
          allocated_count: 0,
          unallocated_count: 0
        }
      }

      if (record.a) {
        tempMap[key].allocated_count += 1
      } else {
        tempMap[key].unallocated_count += 1
      }
    })

    Object.values(tempMap).forEach(item => {
      result.push({
        datetime: item.datetime,
        project_prefix: item.project_prefix,
        allocated_count: item.allocated_count.toString(),
        unallocated_count: item.unallocated_count.toString()
      })
    })

    console.log(`[${getCurrentTimestamp()}] Successfully fetched allocation data.`)
    return result.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
  
  } else {
    console.log('Using API source')
    try {
      const response = await axios.get(`${BASE_URL}/api/allocation-by-prefix`)
      console.log(`[${getCurrentTimestamp()}] Successfully fetched allocation data.`)
      return response.data
    } catch (error) {
      console.error(`Error fetching allocation data: ${error}`)
      return []
    }
  }
}




// 主函数，示例调用
export const checkChangedProandStu = async () => {
  // 获取项目列表
  const projectIds = await getProjectList()
  if (!projectIds.length) return

  // 获取所有项目的分配信息
  const allocationData = await getProjectAllocation(projectIds)

  // 找出有变化的项目
  const changedProjects = await checkProjectChanges(allocationData)
  if (changedProjects.length) {
    console.log(
      `[${getCurrentTimestamp()}] 有变化的项目有：${changedProjects.length} 个`,
    )
    console.log(changedProjects)
  } else {
    console.log(`[${getCurrentTimestamp()}] 没有项目分配发生变化`)
  }

  // 获取学生列表
  const studentIds = await getStudentList()
  if (!studentIds.length) return

  // 获取所有学生的分配信息
  const studentAllocationData = await getStudentAllocation(studentIds)

  // 找出有变化的学生
  const changedStudents = await checkStudentChanges(studentIds, studentAllocationData)
  if (changedStudents.length) {
    console.log(
      `[${getCurrentTimestamp()}] 有变化的学生有：${changedStudents.length} 个`,
    )
    console.log(changedStudents)
  } else {
    console.log(`[${getCurrentTimestamp()}] 没有学生分配发生变化`)
  }
}
