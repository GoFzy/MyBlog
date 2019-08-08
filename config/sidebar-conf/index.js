require('module-alias/register');
// 个人简历
const AboutMe = require('./about-me');

// 读书笔记
const { ES6, DesignPatterns, Reading } = require('./reading');

// 源码学习
const { React, Koa2, SourceCode } = require('./source-code');

/**
 * 侧边栏的配置
 * 当路由深度越深时应当排序在更前方
 * 示例: /frontend/ 和 /frontend/css/
 * 
 * 应当将 /frontend/css/ 写在更上方
 */

module.exports = {
	//个人介绍
	'/about-me/': AboutMe,

	//读书笔记
	'/reading/es6/': ES6,
	'/reading/design-patterns/': DesignPatterns,
	'/reading/': Reading,

	//源码学习
	'/source-code/react/': React,
	'/source-code/koa2/': Koa2,
	'/source-code/': SourceCode
}

