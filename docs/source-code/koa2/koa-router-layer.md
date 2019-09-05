# koa2路由中间件--koa-router(1)
关于 `koa-router` 的基本使用可以看我 `GitHub` 上的 [`Koa2` 最小系统项目](https://github.com/GoFzy/Koa2-demo)  
`koa-router` 的源码只有两个文件：`router.js` 和 `layer.js`，分别对应 `Router` 对象和 `Layer` 对象
* `Layer` 对象是对单个路由的管理，其中包含的信息有路由路径(`path`)、路由请求方法(`method`)和路由执行函数(`middleware`)，并且提供路由的验证以及 `params` 参数解析的方法
* `Router` 对象则是对所有注册路由的统一处理，并且它的 `API` 是面向开发者的

在分析源码之前我们先看一下代码的结构图:
![koa-router](https://raw.githubusercontent.com/GoFzy/pic-bed/master/koa-router.png)

## Layer
`Layer` 对象主要是对单个路由的管理，是整个 `koa-router` 中最小的处理单元，后续模块的处理都离不开 `Layer` 中的方法，这正是首先介绍 `Layer` 的重要原因  
首先我们进入 `node_modules/_koa-router@7.4.0@koa-router/lib/layer.js` 文件，在这里创建了一个实例对象用于管理每个路由:
```js
function Layer(path, methods, middleware, opts) {
  this.opts = opts || {};
  // 支持路由别名
  this.name = this.opts.name || null;
  // 路由对象的方法
  this.methods = [];
  // 路由参数名数组
  this.paramNames = [];
  // 将路由执行函数保存在stack中，支持输入多个处理函数
  this.stack = Array.isArray(middleware) ? middleware : [middleware];
  methods.forEach(function(method) {
    var l = this.methods.push(method.toUpperCase());
    // HEAD请求头部信息与GET一致，这里就一起处理了
    if (this.methods[l-1] === 'GET') {
      this.methods.unshift('HEAD');
    }
  }, this);

  // 确保中间件类型正确
  this.stack.forEach(function(fn) {
    var type = (typeof fn);
    if (type !== 'function') {
      throw new Error(
        methods.toString() + " `" + (this.opts.name || path) +"`: `middleware` "
        + "must be a function, not `" + type + "`"
      );
    }
  }, this);

  this.path = path;
  // 1、根据路由路径生成路由正则表达式
  // 2、将params参数信息保存在paramNames数组中
  this.regexp = pathToRegExp(path, this.paramNames, this.opts);

  debug('defined route %s %s', this.methods, this.opts.prefix + this.path);
};
```
可以看到 `Layer` 构造函数主要用来初始化
* 路由路径并转化为正则表达式 ------------------ `this.path & this.regexp`
* 路由请求方法数组 ------------------------------- `this.methods`
* 路由处理函数数组 ------------------------------- `this.stack`
* `params` 参数信息数组 -------------------------- `this.paramNames`

其中主要采用**pathToRegexp**方法根据路径字符串生成正则表达式，通过该正则表达式，可以实现路由的匹配

## params 参数的捕获
```js
// 验证路由
Layer.prototype.match = function (path) {
  return this.regexp.test(path);
}

// 捕获params参数
Layer.prototype.captures = function (path) {
  if (this.opts.ignoreCaptures) return [];
  return path.match(this.regexp).slice(1);
}
```
根据 `paramNames` 中的参数信息以及 `captrues` 方法，可以获取到当前路由 `params` 参数的键值对：
```js
Layer.prototype.params = function (path, captures, existingParams) {
  var params = existingParams || {};
  for (var len = captures.length, i=0; i<len; i++) {
    if (this.paramNames[i]) {
      var c = captures[i];
      params[this.paramNames[i].name] = c ? safeDecodeURIComponent(c) : c;
    }
  }
  return params;
};
```
关于 `params` 参数，它最终会通过 `router` 实例对象挂载至 `ctx` 对象的上，并可以通过 `ctx.params` 访问，以[`Koa2` 最小系统项目](https://github.com/GoFzy/Koa2-demo)为例，在 `./routes/dynamic.js` 中通过 `params` 参数配置了动态路由：
```js
// ./routes/dynamic.js
import Router from 'koa-router';
const router = new Router();

router.get('/:id/:aid', ctx => {
  const res = JSON.stringify(ctx.params, null, 2);
  ctx.body = `当前访问参数${res}`;
  console.log('params', ctx.params);
})

export default router;
```  
启动服务后，我们访问 `localhost:3000/dynamic/hello/world` 就可以打印出 `params` 参数
![koa-router-layer-params](https://raw.githubusercontent.com/GoFzy/pic-bed/master/koa-router-layer-params.jpg)  
关于 `Layer` 的原型方法 `params` 是如何挂载到 `router` 实例对象上，可以在 `koa-router/router.js`的 `Router.prototype.routes`方法中详细阅读

## 单个param处理函数
这是最终挂载在 `router` 实例上的方法，如何使用在官网上 `koa-router api` 中 `param` 方法有[介绍](https://www.npmjs.com/package/koa-router#module_koa-router--Router+param)，但是讲得比较抽象，这里通过源码分析，希望能让大家更好的理解  
**使用**:个人理解，所谓 `param` 方法就是为某个动态参数添加中间件函数，并按位置顺序执行，同样还是以[`Koa2` 最小系统项目](https://github.com/GoFzy/Koa2-demo)为例，我为之前在 `./routes/dynamic.js` 中配置的两个动态路由参数添加了相应的中间件函数:
```js
// ./routes/dynamic.js
import Router from 'koa-router';
const router = new Router();

router
  .param('id', (id, ctx, next)=>{
    if(id.length > 4) console.log('id大于4');
    return next();
  })
  .param('aid', (aid, ctx, next) => {
    if(aid.length > 4) console.log('aid大于4');    
    return next();
  })
  .get('/:id/:aid', ctx => {
    const res = JSON.stringify(ctx.params, null, 2);
    ctx.body = `当前访问参数${res}`;
    console.log('params', ctx.params);
  })

export default router;
```
现在大家分别访问 `localhost:3000/dynamic/hi/world` 和 `localhost:3000/dynamic/hello/wor`，就可以在 `vscode` 控制台中看到不同的输出，这就是 `param api` 的基本使用 

**源码**：
```js
Layer.prototype.param = function (param, fn) {
  var stack = this.stack;
  var params = this.paramNames;

  // 根据传入的param 和 fn 创建中间件函数
  var middleware = function (ctx, next) {
    return fn.call(this, ctx.params[param], ctx, next);
  };
  
  // 中间件与对应的参数进行绑定
  middleware.param = param;

  // 获取所有动态路由参数
  var names = params.map(function (p) {
    return p.name;
  });

  // 找到param在动态路由参数中的位置
  var x = names.indexOf(param);
  if (x > -1) {
    stack.some(function (fn, i) {
      if (!fn.param || names.indexOf(fn.param) > x) {
        // 将单个param前置处理函数插入正确的位置
        stack.splice(i, 0, middleware);
        return true; // 跳出循环
      }
    });
  }

  return this;
};
```
上述代码中通过some方法寻找单个 `param` 处理函数的原因在于以下两点：
* 保持 `param` 处理函数位于其他路由处理函数的前面；
* 路由中存在多个 `param` 参数，需要保持 `param` 处理函数的前后顺序。


## setPrefix路由前缀
这同样也是最终挂载在 `router` 实例上的方法，官网上 `koa-router api` 中 `predix` [介绍](https://www.npmjs.com/package/koa-router#module_koa-router--Router+prefix)，同样我还是认为讲得不够详细，所以还是拿出来分析一下  

**使用**：个人理解，该 `api` 作用就是将路由**相同的前缀**提取出来，同样还是以[`Koa2` 最小系统项目](https://github.com/GoFzy/Koa2-demo)为例，我在 `./routes/prefix.js` 中设置 `/koa` 为路由前缀部分:
```js
import Router from 'koa-router';

const router = new Router();
router.prefix('/koa');

/**
 * 上述方法等价于
 * const router = new Router({
 *     prefix: '/koa'
 * })
 */

// 等同于"localhost/prefix/koa/:id"
router.get('/:id', (ctx) => {
  ctx.body = `koa router prefix ${ctx.params.id}` ;
});

// 等同于"localhost/prefix/koa"
router.get('/', (ctx) => {
  ctx.body = 'koa router prefix';
});

export default router;
```
**源码**：
```js
Layer.prototype.setPrefix = function (prefix) {
  if (this.path) {
    this.path = prefix + this.path; // 拼接新的路由路径
    this.paramNames = [];
    // 根据新的路由路径字符串生成正则表达式
    this.regexp = pathToRegExp(this.path, this.paramNames, this.opts);
  }

  return this;
};
```
由此可见 `Layer` 中的 `setPrefix` 方法用于设置路由路径的前缀，这在嵌套路由的实现中尤其重要。

## 小结
最后小结一下，整体而言在 `layer.js` 文件中代码还算易懂，以下几个是比较重要的属性与方法
![koa-router-layer](https://raw.githubusercontent.com/GoFzy/pic-bed/master/koa-router-layer.jpg)

参考文章：
* <https://github.com/zhangxiang958/zhangxiang958.github.io/issues/38>
* <https://juejin.im/post/5c24c3b9e51d45538150f3ab#heading-8>
* <https://github.com/dwqs/blog/issues/8>