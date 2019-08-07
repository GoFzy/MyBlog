# Koa2源码学习目录
以`node_modules/_koa@2.7.0@koa`为例,目录结构如下:
```sh
Koa
|—— lib                     
│     ├── application.js    框架入口，负责管理中间件以及处理请求
│     ├── context.js        context对象的原型，代理request与response对象上的方法和属性
│     ├── request.js        request对象的原型，提供请求方法和属性
│     ├── response.js       response对象的原型，提供响应方法和属性
```

* [1. application 框架入口](./application)