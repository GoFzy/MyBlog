# Koa2中间件机制
之前在[框架入口`application`](http://gofzy.com/source-code/koa2/application.html)源码学习中提到：
>在 `Application` 类的 `callback` 实例方法中：
```js
const fn = compose(this.middleware); // 把所有middleware进行了组合，使用了koa-compose
```
所以本节将会对 `compose` 即 `Koa2` 中间件机制进行分析

## koa-compose
`compose` 方法源码位置为 `node_modules/_koa-compose@4.1.0@koa-compose/index.js` ,该文件代码十分精简：
```js
function compose (middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  return function (context, next) {
    let index = -1              // index 是用来记录中间件函数运行到了哪一个函数
    return dispatch(0)          // 执行第一个中间件函数
    function dispatch (i) {
      // i 是洋葱模型的记录已经运行的函数中间件的下标, 如果一个中间件里面运行两次 next, 那么将有可能 i <= index
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve() //说明此时可能执行到最后一个中间件函数，直接返回`Resolved` 状态
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));//将dispatch.bind(null, i + 1)最为next传入，使得当前中间件能去执行下一个中间件
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```
首先，`compose` 方法会我们传入的参数 `this.middleware` 进行判断，确保其类型为数组  
然后，返回一个函数闭包, 保持对 `middleware` 的引用，这里就是 `compose` 核心部分：
为了方便理解，这里我们通过一个小案例进行说明:
```js
const Koa = require('Koa');
const app = new Koa();

app.use(async (ctx, next) => {
  console.log('我是第一个中间件 first');
  await next();
  console.log('我是第一个中间件 second');
})

app.use(async (ctx, next) => {
  console.log('我是第二个中间件 first');
  await next();
  console.log('我是第二个中间件 second');
})

app.use(async (ctx, next) => {
  console.log('我是第三个中间件 first');
  await next();
  console.log('我是第三个中间件 second');
})

app.listen(8000);
```
* 在 `dispatch(0)` 方法内拿到当前中间件函数 `fn` ,并返回一个 `Promise` 对象，这是将会执行第一个中间件函数
* 在执行第一个中间件时输入了两个参数 `ctx` 上下文对象和`next` 函数，通过 `dispatch` 函数的定义我们可以看到 `next` 函数就等价于 `dispatch.bind(null, i + 1)`
* 因此在第一个中间件函数运行到 `await` 停止标识时，会执行 `dispatch(1)` 也就是第二个中间件函数，依次类推
* 当执行到最后一个中间件函数时(本例中是 `dispatch(2)`), 将会执行 `dispatch(3)` ，而此时并不存在该中间件函数，因此会直接返回一个 `Resolved` 状态的 `Promise` 对象--`return Promise.resolve()`
* 那么在最后一个中间件中将会执行`await next()` 之后的代码，执行完毕后，倒数第二个中间件 `next()` 状态也会进入 `Resolved` ，进而继续执行后续代码，依次类推执行完所有中间件
需要注意的是 `dispatch` 中会对 `index` 和 `i` 的大小进行判断:
```js
// i 是洋葱模型的记录已经运行的函数中间件的下标, 如果一个中间件里面运行两次 next, 那么将有可能 i <= index
if (i <= index) return Promise.reject(new Error('next() called multiple times'))
```
这是为了防止一个中间件中有运行多次 `next`，比如:
```js
app.use(async (ctx, next) => {
  console.log('我是第一个中间件 first');
  await next();
  console.log('我是第一个中间件 second'); //洋葱模型回到这时 i = 0 index = 3
  await next();                         // 再次执行dispatch函数 i=0 <= index = 3
  console.log('我是第一个中间件 third');
})
``` 
对于上述实现过程，也可以使用该图形象的表示  
![koa-compose](https://raw.githubusercontent.com/GoFzy/pic-bed/master/koa-compose.png)
## 小结
`koa-compose` 整体代码十分精简，但是设计确实十分巧妙，主要是利用了 `async` 函数的 `await` 命令以及 `Promise` 对象，关于这部分内容可以看看我对 `ES6` 异步的总结:
* [`Promise对象`](http://gofzy.com/reading/es6/promise.html)
* [`Generator函数`](http://gofzy.com/reading/es6/generator.html)
* [`async函数`](http://gofzy.com/reading/es6/async.html)

参考资料:
* <http://zhangxiang958.github.io/2018/03/16/%E7%90%86%E8%A7%A3%20Koa%20%E7%9A%84%E4%B8%AD%E9%97%B4%E4%BB%B6%E6%9C%BA%E5%88%B6/>
* <https://www.bilibili.com/video/av54332167?from=search&seid=11460264548304745554>