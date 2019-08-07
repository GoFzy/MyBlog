const sidebar = require('../../../utils/sidebar');
const children = [
    ['react/', 'React源码学习'],
    ['koa2/', 'Koa2源码学习'],
    ['../', '返回主页面'],
];

module.exports = sidebar.genSidebar('/source-code/', '', children, false);
