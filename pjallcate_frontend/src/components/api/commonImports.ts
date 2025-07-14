/* eslint-disable @typescript-eslint/no-explicit-any */
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TooltipComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent,
} from 'echarts/components'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export function commonImports() {
  use([
    CanvasRenderer,
    LineChart,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    TitleComponent,
    DataZoomComponent,
  ])
}

// Time formatting utility function
export function formatDateToLocal(datetime: any) {
  const localTime = dayjs.utc(datetime).tz('Asia/Shanghai')
  const dayLabel = `DAY${localTime.diff('2024-10-23', 'day') + 1}`
  return `${dayLabel}\n${localTime.format('HH:mm:ss')}`
}

export function formatDatefrom8num(datetimeStr: string) {
  if (typeof datetimeStr !== 'string' || datetimeStr.length !== 8) {
    throw new Error('Invalid datetime format. Expected 8-digit string.');
  }

  const month = datetimeStr.substring(0, 2);
  const day = datetimeStr.substring(2, 4);
  const hour = datetimeStr.substring(4, 6);
  const minute = datetimeStr.substring(6, 8);
  const second = '10'; // 秒数固定为 10 秒
  const dateTimeString = `2024-${month}-${day} ${hour}:${minute}:${second}`;
  // 在 'Asia/Shanghai' 时区解析日期时间
  const dateInShanghai = dayjs.tz(dateTimeString, 'YYYY-MM-DD HH:mm:ss', 'Asia/Shanghai');
  // 将时间转换为 UTC
  const dateInUTC = dateInShanghai.utc();
  // 格式化为 ISO 8601 字符串，包含 'Z' 表示 UTC 时区
  const isoString = dateInUTC.toISOString();
  return isoString;
}

export function normalizeTo5Min(time: dayjs.Dayjs) {
  const minutes = Math.floor(time.minute() / 5) * 5
  return time.minute(minutes).second(0).millisecond(0)
}

// delay function in ms
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// V2 api needs filling to show normally.
export function fillData_AllocationCount(
  rawData: {
    datetime: string
    allocated_count: number
    unallocated_count: number
  }[],
  endTimeStr = '2024-11-01T08:50:10Z', // UTC+0 结束时间
  intervalMinutes = 5,
) {
  if (rawData.length === 0) return []

  const parsedData = rawData.map(item => {
    const time = normalizeTo5Min(dayjs(item.datetime))
    return {
      ...item,
      normTime: time.format('YYYY-MM-DD HH:mm'),
      datetimeObj: time,
    }
  })

  // 去重，仅保留每个时间点的最后一条记录
  const uniqueMap = new Map()
  for (const item of parsedData) {
    uniqueMap.set(item.normTime, item)
  }

  const normalizedData = Array.from(uniqueMap.values()).sort((a, b) =>
    a.datetimeObj.isBefore(b.datetimeObj) ? -1 : 1,
  )

  const result = []
  let i = 0
  let lastKnown = normalizedData[0]
  const start = normalizedData[0].datetimeObj
  const end = normalizeTo5Min(dayjs(endTimeStr)) // 结束点向下取整为5分钟

  for (
    let time = start.clone();
    time.isBefore(end) || time.isSame(end);
    time = time.add(intervalMinutes, 'minute')
  ) {
    const timeKey = time.format('YYYY-MM-DD HH:mm')

    if (i < normalizedData.length && normalizedData[i].normTime === timeKey) {
      lastKnown = normalizedData[i]
      result.push({
        datetime: time.toISOString(),
        allocated_count: lastKnown.allocated_count,
        unallocated_count: lastKnown.unallocated_count,
      })
      i++
    } else {
      result.push({
        datetime: time.toISOString(),
        allocated_count: lastKnown.allocated_count,
        unallocated_count: lastKnown.unallocated_count,
      })
    }
  }

  return result
}

