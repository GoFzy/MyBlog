const sidebar = require('@vUtil/sidebar')

module.exports = {
  frontEnd: sidebar.genSidebar(
    '/front-end/',
    [
      ['process', '1. 浏览器的多进程机制'],
      ['http', '2. http协议'],
      ['./', '返回上一级'],
    ],
  )
}