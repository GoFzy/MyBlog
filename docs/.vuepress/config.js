const path = require('path');
const navbarconf = require('../../config/navbarConf/index');
const sidebarConf = require('../../config/sidebarConf/index');

module.exports = {
    title: 'GoFzy',
    description: '脚踏实地，仰望星空',
    themeConfig: {
        lastUpdated: '最后更新于：', // string | boolean
        nav: navbarconf,
        sidebar: sidebarConf
    },
}