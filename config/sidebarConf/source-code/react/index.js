const sidebar = require('../../../../utils/sidebar');
const children = [
    ['../', '返回上一级'],
];

module.exports = sidebar.genSidebar('/source/react/', '', children, false);