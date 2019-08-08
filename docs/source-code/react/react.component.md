# React.Component && React.PureComponent
上文中讲到了 `APP` 代表着 `React Component`，那么这一小节我们就来阅读组件相关的代码吧。`React` 中组件相关属性分别为 `Component` 及 `PureComponent`，我们先来阅读 `Component` 这部分的代码

## React.Component
`React` 版本为16.8.6，文件位置 `/node_modules/react/cjs/react.development.js`。首先在源码中搜索 `Component` 可以在 `React` 对象上找到该属性:
```js
var React = {
  ...
  Component: Component,
  ...
}

function Component(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}

Component.prototype.isReactComponent = {};
Component.prototype.setState = function (partialState, callback) {
  !(typeof partialState === 'object' || typeof partialState === 'function' || partialState == null) ? invariant(false, 'setState(...): takes an object of state variables to update or a function which returns an object of state variables.') : void 0;
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
};
Component.prototype.forceUpdate = function (callback) {
  this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
};
```
构造函数 `Component` 中首先对 `props`、`context`、`refs` 以及 `updater` 四个属性进行了初始化。其中 `refs` 和 `updater`，前者会在下文中专门介绍，后者是组件中相当重要的一个属性，我们可以发现 `setState` 和 `forceUpdate` 都是调用了 `updater` 中的方法，但是 `updater` 是 `react-dom` 中的内容，这部分内容也会在之后进行学习  
现在我们直观的看一下 `props` 和 `context` 属性的传入过程，这里根据 `React` 官方文档中 [`context`小节](https://zh-hans.reactjs.org/docs/context.html#when-to-use-context)的按钮组件案例进行说明：
```js
const ThemeContext = React.createContext('light');

class App extends React.Component {
  render() {
    return (
      <ThemeContext.Provider value="dark">
        <Toolbar />
      </ThemeContext.Provider>
    );
  }
}

function Toolbar(props) {
  return (
    <div>
      <ThemedButton id="demo-btn"/>
    </div>
  );
}

class ThemedButton extends React.Component {
  static contextType = ThemeContext;
  render() {
    return <button id={this.props.id}>Theme: {this.context}</button>;
  }
}
```
打个断点调试一下,我们可以看到 `ThemeButton` 组件接收到了这两个属性
![React.Component](https://raw.githubusercontent.com/GoFzy/pic-bed/master/React-Component.jpg)  
此外，在调试的过程中，发现 `React.Component` 只会在 `Class` 组件定义时被调用，函数组件不会(因为`function` 直接返回了 `ReactElement`)

## React.PureComponent
接下来我们来阅读 `PureComponent` 中的代码，其实这部分的代码基本与 `Component` 一致:
```js
function PureComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}
var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
pureComponentPrototype.constructor = PureComponent;
_assign(pureComponentPrototype, Component.prototype);
pureComponentPrototype.isPureReactComponent = true;
```
我们可以看到 `PureComponent` 继承自 `Component`，继承方法使用了很典型的寄生组合式。另外这两部分代码你可以发现每个组件都有一个 `isXXXX` 属性用来标志自身属于什么组件。