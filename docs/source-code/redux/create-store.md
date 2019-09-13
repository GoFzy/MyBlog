# createStore

## nextListeners 缓存列表
```js
export default function createStore(reducer, preloadedState, enhancer) {
  /**
 * @param  {函数}  reducer 纯函数，用来更新state
 * @param  {对象}  preloadedState 主要用于前后端同构时的数据同步
 * @param  {函数}  enhancer Redux 仅提供 applyMiddleware 这个 Store Enhancer 中间件处理
 * @return {Store}
 */

  let currentReducer = reducer
  let currentState = preloadedState    // 这就是整个应用的 state
  let currentListeners = []            // 用于存储订阅的回调函数，dispatch 后逐个执行
  let nextListeners = currentListeners //【悬念1：为什么需要两个 缓存列表？】
  let isDispatching = false            // 是否正在更新state
}
```
对于上述代码中为什么需要两个缓存列表来存放订阅事件呢？  
* 试想，`dispatch` 后，回调函数正在乖乖地被逐个执行（`for` 循环进行时）假设回调函数队列原本是这样的 `[a, b, c, d]`  
* 现在 `for` 循环执行到第 3 步，亦即 `a`、`b` 已经被执行，准备执行 `c` 但在这瞬间，`a` 被取消订阅:)
* 那么此时回调，那么此时回调函数队列就变成了 `[b, c, d]` ，那么第 3 步就对应换成了 `d`，也就是说 `c` 被跳过了

为了避免上述情况，所以先使用 `nextListeners` 缓存列表执行完所有订阅事件，然后再用 `currentListener` 来更新缓存列表。继续往下看

## currentState && subscribe
```js
  // 获取当前State值，不多说
  function getState() {
    return currentState
  }

  // 注册订阅事件
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.')
    }

    var isSubscribed = true

    ensureCanMutateNextListeners() // 保证nextListeners 与 currentListeners一致
    nextListeners.push(listener)   // 新增订阅在 nextListeners 中操作

    // 返回一个取消订阅的函数
    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }

      isSubscribed = false

      ensureCanMutateNextListeners() // 保证nextListeners 与 currentListeners一致
      const index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1) // 取消订阅还是在 nextListeners 中操作
    }
  }
```
上述代码中，着重关注 `subscribe` 函数，它用来注册订阅回调事件。整体和**发布-订阅模式**保持一致，订阅时就是将事件放入缓存列表，取消时就是移除

## dispatch
```js
  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. ' +
        'Use custom middleware for async actions.'
      )
    }

    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
        'Have you misspelled a constant?'
      )
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }

    try {
      isDispatching = true
      // 关键点：currentState 与 action 会流通到所有的 reducer
      // 所有 reducer 的返回值整合后，替换掉当前的 currentState
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }

    // 令 currentListeners 等于 nextListeners，表示正在逐个执行回调函数
    const listeners = (currentListeners = nextListeners)

    // 逐个触发回调函数
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }

    return action // 为了方便链式调用，dispatch 执行完毕后，返回 action
  }
```
改变应用状态 `state` 的唯一方法就是 `dispatch` 调度一个 `action`，其内部实现就是往 `reducer` 中传入 `currentState` 和 `action`，然后用返回值更新 `currentState`，最后执行缓存列表中的订阅事件

## replaceReducer && observable
```js
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.')
    }

    currentReducer = nextReducer         // 直接替换reducer
    dispatch({ type: ActionTypes.INIT }) // 触发生成新的 state 树
  }

  // 不太懂--用到再补
  function observable() {}

  // 生成应用初始状态
  dispatch({ type: ActionTypes.INIT })
  
  // 返回store对象
  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
```