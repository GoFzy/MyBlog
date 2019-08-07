# application.js
我们首先来看看框架的入口文件 `application.js` 文件：
```js
const isGeneratorFunction = require('is-generator-function'); //判断当前传入的function是否为标准的 generator function
const debug = require('debug')('koa:application');  //js调试工具
const onFinished = require('on-finished');          //事件监听，当http请求关闭，完成或者出错时调用注册好的回调
const response = require('./response');             //响应请求 
const compose = require('koa-compose');             //中间件函数数组
const isJSON = require('koa-is-json');              //判断是否为json数据
const context = require('./context');               //运行服务的上下文
const request = require('./request');               //客户端的请求
const statuses = require('statuses');               //请求状态码
const Emitter = require('events');                  //事件循环
const util = require('util');
const Stream = require('stream');
const http = require('http');
const only = require('only');                       //白名单选择
const convert = require('koa-convert');             //兼容旧版本koa中间件
const deprecate = require('depd')('koa');           //判断当前运行的koa接口是否过期，若过期则提示升级
```
以上是koa入口文件的依赖分析，接下来我们对整个 `application.js` 进行一个快速的概览:
```js
module.exports = class Application extends Emitter {
    constructor() {...}             // 构造函数
    listen(...args){...}            // 服务启动
    toJSON() {...}
    inspect() {...}
    use(fn) {}                      // 添加中间件
    callback() {}                   // 返回一个处理请求的回调函数
    handleRequest() {}              // 处理请求的回调函数
    createContext() {}              // 初始化一个上下文 context 对象
    onerror() {}                    // 错误处理函数
}

function respond(ctx) {...}         // 对请求的响应进行处理
``` 
可以看到 `application.js` 可以分为两部分
* 第一部分是暴露了一个 `Application` 类供我们使用, 也就是说我们 `new` 一个 `koa` 对象实质上就是新建一个 `Application` 的实例对象. 而 ` Application` 类是继承于 `Node.js events` 模块, 所以我们在 `koa` 实例对象上可以使用 `on`, `emit` 等方法进行事件监听
* 第二部分是使用 `respond` 函数对响应内容进行处理

