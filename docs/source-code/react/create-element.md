# React.createElement
大家在写 `React` 代码的时候肯定写过 `JSX`，但是为什么一旦使用 `JSX` 就必须引入 `React` 呢？
这是因为我们的 `JSX` 代码会被 `Babel` 编译为 `React.createElement`，不引入 `React` 的话就不能使用 `React.createElement` 了
```js
<div id="demo">demo</div>

//上面 JSX 代码会被 babel 编译成这样
React.createElement("div", { id : demo },  "1" );
```
那么我们就从在源码中看看它是如何定义的吧，`React` 版本为16.8.6，文件位置 `/node_modules/react/cjs/react.development.js`。 首先在源码中搜索 `createElement` , 可以在整个 `React` 对象上找到该属性:
```js
var React = {
  ...
  createElement: createElementWithValidation,
  ...
}

//主要是对传入的 type 和 props 参数进行验证
function createElementWithValidation(type, props, children) {
  ...
  var element = createElement.apply(this, arguments);
  ...
  return element;
}
```
找到 `createElementWithValidation` 函数，该函数接收三个参数 `type props children`。 结合 `demo` 组件，个人理解:  
* type: 组件的类型
* props: 组件的属性
* children: 组件的内容
在该函数中主要是对传入的 `type` 和 `props` 参数进行验证，并没有创建内容，所以我们把关注重点放在 `createElement` 函数的实现上。

## createElement
`createElement`函数也接收同样的三个参数`type config children`
```js
function createElement(type, config, children)  {
    if (config != null) {
    if (hasValidRef(config)) {
      ref = config.ref;
    }
    if (hasValidKey(config)) {
      key = '' + config.key;
    }

    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;
    // Remaining properties are added to a new props object
    for (propName in config) {
      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    }
  }
}
```
这段代码对 `ref` 以及 `key` 做了个验证（对于这种代码就无须阅读内部实现，通过函数名就可以了解它想做的事情），然后遍历 `config` 并把内建的几个属性（比如 `ref` 和 `key`）剔除后放到了 `props` 对象中。这些都不是重点，我们继续往下看
```js
function createElement(type, config, children)  {
  //省略...
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    {
      if (Object.freeze) {
        Object.freeze(childArray);
      }
    }
    props.children = childArray;
  }
}
```
这是一段对于 `children` 的操作，首先把第二个参数之后的参数取出来，然后判断长度是否大于1。大于1的话就代表有多个 `children`，这时候 `props.children` 会被设置为成**数组**，否则的话只是一个**对象**或者**字符串**。这样将可能不是很理解，这里以一个小实验来说明，定义一个 `demo` 组件如下
```js
//Demo组件
function Demo(props) {
  return (
    <div id="demo">
      <div id="son1">Son1</div>
      <span id="son2">Son2</span>
    </div>
  )
}
```
然后在源码中打下断点：
<img style="height: 20%" :src="$withBase('/react/children.jpg')" />
可以看到在创建 `#demo` 元素时此时传入了2个 `children` ，因此之后 `props.children` 属性将会设置为数组。此外在调试过程中发现在创建 `Demo` 组件时多次执行了 `createElement` 函数，具体的执行顺序是 `function Demo` -> `#son1` ->  `#son2` -> `#demo`，即**由内而外**的顺序  
最后就是返回了一个 `ReactElement` 对象
```js
function createElement(type, config, children) {
  //省略...
  return ReactElement(element.type, key, ref, self, source, owner, props);
}
var ReactElement = function (type, key, ref, self, source, owner, props) {
  var element = {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    key: key,
    ref: ref,
    props: props,
    _owner: owner
  };
  //...
  return element; 
}
```
内部代码很简单，核心就是通过 `$$typeof` 来帮助我们识别这是一个 `ReactElement`，后面我们可以看到很多这样类似的类型。另外我们需要注意一点的是：通过 `JSX` 写的 `<APP />` 代表着 `ReactElement`，`APP` 代表着 `React Component`。  
这节内容小结：
<img  :src="$withBase('/react/create-element.jpg')"> 

参考文章:
* <https://juejin.im/post/5983dfbcf265da3e2f7f32de>
* <https://github.com/KieSun/learn-react-essence/blob/master/%E7%83%AD%E8%BA%AB%E7%AF%87.md>
