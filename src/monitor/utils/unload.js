function onload(callback) {
  let timer
  const check = () => {
    // 如果页面加载完成，就执行回调
    if (document.readyState === 'complete') {
      callback()
      clearTimeout(timer) // 清除定时器
    }
  }
  if (document.readyState === 'complete') {
    // 如果已经加载完成，则直接执行回调
    callback()
  } else {
    // 如果没加载完成，则监听 load 事件
    window.addEventListener('load', check, false) // 监听 load 事件
    timer = setTimeout(check, 1000) // 设置定时器，1s 后执行
  }
}
export default onload
