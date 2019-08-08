const sidebar = require('@vUtil/sidebar')

module.exports = {
	SourceCode: sidebar.genSidebar(
		'/source-code/',
		[
			['react/', '1. React'],
			['koa2/', '2. Koa2'],
			['../', '返回主页面'],
		],
	),
	React: sidebar.genSidebar(
		'/source-code/react/', 
		[
			['create-element', '1. React.createElement'],
			['../', '返回上一级'],
		], 
	),
	Koa2: sidebar.genSidebar(
		'/source-code/koa2/', 
		[
			['application', '1.框架入口application'],
			['../', '返回上一级'],
		], 
	)
};
