import dayjs from 'dayjs'
import getLastEvent from '../utils/getLastEvent'
import getPathTarget from '../utils/getSelector'
import tracker from '../utils/tracker'

/**
 * @description: 获取堆栈信息
 * @param {unknown} stack 堆栈信息
 */
function getLines(stack) {
  return stack
    .split('\n')
    .slice(1)
    .map((item) => item.replace(/^\s+at\s+/g, ''))
    .join('^')
}

/**
 * @description: 注入js错误
 * @param {unknown} params
 * @return {*} void | null
 * @export {function} injectJsError
 * @example: injectJsError();
 */
function injectJsError() {
  // 监听全局未捕获的错误
  window.addEventListener(
    'error',
    (event) => {
      const lastEvent = getLastEvent() // 获取最后一个交互事件
      const lastEventPath = lastEvent ? lastEvent.composedPath() : []
      if (event.target && (event.target.src || event.target.herf)) {
        const linkerrorInfo = {
          kind: 'stability', // 监控指标的大类
          type: 'error', // 监控指标的小类
          errorType: 'resourceError', // 错误类型
          filename: event.target.src || event.target.herf, // 报错的文件名
          tagName: event.target.tagName, // 标签名
          selector: getPathTarget(event), // 最后一个操作的元素
          time: dayjs(new Date()).format('YYYY-MM-DD-HH:mm:ss') // 发生时间
        }
        tracker.send(linkerrorInfo) // 上报错误信息
      } else {
        const errorInfo = {
          kind: 'stability', // 监控指标的大类
          type: 'error', // 监控指标的小类
          errorType: 'jsError', // 错误类型
          message: event.message, // 报错信息
          filename: event.filename, // 报错的文件名
          position: `${event.lineno}:${event.colno}`, // 报错的行列号
          stack: getLines(event.error.stack), // 报错的堆栈信息
          selector: lastEvent ? getPathTarget(lastEventPath) : '', // 最后一个操作的元素
          time: dayjs(new Date()).format('YYYY-MM-DD-HH:mm:ss') // 发生时间
        }
        tracker.send(errorInfo) // 上报错误信息
      }
    },
    true
  )
  // 监听全局未处理的promise错误
  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const promiseLastEvent = getLastEvent() // 获取最后一个交互事件
      let message // 错误信息
      let filename // 错误文件名
      let line // 错误行号
      let column // 错误列号
      let stack // 错误堆栈信息
      // 判断promiseLastEvent.reason是否是对象
      if (typeof event.reason === 'string') {
        // 定义上报的错误信息
        const errorInfo = {
          kind: 'stability', // 监控指标的大类
          type: 'error', // 监控指标的小类
          errorType: 'promiseError', // 错误类型
          message: event.reason, // 报错信息
          selector: promiseLastEvent ? getPathTarget(promiseLastEvent) : '', // 最后一个操作的元素
          time: dayjs(new Date()).format('YYYY-MM-DD-HH:mm:ss') // 发生时间
        }
        tracker.send(errorInfo) // 上报错误信息
      } else if (typeof event.reason === 'object') {
        if (event.reason.stack) {
          const [fileName, row, columns] = event.reason.stack
            .match(/at\s+(.+):(\d+):(\d+)/)
            .slice(1)
          filename = fileName
          line = row
          column = columns
        }
        message = event.reason.message
        stack = getLines(event.reason.stack)
        const errorInfo = {
          kind: 'stability', // 监控指标的大类
          type: 'error', // 监控指标的小类
          errorType: 'promiseError', // 错误类型
          message, // 报错信息
          filename, // 报错的文件名
          position: `${line}:${column}`, // 报错的行列号
          stack, // 报错的堆栈信息
          selector: promiseLastEvent ? getPathTarget(promiseLastEvent) : '' // 最后一个操作的元素
        }
        tracker.send(errorInfo) // 上报错误信息
      }
    },
    true
  )
}

export default injectJsError
