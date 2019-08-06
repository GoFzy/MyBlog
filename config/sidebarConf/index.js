// 个人介绍
const AboutMe = require('./about-me/index');


// 读书笔记
const ES6 = require('./reading/es6/index');
const DesignPatterns = require('./reading/design-patterns/index');
const Reading = require('./reading/index');

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
}

