# Koa2源码学习目录
**Koa2**  
以`node_modules/_koa@2.7.0@koa`为例,目录结构如下:
```sh
Koa
|—— lib                     
│     ├── application.js    框架入口，负责管理中间件以及处理请求
│     ├── context.js        context对象的原型，代理request与response对象上的方法和属性
│     ├── request.js        request对象的原型，提供请求方法和属性
│     ├── response.js       response对象的原型，提供响应方法和属性
```
* [application 框架入口](./application)

**其他核心模块**
* [koa-compose 中间件机制](./koa-compose)
* [koa-router 路由模块(1)](./koa-router-layer)
* [koa-router 路由模块(2)](./koa-router-router)

