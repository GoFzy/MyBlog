require('module-alias/register')
const navbarConf = require('@navbar')
const sidebarConf = require('@sidebar')

module.exports = {
	title: 'GoFzy',
	description: '脚踏实地，仰望星空',
	head: [
		['link', { rel: "icon", href: "/F.png"}]
	],
	themeConfig: {
		lastUpdated: '最后更新于：', // string | boolean
		nav: navbarConf,
		sidebar: sidebarConf
	},
}