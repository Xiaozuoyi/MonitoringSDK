import UAParser from 'ua-parser-js'
import dayjs from 'dayjs'
import chalk from 'chalk'

const host = 'cn-guangzhou.log.aliyuncs.com' // 主机地址
const project = 'monitor-fank' // 项目名称
const logStore = 'pengmonitor-store' // 日志库名称

const parser = new UAParser()
const result = parser.setUA(navigator.userAgent) // 获取浏览器信息

// 获取额外的信息
function getExtraData() {
  return {
    title: document.title, // 页面标题
    url: window.location.href, // 当前页面的url
    timestamp: dayjs(new Date()).format('YYYY-MM-DD-HH:mm:ss'), // 当前时间戳
    userAgent: `${result.getBrowser().name}:${result.getBrowser().version}` // 浏览器信息
  }
}

class SendTracker {
  constructor() {
    this.url = `https://${project}.${host}/logstores/${logStore}/track` // 上报地址
    // this.xhr = new XMLHttpRequest() // 创建 XMLHttpRequest 对象
  }

  send(data = {}) {
    const extraData = getExtraData() // 获取额外的信息
    const log = { ...extraData, ...data } // 整合信息
    // 将对象转换为字符串
    Object.keys(log).forEach((key) => {
      log[key] = `${log[key]}`
    })
    const body = JSON.stringify({
      __logs__: [log]
    }) // 将对象转换为字符串
    fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // 设置请求体类型
        'x-log-apiversion': '0.6.0', // 设置版本号
        'x-log-bodyrawsize': body.length // 设置请求体大小
      },
      body
    })
      .then(() => {
        console.log(chalk.green(chalk.white.bgMagenta.bold('上报成功')))
      })
      .catch((err) => {
        console.log(
          chalk.green(chalk.white.bgRed.bold(`${err.message}` + `上报失败`))
        )
      })
    // console.log('body:', body)
    // this.xhr.open('POST', this.url, true) // 配置请求信息
    // this.xhr.setRequestHeader('Content-Type', 'application/json') // 设置请求体类型
    // this.xhr.setRequestHeader('x-log-apiversion', '0.6.0') // 设置版本号
    // this.xhr.setRequestHeader('x-log-bodyrawsize', body.length) // 设置请求体大小
    // this.xhr.onload = function () {
    //   // 请求成功
    //   console.log(chalk.green(chalk.white.bgMagenta.bold('上报成功')))
    // }
    // this.xhr.onerror = function (err) {
    //   // 请求失败
    //   console.log(
    //     chalk.green(chalk.white.bgRed.bold(`${err.message}` + `上报失败`))
    //   )
    // }
    // this.xhr.send(body) // 发送请求
  }
}
export default new SendTracker()
