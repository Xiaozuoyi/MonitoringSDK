import tracker from '../utils/tracker'
import onload from '../utils/unload'

let emptyPoints = 0 // 空白点数

function getTagSelector(element) {
  if (element.id) {
    return '#' + element.id
  } else if (element.className && typeof element.className === 'string') {
    return (
      '.' +
      element.className
        .split(' ')
        .filter((item) => !!item)
        .join('.')
    )
  } else {
    return element.nodeName.toLowerCase()
  }
}

function isWrapper(elements) {
  let tagSelector = getTagSelector(elements)
  const wrapperElement = ['body', 'html', '#container', '.content.main'] // 可以根据实际情况调整
  if (wrapperElement.indexOf(tagSelector) != -1) {
    emptyPoints++
  }
}

/**
 * 监控页面白屏
 * @returns {void} 无返回值
 * */
function blankScreen() {
  onload(function () {
    for (let i = 0; i <= 9; i++) {
      let xElments = document.elementsFromPoint(
        (window.innerWidth * i) / 10,
        window.innerHeight / 2
      )
      let yElements = document.elementsFromPoint(
        window.innerWidth / 2,
        (window.innerHeight * i) / 10
      )
      if (xElments.length > 0 && yElements !== null) {
        isWrapper(xElments[0])
        isWrapper(yElements[0])
      }
    }
    // todo: 18 为一个经验值，可以根据实际情况调整
    if (emptyPoints > 0) {
      const centerElements = document.elementsFromPoint(
        window.innerWidth / 2,
        window.innerHeight / 2
      ) // 获取中心点元素
      tracker.send({
        kind: 'stability', // 监控指标大类
        type: 'blank', // 小类型，这是一个 blank 类型
        emptyPoints: emptyPoints, // 空白点数
        screen: window.screen.width + 'X' + window.screen.height, // 屏幕尺寸
        viewPoint: window.innerWidth + 'X' + window.innerHeight, // 视口尺寸
        selector: getTagSelector(centerElements[0]) // 选择器
      })
    }
  }) // 页面加载完成后执行
}
export default blankScreen
