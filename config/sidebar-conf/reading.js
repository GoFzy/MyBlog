const sidebar = require('@vUtil/sidebar')

module.exports = {
	Reading: sidebar.genSidebar(
		'/reading/', 
		[
			['design-patterns/', '《JavaScript设计模式与开发实践》'],
			['es6/', '《ES6 标准入门(第3版)》'],
			['../', '返回主页面'],
		], 
	),
	ES6: sidebar.genSidebar(
		'/reading/es6/', 
		[], 
	),
	DesignPatterns: sidebar.genSidebar(
		'/reading/design-patterns/', 
		[
			['prototypical', '1.原型继承'],
			['about-this', '2.this、apply和call'],
			['closure', '3.闭包和高阶函数'],
			['singleton', '4.单例模式'],
			['strategy-pattern', '5.策略模式'],
			['../', '返回上一级'],
		], 
	)
};
