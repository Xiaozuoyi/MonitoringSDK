/**
 * 获取事件冒泡路径
 * @param {Array<HTMLElement>} path 事件冒泡路径
 * @returns {string} 元素选择器
 * @example getSelector(path)
 */
function getSelector(path) {
  return path
    .reverse()
    .filter((element) => element !== window && element !== document)
    .map((element) => {
      let selector = ''
      if (element.id) {
        return `${element.nodeName.toLowerCase()}#${element.id}`
      }
      if (element.className && typeof element.className === 'string') {
        return `${element.nodeName.toLowerCase()}.${element.className}`
      }
      selector = element.nodeName.toLowerCase()

      return selector
    })
    .join(' ')
}
/**
 * 获取事件冒泡路径
 * @param {HTMLAnchorElement} event  事件对象
 * @returns {Array<HTMLElement>} 事件冒泡路径
 */
function getEventPath(event) {
  if (event.path) {
    return event.path
  }
  let { target } = event
  const path = []
  while (target.parentNode !== null) {
    path.push(target)
    target = target.parentNode
  }
  path.push(document, window)
  return path
}
/**
 * 获取最后一个操作的元素
 * @param {Array<HTMLElement>} pathArr 事件冒泡路径
 * @returns {string} 最后一个操作的元素
 * @example getSelector(event)
 */
function getPathTarget(path) {
  if (Array.isArray(path)) {
    return getSelector(path)
  }
  const pathArr = getEventPath(path)
  return getSelector(pathArr)
}

export default getPathTarget
