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
		[
			['function-extend', '函数的扩展'],
      ['promise', 'Promise对象'],
      ['generator', 'Generator函数'],
			['async', 'async函数'],
			['set-weakset', 'Set 与 WeakSet数据结构'],
			['map-weakmap', 'Map 与 WeakMap数据结构'],
      ['../', '返回上一级'],
    ],
	),
	DesignPatterns: sidebar.genSidebar(
		'/reading/design-patterns/', 
		[
			['prototypical', '1.原型继承'],
			['about-this', '2.this、apply和call'],
			['closure', '3.闭包和高阶函数'],
			['singleton', '4.单例模式'],
      ['strategy-pattern', '5.策略模式'],
			['template-method', '6.模板方法模式'],
			['publish-subscribe', '7.发布订阅模式'],
			['../', '返回上一级'],
		], 
	)
};
