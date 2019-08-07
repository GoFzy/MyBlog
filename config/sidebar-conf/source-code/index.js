const sidebar = require('@vUtil/sidebar')
const children = [
    ['react/', '1. React'],
    ['koa2/', '2. Koa2'],
    ['../', '返回主页面'],
];

module.exports = sidebar.genSidebar('/source-code/', '', children, false);
