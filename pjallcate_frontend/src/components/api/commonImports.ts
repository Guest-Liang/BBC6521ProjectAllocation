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

// delay function in ms
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

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
    data: [],
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
