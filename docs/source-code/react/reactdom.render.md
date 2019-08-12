# ReactDOM.render(1)
想必大家在写 `React` 项目的时候都写过类似的代码:
```js
ReactDOM.render(<APP />, document.getElementById('root')
```
这句代码告诉了 `React` 我们想在容器中渲染出一个组件，这通常也是一个 `React` 应用的入口代码，接下来我们就来梳理整个 `render` 的流程  
`React` 版本为16.8.6，源码位置为 `node_modules/react-dom/cjs/react-dom.development.js`，首先我们定位到 `ReactDOM` 对象当中:
```js
var ReactDOM = {
  //...
  render: function (element, container, callback) {
    !isValidContainer(container) ? invariant(false, 'Target container is not a DOM element.') : void 0;
    {
      !!container._reactHasBeenPassedToCreateRootDEV ? warningWithoutStack$1(false, 'You are calling ReactDOM.render() on a container that was previously ' + 'passed to ReactDOM.%s(). This is not supported. ' + 'Did you mean to call root.render(element)?', enableStableConcurrentModeAPIs ? 'createRoot' : 'unstable_createRoot') : void 0;
    }
    return legacyRenderSubtreeIntoContainer(null, element, container, false, callback);
  },
  //..
}
```
这部分代码中主要是对 `DOM`节点容器进行验证，需要注意的是，在调用 `legacyRenderSubtreeIntoContainer` 函数时写死了第四个参数 `forceHydrate` 为 `false` ，该参数为 `true` 时表明为服务端渲染，这里不做详细讨论，接下来我们将目光转移到 `legacyRenderSubtreeIntoContainer` 函数当中：
## legacyRenderSubtreeIntoContainer
```js
function legacyRenderSubtreeIntoContainer(parentComponent, children, container, forceHydrate, callback) {
  {
    topLevelUpdateWarnings(container);
  }
  var root = container._reactRootContainer;
  if (!root) {
    // Initial mount
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(container, forceHydrate);
    if (typeof callback === 'function') {
      var originalCallback = callback;
      callback = function () {
        var instance = getPublicRootInstance(root._internalRoot);
        originalCallback.call(instance);
      };
    }
    // Initial mount should not be batched.
    unbatchedUpdates(function () {
      if (parentComponent != null) {
        root.legacy_renderSubtreeIntoContainer(parentComponent, children, callback);
      } else {
        root.render(children, callback);
      }
    });
  } else {
    //...
  }
  return getPublicRootInstance(root._internalRoot);
}
```
这部分代码分为两块来讲。第一部分是没有 `root` 之前我们首先需要创建一个 `root`（对应这篇文章），第二部分是有 `root` 之后的渲染流程（对应接下来的文章）  
一开始进来函数的时候肯定是没有 `root` 的，因此我们需要去创建一个 `root`，大家可以发现这个 `root` 对象同样也被挂载在了 `container._reactRootContainer` 上，也就是我们的 `DOM` 容器上。  
我们现在渲染一个简单的 `App` 组件：
```js
function App() {
  return (
    <div>Hello World</div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'));
```
在控制台键入如下代码就可以看到这个 `root` 对象了
```js
document.querySelector('#root')._reactRootContainer
```
![_reactRootContainer](https://raw.githubusercontent.com/GoFzy/pic-bed/master/reactRootContainer.jpg)
通过控制台打印出来的信息，大家可以看到 `root` 是 `ReactRoot` 构造函数构造出来的，并且内部有一个 `_internalRoot` 对象，这个对象是本文接下来要重点介绍的 `fiber` 对象，接下来我们就来一窥究竟吧
## legacyCreateRootFromDOMContainer
```js
function legacyCreateRootFromDOMContainer(container, forceHydrate) {
  var shouldHydrate = forceHydrate || shouldHydrateDueToLegacyHeuristic(container);
  // First clear any existing content.
  if (!shouldHydrate) {
    var warned = false;
    var rootSibling = void 0;
    //将容器内部原有的节点清除
    while (rootSibling = container.lastChild) {
      {
        if (!warned && rootSibling.nodeType === ELEMENT_NODE && rootSibling.hasAttribute(ROOT_ATTRIBUTE_NAME)) {
          warned = true;
          warningWithoutStack$1(false, 'render(): Target node has markup rendered by React, but there ' + 'are unrelated nodes as well. This is most commonly caused by ' + 'white-space inserted around server-rendered markup.');
        }
      }
      container.removeChild(rootSibling);
    }
  }
  {
    if (shouldHydrate && !forceHydrate && !warnedAboutHydrateAPI) {
      warnedAboutHydrateAPI = true;
      lowPriorityWarning$1(false, 'render(): Calling ReactDOM.render() to hydrate server-rendered markup ' + 'will stop working in React v17. Replace the ReactDOM.render() call ' + 'with ReactDOM.hydrate() if you want React to attach to the server HTML.');
    }
  }
  // Legacy roots are not async by default.
  var isConcurrent = false;
  return new ReactRoot(container, isConcurrent, shouldHydrate);
}
```
* 首先还是和上文中提到的 `forceHydrate` 属性相关的内容，不需要管这部分，反正 `shouldHydrate` 肯定为 `false`。  
* 接下来是将容器内部原有的节点清除
* 最后就是创建了一个 `ReactRoot` 对象并返回，现在我们就进入 `ReactRoot` 构造函数当中

## ReactRoot
```js
function ReactRoot(container, isConcurrent, hydrate) {
  var root = createContainer(container, isConcurrent, hydrate);
  this._internalRoot = root;
}
function createContainer(containerInfo, isConcurrent, hydrate) {
  return createFiberRoot(containerInfo, isConcurrent, hydrate);
}
```
在 `ReactRoot` 构造函数内部就进行了一步操作，那就是创建了一个 `FiberRoot` 对象，并挂载到了 `_internalRoot` 上  
需要注意的是 `FiberRoot` 对象其内部是一整棵树**fiber树**，和 `DOM` 树一样，其中每个 `DOM `节点一定对应着一个 `fiber` 对象  
接下来的内容里我们将学习到关于 `fiber` 相关的内容。这里提及一点，`fiber` 和 `Fiber` 是两个不一样的东西，前者代表着数据结构，后者代表着新的架构

## createContainer(createFiberRoot)
```js
function createContainer(containerInfo, isConcurrent, hydrate) {
  return createFiberRoot(containerInfo, isConcurrent, hydrate);
}
function createFiberRoot(containerInfo, isConcurrent, hydrate) {
  var uninitializedFiber = createHostRootFiber(isConcurrent);

  var root = void 0;
  if (enableSchedulerTracing) {
    root = {
      current: uninitializedFiber,
      containerInfo: containerInfo,
      //...
    };
  } else {
    root = {
      current: uninitializedFiber,
      containerInfo: containerInfo,
      //...
    };
  }

  uninitializedFiber.stateNode = root;

  return root;
}
```
在 `createFiberRoot` 函数中，分别建立了两个对象-- `uninitializedFiber` 以及 `root`，为了后续的分析，我们
* 将前者(`uninitializedFiber`)称为 `RootFiber`，表示**整个`fiber`树的根节点**
* 将后者(`root`)称为 `FiberRoot`，是 整个 **`fiber`树** 调度的操作对象
再结合一个实例来区分下两者：
```js
ReactDom.render(
  ()=> (
    <div>
      <div></div>
      <div></div>
    </div>
  ), 
  document.querySelector('#root')
)
```
![Fiber-root](https://raw.githubusercontent.com/GoFzy/pic-bed/master/Fiber-root.jpg)
这两个对象内部拥有着数十个属性，现在我们没有必要一一去了解它们各自有什么用处，在当下只需要了解少部分属性即可，其他的属性我们会在以后的文章中了解到它们的用处。  
对于 `FiberRoot` 对象来说，我们现在只需要了解两个属性，分别是
* **`containerInfo`**: 代表着容器信息，也就是我们的 `document.querySelector('#root')`
* **`current`**：指向 `RootFiber`
而对于 `RootFiber` 对象来说，我i们需要了解的属性就稍微多点:
```js
function createHostRootFiber(isConcurrent) {
  var mode = isConcurrent ? ConcurrentMode | StrictMode : NoContext;

  if (enableProfilerTimer && isDevToolsPresent) {
    mode |= ProfileMode;
  }

  return createFiber(HostRoot, null, null, mode);
}

var createFiber = function (tag, pendingProps, key, mode) {
  return new FiberNode(tag, pendingProps, key, mode);
}

function FiberNode(tag, pendingProps, key, mode) {
  // Fiber
  this.return = null;
  this.child = null;
  this.sibling = null;
  this.index = 0;
  //...
}
```
通过层层查找我们可以看到 `RootFiber` 就是一个 `FiberNode` 节点。我们首先来看看 `Fiber` 相关的属性：
* `return`: 该节点的父节点
* `child`: 该节点第一个子节点，只返回一个
* `sibling`: 该节点的下一个兄弟节点
实际上 `fiber` 树其实是一个单链表树结构，我们通过一个例子来了解一下 `fiber` 树的整体结构:
```js
const APP = () => (
		<div>
				<span></span>
				<span></span>
		</div>
)
ReactDom.render(<APP/>, document.querySelector('#root'))
```
假如说我们需要渲染出以上组件，那么它们对应的 `fiber` 树应该长这样
![fiber-tree](https://raw.githubusercontent.com/GoFzy/pic-bed/master/fiber-tree.png)

## 小结
感觉整节内容比较绕，这里通过一张流程图总结一下这篇文章的内容:
![reactdom-render](https://raw.githubusercontent.com/GoFzy/pic-bed/master/reactdom-render.png)
`RenderDOM.render` 在`ReactRoot` 实例未被创建时，函数执行流程如下: 
* `legacyRenderSubtreeIntoContainer` 中创建一个 `ReactRoot` 实例并挂载到 `DOM`节点的 `_reactRootContainer` 属性上
* `ReactRoot` 实例化时，在其原型链上有 `render` 方法，用来执行我们的 `render` 操作，同时会创建并挂载一个 `_internalRoot` 属性，是其内部 `fiber` 树的入口，在这棵树上有我们要渲染的节点
* `_internalRoot` 属性也是一个对象，拥有若干属性，其中 `uninitializedFiber` 是其内部 `fiber` 树的根节点
* `fiber` 树是一个单链表树结构


参考文章:
* <https://github.com/KieSun/Dream/issues/19>
* <https://github.com/jsonz1993/react-source-learn/issues/3>
* <https://segmentfault.com/a/1190000018047670>