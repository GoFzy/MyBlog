# Redux 源码学习目录
`Redux` 目录结构如下
```sh
├── utils/
│     ├── warning.js       # 负责在控制台显示警告信息
├── applyMiddleware.js
├── bindActionCreators.js
├── combineReducers.js
├── compose.js
├── createStore.js
├── index.js               # 入口文件
```
对于入口文件 `index.js` ，内部实现只是单纯的将上述模块作为对象进行导出，所以这里直接对各个模块进行分析:
* [createStore 创建Store](./create-store)
* [redux 中间件机制](./compose-middleware)
