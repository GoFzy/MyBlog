const sidebar = require('../../../utils/sidebar');
const children = [
    ['./design-patterns/', '《JavaScript设计模式与开发实践》'],
    ['./es6/', '《ES6 标准入门(第3版)》'],
    ['../', '返回主页面'],
];

module.exports = sidebar.genSidebar('/reading/', '', children, false);

