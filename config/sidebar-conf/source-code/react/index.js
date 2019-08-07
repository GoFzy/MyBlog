const sidebar = require('@vUtil/sidebar')
const children = [
    ['../', '返回上一级'],
];

module.exports = sidebar.genSidebar('/source-code/react/', '', children, false);