export function fillTimeSeriesByPrefix(
  rawData: {
    datetime: string
    project_prefix: string
    allocated_count: number
    unallocated_count: number
  }[],
  prefix: string,
  endTimeStr = '2024-11-01T08:50:10Z',
) {
  const filtered = rawData
    .filter(item => item.project_prefix === prefix)
    .map(item => {
      const dt = normalizeTo5Min(dayjs(item.datetime))
      return {
        datetime: dt.toISOString(),
        normKey: dt.format('YYYY-MM-DD HH:mm'),
        allocated_count: item.allocated_count,
        unallocated_count: item.unallocated_count,
      }
    })

  const map = new Map()
  for (const row of filtered) {
    map.set(row.normKey, row)
  }

  const sortedKeys = Array.from(map.keys()).sort()
  if (sortedKeys.length === 0) return { allocated: [], unallocated: [], x: [] }

  const start = normalizeTo5Min(dayjs(sortedKeys[0]))
  const end = normalizeTo5Min(dayjs(endTimeStr))

  const filled = []
  let last = map.get(sortedKeys[0])

  for (
    let t = start.clone();
    t.isBefore(end) || t.isSame(end);
    t = t.add(5, 'minute')
  ) {
    const key = t.format('YYYY-MM-DD HH:mm')
    const point = map.get(key)
    if (point) last = point

    filled.push({
      datetime: t.toISOString(),
      allocated_count: last?.allocated_count ?? 0,
      unallocated_count: last?.unallocated_count ?? 0,
    })
  }

  return {
    x: filled.map(p => formatDateToLocal(p.datetime)),
    allocated: filled.map(p => p.allocated_count),
    unallocated: filled.map(p => p.unallocated_count),
  }
}


// Deprecated, do not use!
export const commonchangedProject = [
  { project: 'BCHENLEI1', old: '2021212832', new: '2021212558' },
  { project: 'BXUFANGMIN2', old: '2021212964', new: '2021213196' },
  { project: 'QARW7', old: '2021212973', new: '2019213388' },
  { project: 'QASA5', old: '2021213201', new: '2021212595' },
  { project: 'QAW2', old: '2021213130', new: '2021212574' },
  { project: 'QCC5', old: '2021212892', new: '2021212871' },
  { project: 'QFL8', old: '2021213195', new: '2021212817' },
  { project: 'QGG5', old: '2021212562', new: '2021213100' },
  { project: 'QGG8', old: '2021213060', new: '2021212893' },
  { project: 'QHA2', old: '0', new: '2021212873' },
  { project: 'QMC3', old: '2021212694', new: '2021212864' },
  { project: 'QSP3', old: '2021212657', new: '2021212991' },
  { project: 'QVW9', old: '2021212966', new: '2021212753' },
]

// Deprecated, do not use!
export const commonchangedStudent = [
  '2021212973',
  '2021213155',
  '2021213130',
  '2021212892',
  '2021212748',
  '2021212694',
  '2021213195',
  '2021212966',
  '2021213201',
  '2021212657',
  '2021212964',
  '2021212832',
]

export const commonChartOptions = {
  title: {
    left: 'center',
    top: '0.5%',
    textStyle: {
      fontSize: 15,
    },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      animation: false,
      label: {
        backgroundColor: '#505765',
      },
    },
  },
  legend: {
    top: '5%',
  },
  xAxis: {
    type: 'category',
    data: [] as string[],
    name: '',
    nameLocation: 'middle',
    nameGap: 35,
  },
  yAxis: {
    type: 'value',
    name: 'Number of Projects',
    nameLocation: 'middle',
    nameGap: 35,
  },
  dataZoom: [
    {
      type: 'slider',
      start: 0,
      end: 100,
      height: 30,
      bottom: '5%',
    },
    {
      type: 'inside',
      start: 0,
      end: 100,
    },
  ],
  grid: {
    left: '3%',
    right: '5%',
    bottom: '14%',
    top: '12%',
    containLabel: true,
  },
}
