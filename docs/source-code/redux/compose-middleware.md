# Redux 中间件机制

## compose.js
首先我们来看下 `compose.js` 这个文件模块
```js
export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
```
其实内部代码十分简单，就是一个 `reduce` 的使用，实现这样的效果，`compose(f, g, h)(...args)` => `f(g(h(...args)))`，即从右往左执行

## applyMiddleware
接下来我们进入 `applyMiddleware.js` 文件模块
```js
import compose from './compose'

// 传入一组中间件
export default function applyMiddleware(...middlewares) {
  // 传入 createStore
  return createStore => (...args) => {
    const store = createStore(...args)
    let dispatch = () => {
      throw new Error(
        'Dispatching while constructing your middleware is not allowed. ' +
          'Other middleware would not be applied to this dispatch.'
      )
    }

    // 提供给中间件的 API（其实都是 store 的 API）
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }

    // 拿到中间件数组
    const chain = middlewares.map(middleware => middleware(middlewareAPI))
    
    // 调度所有中中间件函数，记住是从右向左执行
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}
```
本质上 `applyMiddleware` 就是一个 `Store` 增强器  

## 洋葱模型流程梳理
而关于中间件的使用可以参考[这篇文章](https://www.redux.org.cn/docs/advanced/Middleware.html)，这里我以一个 `demo` 进行对上述过程进行梳理：
```js
const { applyMiddleware, createStore } = require('redux')
const reducer = (initialState = 0, action ) => {
  if(action.type === 'INC') {
    return initialState + 1;
  } 
  else if( action.type === 'DEC') {
    return initialState - 1;
  } 
  else {
    return initialState;
  }
}

const first = store => next => action => {
  console.log('first middleware', action)
  next(action)
  console.log('first middleware again', store.getState())

}

const second = store => next => action => {
  console.log('second middleware', action)
  next(action)
  console.log('second middleware again', store.getState())
}

const third = store => next => action => {
  console.log('third middleware', action)
  next(action)
  console.log('third middleware again', store.getState())
}

// 返回一个 store 增强函数
const middleware = applyMiddleware(first, second, third);

// 创建store 并通过 middleware 对store进行增强
const store = createStore(reducer, 100, middleware);

store.subscribe(() => {
  console.log('store change', store.getState());
})

store.dispatch({type: 'INC'});
```
我们首先在 `const middleware = ...` 这里打下断点，然后进入 `applyMiddleware` 函数，可以看到返回了一个 `store` 增强函数，并在 `createStore` 函数中作为 `enhancer` 执行
![store-enhance](https://raw.githubusercontent.com/GoFzy/pic-bed/master/createstore-enhance.jpg)
这里我们还是将关注点放在 `applyMiddleware` 中，这里会使用 `var chain = ...` 将传入的中间件函数作为数组存储。而在存放的过程中，源码是将 `middlewareAPI` 作为 `store` 传入，故 `chain` 数组中存放的都是 `next => action => {...}` 格式的中间件函数  
![chain-content](https://raw.githubusercontent.com/GoFzy/pic-bed/master/chain-content.jpg)
最后也是最关键的部分，即对 `dispatch` 的包装：
```js
_dispatch = compose.apply(void 0, chain)(store.dispatch);
```
这里我的个人理解是
* 首先执行最右侧的 `third` 中间件函数，它参数 `next` 为原始 `store.dispatch`；然后它返回 `(action) => {...}`，而这个返回的函数将会作为 `second` 的 `next` 输入参数进行输入
* 安装上述过程依次类推，知道最左侧的 `first` 中间件函数，这个过程相当于从右往左对 `store.dispatch` 层层包裹
* 因此在 `disptach.action` 时会经过 `first->second->third->dispatch(action)->third->second->first` 这样一个**洋葱模型**

## 参考文章
* [中间件函数的使用](https://www.redux.org.cn/docs/advanced/Middleware.html)
* [函数柯里化](https://juejin.im/post/5af13664f265da0ba266efcf)
* [redux源码学习](https://github.com/kenberkeley/redux-simple-tutorial/blob/master/redux-advanced-tutorial.md)