<div align="center">

# Monitor-SDK (此文档待更新)

</div>

## 📦 Installation

```bash
pnpm build
```

## 🎯 Quickstart

在项目的顶层

```typescript
const webmonitor = new WebMonitor({
  appid: 'appid'
})
// 只有 appid 是必填项

webmonitor.start()
```

## ⭐️ 支持特性

- 错误捕获：代码报错、资源加载报错、接口请求报错
- 性能数据：FCP、LCP、CLS、TTFB、FID、LongTask
- 网络测速：接口测速、资源测速
- 用户行为：跳出率、PV
- 页面崩溃：基于 worker 的心跳检测
- 个性化指标：Long Task、首屏加载时间
- 日志容灾：localstorage 备份
- 插件机制：所有特性都可以自定义选择
- 支持的 Web 框架：React
- 日志去除重复
- Memory 页面内存
- FPS

TODO:

- 首屏资源瀑布图
- console 按 config.level(log / info / waring / error) 收集
- 主要是方便封装跳转方法，在跳转前等待全局埋点请求全部发送完成，再进行跳转，这样同步的方式埋点数据就不会丢，上面说的是埋点请求和跳转同时进行

## 🎲 具体配置项

```typescript
type Options = {
  appid: string
  waitUidFilled: boolean
  longtask_time?: number
  sample_rate?: number
  plugins?: Plugin[]
  threshold?: number
  endpoint?: string
  method: 'post' | 'get'
  senderType: 'xhr' | 'beacon'
}
```

| 参数名称      | 作用                        | 默认值                        |
| ------------- | --------------------------- | ----------------------------- |
| appid         | 应用标识                    | / 【必填项】                  |
| waitUidFilled | 是否等待 uid 获取后统一上报 | false                         |
| longtask_time | longtask_time               | 50(ms)                        |
| sample_rate   | 采样频率, 要求 0-1 之间     | 0.5                           |
| plugins       | 插件列表                    | 下面说明的全部插件            |
| threshold     | 统一日志上报数量            | 20                            |
| endpoint      | 日志请求地址                | https://bdul0j.laf.dev/logger |
| method        | 日志上报方法                | post                          |
| senderType    | 日志上报工具                | xhr                           |
