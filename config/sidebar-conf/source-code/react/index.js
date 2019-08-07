const sidebar = require('@vUtil/sidebar')
const children = [
    ['create-element', '1. React.createElement'],
    ['../', '返回上一级'],
];

module.exports = sidebar.genSidebar('/source-code/react/', '', children, false);