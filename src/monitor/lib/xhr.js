import tracker from '../utils/tracker'
/**
 * 监控 ajax 请求
 * @returns {void} 无返回值
 * */
function xhrMonitor() {
  const { XMLHttpRequest } = window // 重写原生的 XMLHttpRequest
  const oldOpen = XMLHttpRequest.prototype.open // 缓存原生的 open 方法

  XMLHttpRequest.prototype.open = function open(method, url, async, ...rest) {
    // 如果不是日志上报的接口，就记录下来
    if (!url.match(/logstores/) && !url.match(/sockjs/)) {
      this.logData = {
        method,
        url,
        async
      }
    }
    // 返回原生的 open 方法
    return oldOpen.apply(this, [method, url, async, ...rest]) // 解释：这里的 arguments 就是 open 方法的参数
  }
  const oldSend = XMLHttpRequest.prototype.send // 缓存原生的 send 方法
  /**
   * 重写 send 方法
   * @param {*} value 值
   * @returns {unknown} 返回值
   * */
  XMLHttpRequest.prototype.send = function send(body) {
    if (this.logData) {
      const startTime = Date.now() // 记录开始时间
      // handler 用于处理响应的回调函数
      const handler = (type) => () => {
        const duration = Date.now() - startTime // 计算响应时间
        const { status } = this // 响应的状态码
        const { statusText } = this // 响应的状态文本
        const { response } = this // 响应体
        // 上报数据
        tracker.send({
          kind: 'stability', // 监控指标的大类
          type: 'xhr', // 小类型 这是ajax请求
          eventType: type,
          pathname: this.logData.url, // 请求路径
          status: `${status}-${statusText}`, // 状态码
          duration, // 响应时间
          response: response ? JSON.stringify(response) : '', // 响应体
          params: body || '' // 请求参数
        })
      }
      this.addEventListener('load', handler('load'), false)
      this.addEventListener('error', handler('error'), false)
      this.addEventListener('abort', handler('abort'), false)
      return oldSend.apply(this, arguments)
    }
  }
}

export default xhrMonitor
