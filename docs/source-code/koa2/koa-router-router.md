# koa2路由中间件--koa-router(2)
## Router
上一篇文章中我们已经介绍过 `layer.js` 文件。接下来，我们进入 `node_modules/_koa-router@7.4.0@koa-router/lib/router.js` 文件，在这里首先定义了 `Router` 构造函数:
```js
function Router(opts) {
  if (!(this instanceof Router)) {
    return new Router(opts);
  }

  this.opts = opts || {};
  this.methods = this.opts.methods || [
    'HEAD',
    'OPTIONS',
    'GET',
    'PUT',
    'PATCH',
    'POST',
    'DELETE'
  ];

  this.params = {};
  this.stack = [];
};
```
可以看到, 实际有用的属性不过 3 个, 分别是 `methods` 数组, `params` 对象, `stack` 数组:
* `methods` 数组存放的是允许使用的 `HTTP` 方法名, 会在 `Router.prototype.allowedMethods` 方法中使用, 我们在创建 `Router` 实例的时候可以进行配置, 允许使用哪些方法
* `params` 保存 `param` 前置处理函数，格式为`{ param: 中间件函数 }`
* `stack` 数组, 则是存储每一个路由, 也就是 `Layer` 的实例对象, 每一个路由都相当于一个 `Layer` 实例对象

