import onload from '../utils/onload'
import tracker from '../utils/tracker'
import getLastEvent from '../utils/getLastEvent'
import getPathTarget from '../utils/getSelector'
import dayjs from 'dayjs'

function blankScreen() {
  if (!window.PerformanceObserver) {
    return console.log('你的浏览器不支持PerformanceObserver')
  }
  let FMP, LCP
  // 首次输入延迟
  new PerformanceObserver((entryList, observer) => {
    let perfEntries = entryList.getEntries()
    FMP = perfEntries[0]
    observer.disconnect() // 不再观察了
  }).observe({ entryTypes: ['element'] }) // 观察页面中的元素
  // 最大内容绘制
  new PerformanceObserver((entryList, observer) => {
    let perfEntries = entryList.getEntries()
    LCP = perfEntries[perfEntries.length - 1]
    observer.disconnect() // 不再观察了
  }).observe({ entryTypes: ['largest-contentful-paint'] }) // 观察页面中的元素
  // 首次交互
  new PerformanceObserver((entryList, observer) => {
    let lastEvent = getLastEvent()
    let firstInput = entryList.getEntries()[0]
    if (firstInput) {
      let inputDelay = firstInput.processingStart - firstInput.startTime // 输入延迟
      let duration = firstInput.duration // 处理耗时
      if (inputDelay > 0 || duration > 0) {
        tracker.send({
          kind: 'experience', // 用户体验指标
          type: 'firstInputDelay', // 首次输入延迟
          inputDelay: inputDelay ? dayjs(inputDelay).format('mm:sss') : 0, // 首次输入延迟
          duration: duration ? dayjs(duration).format('mm:sss') : 0, // 处理耗时
          startTime: dayjs(firstInput.startTime).format('mm:sss'), // 开始处理的时间
          selector: lastEvent ? getPathTarget(lastEvent) : '' // 最后一个操作的元素
        })
      }
    }
    observer.disconnect() // 不再观察了
  }).observe({ type: 'first-input', buffered: true }) // 观察页面中的元素
  onload(function () {
    setTimeout(() => {
      let perfEntries = performance.getEntriesByType('navigation')
      let navigationTiming = perfEntries[0].toJSON()
      const {
        connectEnd,
        connectStart,
        requestStart,
        responseStart,
        responseEnd,
        domContentLoadedEventStart,
        domContentLoadedEventEnd,
        domInteractive,
        fetchStart,
        loadEventStart
      } = navigationTiming
      // 发送时间指标
      tracker.send({
        kind: 'experience', // 用户体验指标
        type: 'timing', // 统计每个阶段的时间
        connectTime: connectEnd - connectStart, // 连接时间
        ttfbTime: responseStart - requestStart, // 首字节到达时间
        responseTime: responseEnd - responseStart, // 响应读取时间
        parseDOMTime: loadEventStart - domContentLoadedEventStart, // DOM解析时间
        domContentLoadedTime:
          domContentLoadedEventEnd - domContentLoadedEventStart, // DOM加载时间
        timeToInteractive: domInteractive - fetchStart, // 首次可交互时间
        loadTime: loadEventStart - fetchStart // 完整的加载时间
      })
      // 发送性能指标
      let FP = performance.getEntriesByName('first-paint')[0] // 首次绘制
      let FCP = performance.getEntriesByName('first-contentful-paint')[0] //首次内容绘制
      tracker.send({
        kind: 'experience', // 用户体验指标
        type: 'paint', // 统计每个阶段的时间
        firstPaint: FP ? dayjs(FP.startTime).format('mm:sss') : 0, // 首次绘制
        firstContentfulPaint: FCP ? dayjs(FCP.startTime).format('mm:sss') : 0, // 首次内容绘制
        firstMeaningfulPaint: FMP ? dayjs(FMP.startTime).format('mm:sss') : 0, // 首次有意义绘制
        largestContentfulPaint: LCP
          ? dayjs(LCP.renderTime || LCP.loadTime).format('mm:sss')
          : 0 // 最大内容绘制
      })
    }, 3000)
  })
}
export default blankScreen
