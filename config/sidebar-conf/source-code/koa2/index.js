const sidebar = require('@vUtil/sidebar')
const children = [
    ['application', '1.框架入口application'],
    ['../', '返回上一级'],
];

module.exports = sidebar.genSidebar('/source-code/koa2/', '', children, false);