`Layer` 中的 `stack` 和 `Router` 中的 `stack` 是**不一样的**:
* `Router` 的 `stack` 数组是存放每个路由对应的 `Layer` 实例对象的 
* `Layer` 实例对象里面的 `stack` 数组是存储每个路由的处理函数中间件的, 换言之, 一个路由可以添加多个处理函数 
两者关系如下图所示:
![koa-router-stack](https://raw.githubusercontent.com/GoFzy/pic-bed/master/koa-router-stack.png)

## http methods
源码中采用 `methods` 模块获取 `HTTP` 请求方法名，该模块内部实现主要依赖于 `http` 模块
```js
http.METHODS && http.METHODS.map(function lowerCaseMethod (method) {
  return method.toLowerCase()
})
```
在 `koa-router` 里面的体现就是我们可以通过在 `router` 实例对象上调用对应的方法函数来注册对应的 `HTTP` 方法的路由，同时将**传入的路由路径**与对应的**回调函数**绑定, 所以我们可以遍历一个方法数组来快速构建原型的 `method` 方法:
```js
methods.forEach(function (method) {
  Router.prototype[method] = function (name, path, middleware) {
    var middleware;

    if (typeof path === 'string' || path instanceof RegExp) {
      middleware = Array.prototype.slice.call(arguments, 2);
    } else {
      middleware = Array.prototype.slice.call(arguments, 1);
      path = name;
      name = null;
    }

    this.register(path, [method], middleware, {
      name: name
    });

    return this;
  };
});
```
上面函数中
* 先判断 `path` 是否是字符串或者正则表达式是因为注册路由的时候还可以为路由进行命名(命名空间方便管理)  
* 然后准确地获取回调的函数数组(注册路由可以接收多个回调), 这样如果匹配到某个路由, 回调函数数组中的函数就会依次执行. 留意到每个方法都会返回对象本身, 也就是说注册路由的时候是可以支持**链式**调用的  

以[`Koa2` 最小系统项目](https://github.com/GoFzy/Koa2-demo)为例，我们对其进行调试就能更好的理解上述过程
```js
// ./routes/home.js
console.log('最小系统注册')
router.get('', async (ctx) => {
  await ctx.render('template', {
    title: '首页',
    body: 'Koa2 最小系统的首页'
  })
})

// ./routes/admin.js
console.log('admin注册')
router.get('/', async (ctx) => {
  await ctx.render('template',{
    title: `koa-demo${ctx.url}`,
    body: `当前访问路径:${ctx.host + ctx.url}`,
  })
})

console.log('/users注册')
router.get('/users', userAgent(), async(ctx) => {
  await ctx.render('template',{
    title: `koa-demo${ctx.url}`,
    body: `当前访问路径:${ctx.host + ctx.url}`,
  })
})

// node_modules/_koa-router@7.4.0@koa-router/lib/router.js
methods.forEach(function (method) {
  Router.prototype[method] = function (name, path, middleware) {
    var middleware;
    console.log('在这里注册')
    if (typeof path === 'string' || path instanceof RegExp) {
      middleware = Array.prototype.slice.call(arguments, 2);
    } else {
      middleware = Array.prototype.slice.call(arguments, 1);
      path = name;
      name = null;
    }

    this.register(path, [method], middleware, {
      name: name
    });

    return this;
  };
});
```
执行结果如下:  
![router-method](https://raw.githubusercontent.com/GoFzy/pic-bed/master/router.method.jpg)  
可以看到每次注册路由时，都是调用了 `Router.prototype[某个method]`，不过真正注册路由的核心方法还是 `register` 函数，所以我们下面看看 `register` 函数的逻辑

## Router.prototype.register
`register` 是注册路由的核心函数, 举个例子, 如果我们需要注册一个路径为 `'/test'` 的接收 `GET` 方法的路由, 那么:
```js
router.get('/test', async (ctx, next) => {});
```
其实它相当于下面这段代码:
```js
router.register('/test', ['GET'], [async (ctx, next) => {}], { name: null });
```
我们可以看到,函数 
* 第一个参数是**路由**
* 第二个参数是**方法名放入到方法数组中** 
* 第三个函数是**路由的回调数组**, 其实每个路由注册的时候, 后面都可以添加很多个函数, 而这些函数都会被添加到一个数组里面, 如果被匹配到, 就会利用中间件机制来逐个执行这些函数
* 最后一个参数是**路由的命名空间**
```js
Router.prototype.register = function (path, methods, middleware, opts) {
  opts = opts || {};

  var router = this;
  var stack = this.stack;

  // 注册路由中间件时，允许path为数组
  if (Array.isArray(path)) {
    path.forEach(function (p) {
      router.register.call(router, p, methods, middleware, opts);
    });

    return this;
  }

  // 实例化Layer
  var route = new Layer(path, methods, middleware, {
    end: opts.end === false ? opts.end : true,
    name: opts.name,
    sensitive: opts.sensitive || this.opts.sensitive || false,
    strict: opts.strict || this.opts.strict || false,
    prefix: opts.prefix || this.opts.prefix || "",
    ignoreCaptures: opts.ignoreCaptures
  });

// 设置前缀
  if (this.opts.prefix) {
    route.setPrefix(this.opts.prefix);
  }

  // 设置param前置处理函数
  Object.keys(this.params).forEach(function (param) {
    route.param(param, this.params[param]);
  }, this);

  stack.push(route);

  return route;
};
```
`register` 方法主要负责实例化 `Layer` 对象、更新路由前缀和 `param` 处理函数，这些操作在上篇文章 [`Layer`](http://gofzy.com/source-code/koa2/koa-router-layer.html) 中有详细介绍

## Router.prototype.match
通过上面的模块, 我们已经注册好了路由, 但是, 如果请求过来了, 请求是怎么匹配然后进行到相对应的处理函数去的呢? 答案就是利用 `match` 函数.先看一下 `match` 函数的代码:
```js
Router.prototype.match = function (path, method) {
  // 取所有路由 Layer 实例
  var layers = this.stack;
  var layer;
  // 匹配结果
  var matched = {
    path: [],
    pathAndMethod: [],
    route: false
  };
  // 遍历路由 Router 的 stack 逐个判断
  for (var len = layers.length, i = 0; i < len; i++) {
    layer = layers[i];

    debug('test %s %s', layer.path, layer.regexp);
    // 利用 Layer.prototype.match 方法匹配路由
    if (layer.match(path)) {
      // 将对应的 Layer 实例加入到结果集的 path 数组中
      matched.path.push(layer);
      // 如果对应的 layer 实例中 methods 数组为空或者数组中有找到对应的方法
      if (layer.methods.length === 0 || ~layer.methods.indexOf(method)) {
        // 将 layer 放入到结果集的 pathAndMethod 中
        matched.pathAndMethod.push(layer);
        // 这里是用于判断是否有真正匹配到路由处理函数
        // 因为像 router.use(session()); 这样的中间件也是通过 Layer 来管理的, 它们的 methods 数组为空
        if (layer.methods.length) matched.route = true;
      }
    }
  }

  return matched;
};
```
通过上面返回的结果集, 我们知道一个请求来临的时候, 我们可以使用正则来匹配路由是否符合, 然后在 `path` 数组或者 `pathAndMethod` 数组中找到对应的 `Layer` 实例对象  

## Router.prototype.routes
[`Koa2` 最小系统项目](https://github.com/GoFzy/Koa2-demo)中，我在 `./routes` 路由文件中注册好了路由之后, 就可以使用 `router.routes` 来将路由模块添加到 `koa` 的中间件处理机制当中了。由于 `koa` 的中间件插件是以一个函数的形式存在的, 所以 `routes` 函数返回值就是一个函数:
```js
Router.prototype.routes = Router.prototype.middleware = function () {
  var router = this;

  var dispatch = function dispatch(ctx, next) {
    ...
  };

  dispatch.router = this;

  return dispatch;
};
```
我们可以看到返回的 `dispatch` 函数在 `routes` 内部形成了一个闭包, 并且按照 `koa` 的中间件形式编写函数.对于 `dispatch` 函数内部逻辑就如下:
```js
var dispatch = function dispatch(ctx, next) {
    debug('%s %s', ctx.method, ctx.path);
    
    var path = router.opts.routerPath || ctx.routerPath || ctx.path;
    // 根据 path 值匹配到路由 Layer 实例对象
    var matched = router.match(path, ctx.method);
    var layerChain, layer, i;
    
    if (ctx.matched) {
      ctx.matched.push.apply(ctx.matched, matched.path);
    } else {
      ctx.matched = matched.path;
    }
    
    ctx.router = router;
    // 如果没有匹配到对应的路由模块,会认为时全局路由中间件， 那么此处就直接跳过
    if (!matched.route) return next();
    // 取路径与方法都匹配了的 Layer 实例对象
    var matchedLayers = matched.pathAndMethod
    var mostSpecificLayer = matchedLayers[matchedLayers.length - 1]
    ctx._matchedRoute = mostSpecificLayer.path;
    if (mostSpecificLayer.name) {
      ctx._matchedRouteName = mostSpecificLayer.name;
    }
    // 构建路径对应路由的处理中间件函数数组
    // 这里的目的是在每个匹配的路由对应的中间件处理函数数组前添加一个用于处理
    // 对应路由的 captures, params, 以及路由命名的函数
    layerChain = matchedLayers.reduce(function(memo, layer) {
      memo.push(function(ctx, next) {
        // captures 是存储路由中参数的值的数组
        ctx.captures = layer.captures(path, ctx.captures);
        // params 是一个对象, 键为参数名, 根据参数名可以获取路由中的参数值, 值从 captures 中拿
        ctx.params = layer.params(path, ctx.captures, ctx.params);
        ctx.routerName = layer.name;
        return next();
      });
      return memo.concat(layer.stack);
    }, []);
    // 使用 compose 模块将对应路由的处理中间件数组中的函数逐个执行
    // 当路由的处理函数中间件函数全部执行完, 再调用上一层级的 next 函数进入下一个中间件
    return compose(layerChain)(ctx, next);
};
```

## Router.prototype.use
熟悉 `Koa` 的同学都知道 `use` 是用来注册中间件的方法，相比较 `Koa` 中的全局中间件，`koa-router` 的中间件则是路由级别的
```js
Router.prototype.use = function () {
  var router = this;
  // 中间件函数数组
  var middleware = Array.prototype.slice.call(arguments);
  var path;

  // 支持同时为多个路由绑定中间件函数: router.use(['/use', '/admin'], auth());
  if (Array.isArray(middleware[0]) && typeof middleware[0][0] === 'string') {
    middleware[0].forEach(function (p) {
      // 递归调用
      router.use.apply(router, [p].concat(middleware.slice(1)));
    });

    return this;
  }
  /// 如果第一个参数有传值为字符串, 说明有传路径
  var hasPath = typeof middleware[0] === 'string';
  if (hasPath) {
    path = middleware.shift();
  }

  middleware.forEach(function (m) {
    // 如果有 router 属性, 说明这个中间件函数是由 Router.prototype.routes 暴露出来的 属于嵌套路由
    if (m.router) {
      // 如果是嵌套路由, 相当于将需要嵌套路由重新注册到现在的 Router 对象上
      m.router.stack.forEach(function (nestedLayer) {
        // 如果有 path, 那么为需要嵌套的路由加上路径前缀
        if (path) nestedLayer.setPrefix(path);
        // 如果本身的 router 有前缀配置, 也添加上
        if (router.opts.prefix) nestedLayer.setPrefix(router.opts.prefix);
        // 将需要嵌套的路由模块的 stack 中存储的 Layer 加入到本 router 对象上
        router.stack.push(nestedLayer);
      }); 

      // 不要忘记将父路由上的param前置处理操作 更新到新路由上。
      if (router.params) {
        Object.keys(router.params).forEach(function (key) {
          m.router.param(key, router.params[key]);
        });
      }
    } else {
      // 没有 router 属性则是常规中间件函数, 如果有给定的 path 那么就生成一个 Layer 模块进行管理
      router.register(path || '(.*)', [], m, { end: false, ignoreCaptures: !hasPath });
    }
  });

  return this;
};
```
讲到这里，大家可能被上面的 `match`、`use` 以及 `routes` 方法绕晕了，接下来我们以[`Koa2` 最小系统项目](https://github.com/GoFzy/Koa2-demo)为例，对上述流程进行梳理:
```js
// app.js
import prefix from './routes/prefix';
router.use('/prefix', prefix.routes());
```
系统中在 `./app.js` 文件中配置 `/prefix` 层级路由，接下来我们在 `node_modules/_koa-router@7.4.0@koa-router/lib/router.js` 中`routes`、`use` 以及 `match` 这三个原型方法中打下断点，然后`f5` 启动 `debug`  
**第一个断点**： 我们可以看到服务启动后，首先进入了 `Router.prototype.routes` 方法当中，在这里返回了 `dispatch` 函数:
![router.prototype.routes](https://raw.githubusercontent.com/GoFzy/pic-bed/master/router.prototype.routes.jpg)  
此时，原 `app.js` 文件中就等价于
```js
router.use('/prefix', dispatch);
```
**第二个断点**： 继续向下就来到了第二个断点，也就是 `Router.prototype.use` 方法当中，
![router.prototype.use](https://raw.githubusercontent.com/GoFzy/pic-bed/master/router.prototype.use.jpg)  
需要注意的是，此时的 `this` 指向的是 `app.js` 中的 `router` 实例对象。这个方法上面讲解过，就是将中间件函数与对应的路由绑定起来  

**第三个断点**： 在第二个断点结束后，其实不会马上进入第三个断点，因为 `match` 方法是匹配请求的，因此我们需要发起一个请求-- `localhost:3000/prefix/koa/hello`
![router.prototype.match](https://raw.githubusercontent.com/GoFzy/pic-bed/master/router.prototype.match.jpg)  
之前提到过，在调用 `Router.prototype.routes` 方法之后 `app.js` 等价于
```js
router.use('/prefix', dispatch);
```
因此请求进来时
* 先执行这个 `dispatch` 中间件函数
* 然后通过 `dispatch` 进入到 `Router.prototype.match` 方法中找到对应的路由 `Layer` 实例对象
* 找到后回到 `dispatch` 函数，通过 `koa-compose` 按洋葱模型机制执行所有中间件函数

## 小结
本篇文章主要可以分为两部分: **路由的注册** 和 **路由的匹配**
* 路由的注册比较简单，主要使用了两个方法 `Router.prototype[method]` 和 `Router.prototype.register`
* 路由的匹配相对比较复杂，这里以一张流程图进行总结
![koa-router-match](https://raw.githubusercontent.com/GoFzy/pic-bed/master/koa-router-match.png)

参考文章
* <https://juejin.im/post/5c24c3b9e51d45538150f3ab>
* <https://github.com/zhangxiang958/zhangxiang958.github.io/issues/38>