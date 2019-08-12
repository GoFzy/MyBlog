# ReactDOM.render(2)
在上一篇文章中，我们介绍了当 `ReactDom.render` 执行时，内部会首先判断是否已经存在 `root`，没有的话会去创建一个 `root`。在这篇文章中，我们将会了解到存在 `root` 以后会发生什么事情  
## legacyRenderSubtreeIntoContainer
源码位置为 `node_modules/react-dom/cjs/react-dom.development.js`，首先我们定位到 `legacyRenderSubtreeIntoContainer` 方法:
```js
function legacyRenderSubtreeIntoContainer(parentComponent, children, container, forceHydrate, callback) {
  {
    topLevelUpdateWarnings(container);
  }

  // TODO: Without `any` type, Flow says "Property cannot be accessed on any
  // member of intersection type." Whyyyyyy.
  var root = container._reactRootContainer;
  if (!root) {
    //...
  } else {
    if (typeof callback === 'function') {
      var _originalCallback = callback;
      callback = function () {
        var instance = getPublicRootInstance(root._internalRoot);
        _originalCallback.call(instance);
      };
    }
    // Update
    if (parentComponent != null) {
      root.legacy_renderSubtreeIntoContainer(parentComponent, children, callback);
    } else {
      root.render(children, callback);
    }
  }
  return getPublicRootInstance(root._internalRoot);
}
```
这里首先判断是否存在 `parentComponent`。这一步我们可以假定不会存在 `parentComponent`  
不存在 `parentComponent` 的话就会执行 `root.render(children, callback)`，根据上一篇文章中关于 [`root` 创建的介绍](http://gofzy.com/source-code/react/reactdom.render.html)，我们知道这里的 `render` 指的是 `ReactRoot.prototype.render`

## ReactRoot.prototype.render
```js
ReactRoot.prototype.render = function (children, callback) {
  var root = this._internalRoot;
  var work = new ReactWork();
  callback = callback === undefined ? null : callback;
  {
    warnOnInvalidCallback(callback, 'render');
  }
  if (callback !== null) {
    work.then(callback);
  }
  updateContainer(children, root, null, work._onCommit);
  return work;
};
```
在 `render` 函数内部
* 首先取出 `root`，这里的 `root` 指的是 FiberRoot，如果你想了解 `FiberRoot` 相关的内容可以阅读[上一篇文章](http://gofzy.com/source-code/react/reactdom.render.html)  
* 然后创建了 `ReactWork` 的实例，这块内容我们没有必要深究，功能就是为了在组件渲染或更新后把所有传入 `ReactDom.render` 中的回调函数全部执行一遍  
接下来我们来看 `updateContainer` 内部是怎么样的 
```js
function updateContainer(element, container, parentComponent, callback) {
  var current$$1 = container.current;
  var currentTime = requestCurrentTime();
  var expirationTime = computeExpirationForFiber(currentTime, current$$1);
  return updateContainerAtExpirationTime(element, container, parentComponent, expirationTime, callback);
}
```
我们先从 `FiberRoot` 的 `current` 属性中取出它的 `fiber` 对象，然后计算了两个时间。这两个时间在 `React` 中相当重要，因此我们需要单独用一小节去学习它们  

## 时间
**1. `currentTime`**  
在 `requestCurrentTime` 函数内部计算时间的最核心函数是 `recomputeCurrentRendererTime`  
```js
function recomputeCurrentRendererTime() {
  var currentTimeMs = scheduler.unstable_now() - originalStartTimeMs;
  currentRendererTime = msToExpirationTime(currentTimeMs);
}
```
`scheduler.unstable_now()` 表示当前时间，`originalStartTimeMs` 是 `React` 应用初始化时间。那么这两个值相减以后，得到的结果也就是现在离 `React` 应用初始化时经过了多少时间  
```js
const UNIT_SIZE = 10;
const MAGIC_NUMBER_OFFSET = 1073741823 - 1; 
function msToExpirationTime(ms) {
  // Always add an offset so that we don't clash with the magic number for NoWork.
  return MAGIC_NUMBER_OFFSET - (ms / UNIT_SIZE | 0);
}
```
这里的 `| 0` 作用是取整数，也就是说 `11 / 10 | 0 = 1`。接下来我们来假定一些变量值，代入公式来算的话会更方便大家理解。假如 `originalStartTimeMs` 为 2500，当前时间为 5000，那么算出来的差值就是 2500，也就是说当前距离 `React` 应用初始化已经过去了 2500 毫秒，最后通过公式得出的结果为：
```js
currentTime = 1073741822 - ((2500 / 10) | 0) = 1073741572
```

**2. `expirationTime`**
接下来是计算 `expirationTime`，**这个时间和优先级有关，值越大，优先级越高**。并且同步是优先级最高的  
由于源码中计算比较多，这里进行了省略，有兴趣的同学可以去阅读  
总之 `expirationTime` 指的就是一个任务的过期时间，`React` 根据任务的**优先级**和**当前时间**来计算出一个**任务的执行截止时间**。只要这个值比当前时间大就可以一直让 `React` 延后这个任务的执行，以便让更高优先级的任务执行，但是一旦过了任务的截止时间，就必须让这个任务马上执行

## scheduleRootUpdate
当我们计算出时间以后就会调用 `updateContainerAtExpirationTime`，这个函数其实没有什么好解析的，我们直接进入 `scheduleRootUpdate` 函数就好  
```js
function scheduleRootUpdate(current$$1, element, expirationTime, callback) {
  {
    if (phase === 'render' && current !== null && !didWarnAboutNestedUpdates) {
      didWarnAboutNestedUpdates = true;
      warningWithoutStack$1(false, 'Render methods should be a pure function of props and state; ' + 'triggering nested component updates from render is not allowed. ' + 'If necessary, trigger nested updates in componentDidUpdate.\n\n' + 'Check the render method of %s.', getComponentName(current.type) || 'Unknown');
    }
  }
  //创建 update 对象
  var update = createUpdate(expirationTime);
  update.payload = { element: element };

  callback = callback === undefined ? null : callback;
  if (callback !== null) {
    !(typeof callback === 'function') ? warningWithoutStack$1(false, 'render(...): Expected the last optional `callback` argument to be a ' + 'function. Instead received: %s.', callback) : void 0;
    update.callback = callback;
  }

  flushPassiveEffects();
  enqueueUpdate(current$$1, update);
  scheduleWork(current$$1, expirationTime);

  return expirationTime;
}

function createUpdate(expirationTime) {
  return {
    expirationTime: expirationTime,

    tag: UpdateState,
    payload: null,
    callback: null,

    next: null,
    nextEffect: null
  };
}
```
首先我们会创建一个 `update`，这个对象和 `setState` 息息相关，其内部属性如下
```js
{
  expirationTime: expirationTime,
  tag: UpdateState,
  // setState 的第一二个参数
  payload: null,
  callback: null,
  // 用于在队列中找到下一个节点
  next: null,
  nextEffect: null,
}
```
对于 `update` 对象内部的属性来说，我们需要重点关注的是 **`next`** 属性。因为 `update` 其实就是一个队列中的节点，这个属性可以用于帮助我们寻找下一个 `update`。对于批量更新来说，我们可能会创建多个 `update`，因此我们需要将这些 `update` 串联并存储起来，在必要的时候拿出来用于更新 `state`  

回到 `scheduleRootUpdate` 函数,接下来的操作:
* `render` 的过程中其实也是一次更新的操作，但是我们并没有 `setState`，因此就把 `payload` 赋值为 `{element}` 了  
* 紧接着源码将 `callback` 赋值给 `update` 的属性，这里的 `callback` 还是 `ReactDom.render` 的第三个参数  
* 然后我们将刚才创建出来的 `update` 对象插入队列中，`enqueueUpdate `函数内部分支较多且代码简单，这里就不再贴出代码了，有兴趣的可以自行阅读。函数核心作用就是创建或者获取一个队列，然后把 `update` 对象入队  
* 最后调用 `scheduleWork` 函数，这里开始就是调度相关的内容，这部分内容我们将在之后的文章中来详细解析

## 小结
本篇文章的重点在于两个时间的计算，因为这个时间和后面的调度息息相关，最后通过一张流程图总结一下 `render` 流程两篇文章的内容  
![reactdom-render](https://raw.githubusercontent.com/GoFzy/pic-bed/master/reactdom.render.png)

**参考文章**
* <https://github.com/KieSun/Dream/issues/20>