## 一、Application 类
```js
module.exports = class Application extends Emitter {
  constructor() {
		super();
		this.proxy = false;             //它的作用在于是否获取真正的客户端 ip 地址
		this.middleware = [];           //保存通过app.use注册的中间件
		this.subdomainOffset = 2;       //subdomainOffset 属性会改变获取 subdomain 时返回数组的值,
		                                //比如 test.page.example.com 域名, 如果设置 subdomainOffset 为 2, 那么返回的数组值为 ["page", "test"], 如果设置为 3, 那么返回数组值为 ["test"].
		this.env = process.env.NODE_ENV || 'development';   //环境参数
		this.context = Object.create(context);              //context模块，通过 context.js 创建
		this.request = Object.create(request);              //request模块，通过 request.js 创建
		this.response = Object.create(response);            //reponse模块，通过 reponse.js 创建
	}
	//Object.create方法新建一个对象且可以定制化他的原型对象 参考文章：https://juejin.im/post/5acd8ced6fb9a028d444ee4e#heading-3
	
  listen(...args) {
		debug('listen');
		const server = http.createServer(this.callback());
		return server.listen(...args);
	}
	
	use(fn) {
    if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
    if (isGeneratorFunction(fn)) {
      deprecate('Support for generators will be removed in v3. ' +
                'See the documentation for examples of how to convert old middleware ' +
                'https://github.com/koajs/koa/blob/master/docs/migration.md');
      fn = convert(fn);		// 为了支持koa1中generator中间件的写法，对其进行转换
    }
    debug('use %s', fn._name || fn.name || '-');
    this.middleware.push(fn);
    return this;
  }
  ...
}
```
我们可以看到在 `Application` 继承了 `Emitter` ，而 `Emitter` 是由 `events` 包导入，因此这个类可以直接为自定义事件注册回调函数和触发事件，同时还能捕捉其他地方触发的事件。关于[`Node event`详见其官网](http://nodejs.cn/api/events.html)  
除了这些基本属性之外，还有两个比较重要的原型方法 **`listen`** 与 **`use`**

### 1.1 listen
首先我们来看一下 `listen` 方法，其内部通过 `http.createServer` 创建了一个 `http` 服务实例，然后通过这个实例的 `listen` 方法监听端口号，需要注意的是在创建服务实例时，将`this.callback()` 作为参数传入，接下来我们看看这个实例 `callback` 方法中有什么吧
```js
// application.js
module.exports = class Application extends Emitter {
  callback() {
    const fn = compose(this.middleware); 				  // 把所有middleware进行了组合，使用了koa-compose

    const handleRequest = (req, res) => {				  // handleRequest 函数相当于 http.creatServer 的回调函数, 有 req, res 两个参数, 代表原生的 request, response 对象.
      const ctx = this.createContext(req, res);		// 每次接受一个新的请求就生成一个全新的 context
      return this.handleRequest(ctx, fn); 				// 返回了本身的回调函数
    };

    return handleRequest;
	}
}
```
可以看到， `this.callback` 回调函数中：
* 首先通过 `koa-compose` 拿到了中间件组合
* 然后使用 `this.createContext` 创建了上下文环境对象 `ctx`, 主要是一些挂载操作：
```js
createContext(req, res) {
	const context = Object.create(this.context);
	const request = context.request = Object.create(this.request);
	const response = context.response = Object.create(this.response);
	context.app = request.app = response.app = this;
	context.req = request.req = response.req = req;
	context.res = request.res = response.res = res;
	request.ctx = response.ctx = context;
	request.response = response;
	response.request = request;
	context.originalUrl = request.originalUrl = req.url;
	context.state = {};
	return context;
}
```
* 最后返回了 `this.handleRequest` 方法的执行结果，这里详细介绍下`this.handleRequest` 方法：
```js
handleRequest(ctx, fnMiddleware) {
	const res = ctx.res;
	res.statusCode = 404;                      
	const onerror = err => ctx.onerror(err);			            // 错误处理	
	const handleResponse = () => respond(ctx);		                // 响应处理
	onFinished(res, onerror);										// 为 res 对象添加错误处理响应，当res结束时，执行 context 的 onerror 函数(这里需要注意区分 context 与 koa 实例中的 onerror)
	return fnMiddleware(ctx).then(handleResponse).catch(onerror);	// 执行中间件数组中所有函数，并在结束时调用 respond 函数
}
```
所以对于 `this.callback` 方法，个人总结一下，做了两个件事：   
① 通过生成一个新的 `context` 对象并建立 `koa` 中 `context、 request、response` 属性之间与原生 `http` 对象的关系；  
② 通过 `handleRequest` 函数执行中间件所有的函数，并在中间件函数执行结束时调用 `respond`

## 二、respond
对于 `respond` 函数，其核心就是根据不同类型的数据对 `http` 的响应头与响应体进行处理:
```js
function respond(ctx) {
  // allow bypassing koa
  if (false === ctx.respond) return;

  if (!ctx.writable) return;          // writeable 是原生 response 对象的 writeable 属性，检查是否为可写流

  const res = ctx.res;
  let body = ctx.body;
  const code = ctx.status;

  // ignore body
  if (statuses.empty[code]) {       // 如果响应的statuCode 是属于 body 为空的类型，例如204(not content) 304(not modified)，将body设为null
    // strip headers
    ctx.body = null;
    return res.end();
  }

  if ('HEAD' == ctx.method) {                // headersSent 属性是 Node 原生 response 对象的上的，用于检查 http 响应头是否已经被发送
    if (!res.headersSent && isJSON(body)) {  // 如果如果头部未被发送，那么添加 length 头部
      ctx.length = Buffer.byteLength(JSON.stringify(body));
    }
    return res.end();
  }

  // status body
  if (null == body) {                       // 如果 body 值为空，则将其设为 context 对象 message 属性 或者 code（ctx.status）
    if (ctx.req.httpVersionMajor >= 2) {
      body = String(code);
    } else {
      body = ctx.message || String(code);
    }                           
    if (!res.headersSent) {                 // 修改头部的 type 和 length 属性
      ctx.type = 'text';
      ctx.length = Buffer.byteLength(body);
    }
    return res.end(body);
  }

  // responses
  if (Buffer.isBuffer(body)) return res.end(body);    // 对类型为 buffer 的 body 进行处理
  if ('string' == typeof body) return res.end(body);  // 对类型为字符串的 body进行处理
  if (body instanceof Stream) return body.pipe(res);  // 对流形式的 body 进行处理

  // body: json
  body = JSON.stringify(body);                        // 对类型为 Json 的 body进行处理
  if (!res.headersSent) {
    ctx.length = Buffer.byteLength(body);
  }
  res.end(body);
}
```
在 `respond` 函数中，主要运用 `node http` 模块中的 `res.end` 方法与 `koa context` 对象上挂载的属性进行最终响应对象的处理