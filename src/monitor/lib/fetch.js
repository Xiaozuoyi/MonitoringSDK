import tracker from '../utils/tracker'

function injectFetch() {
  let oldFetch = window.fetch // 保存原有的 fetch 函数

  /**
   * 重写 fetch 函数
   * @param {string} url 请求地址
   * @param {Object} options 请求参数
   * @returns  {Promise} 返回 Promise 对象
   */
  function hijackFetch(url, options) {
    let startTime = Date.now() // 请求开始时间
    // 返回一个 Promise 对象
    return new Promise((resolve, reject) => {
      // 调用原有的 fetch 函数
      oldFetch.apply(this, [url, options]).then(
        // 响应成功
        async (response) => {
          // 缓存原有的 json 方法
          const oldResponseJson = response.__proto__.json
          // 重写 json 方法
          response.__proto__.json = function (...responseRest) {
            return new Promise((responseResolve, responseReject) => {
              // 返回原有的 json 方法
              oldResponseJson.apply(this, responseRest).then(
                // 响应成功
                (result) => {
                  console.log('响应成功：', responseRest)
                  // 返回成功的 Promise 对象
                  responseResolve(result)
                },
                // 响应失败
                (responseRejection) => {
                  console.log('响应失败：', responseRest)
                  // 上报数据
                  sendLogData({
                    url,
                    startTime,
                    statusText: response.statusText,
                    status: response.status,
                    eventType: 'error',
                    response: responseRejection.stack,
                    options
                  })
                  // 返回失败的 Promise 对象
                  responseReject(responseRejection)
                }
              )
            })
          }
          // 返回成功的 Promise 对象
          resolve(response)
        },
        // 响应失败
        (rejection) => {
          // 上报数据
          sendLogData({
            url,
            startTime,
            eventType: 'load',
            response: rejection.stack,
            options
          })
          // 返回失败的 Promise 对象
          reject(rejection)
        }
      )
    })
  }
  window.fetch = hijackFetch
}

const sendLogData = ({
  startTime,
  statusText = '',
  status = '',
  eventType,
  url,
  options,
  response
}) => {
  let duration = Date.now() - startTime // 计算响应时间
  const { method = 'get', body } = options || {} // 请求方法和请求参数
  tracker.send({
    kind: 'stability', // 监控指标的大类
    type: 'fetch', // 小类型 这是fetch请求
    eventType: eventType, // load error
    pathname: url, // 请求路径
    status: status + '-' + statusText, // 状态码
    duration, // 响应时间
    response: response ? JSON.stringify(response) : '', // 响应体
    method, // 请求方法
    params: body || '' // 请求参数
  })
}
export default injectFetch
