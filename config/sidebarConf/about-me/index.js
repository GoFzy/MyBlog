const sidebar = require('../../../utils/sidebar');
const children = [
    ['../', '返回主页面'],
];

module.exports = sidebar.genSidebar('/about-me/', '', children, false);
