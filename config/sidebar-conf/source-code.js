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
			['react.component', '2. React.Component'],
			['reactdom.render', '3. ReactDOM.render(1)'],
			['reactdom.render2', '4. ReactDOM.render(2)'],
			['../', '返回上一级'],
		], 
	),
	Koa2: sidebar.genSidebar(
		'/source-code/koa2/', 
		[
			['application', '1. 框架入口application'],
			['koa-compose', '2. koa-compose 中间件机制'],
			['koa-router-layer', '3. koa-router 路由模块(1)'],
			['./koa-router-router', '4. koa-router 路由模块(2)'],
			['../', '返回上一级'],
		], 
	)
};
