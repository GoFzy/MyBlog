const sidebar = require('@vUtil/sidebar')
const children = [
    ['prototypical', '1.原型继承'],
    ['about-this', '2.this、apply和call'],
    ['closure', '3.闭包和高阶函数'],
    ['singleton', '4.单例模式'],
    ['strategy-pattern', '5.策略模式'],
    ['../', '返回上一级'],
];

module.exports = sidebar.genSidebar('/reading/design-patterns/', '', children, false);
