# 单例模式
## 一、定义及其实现
&emsp;&emsp;**单例模式**：保证一个类仅有**一个实例**，并提供一个访问它的**全局访问点**。

### 1.1 实现单例模式
&emsp;&emsp;要实现一个单例模式很简单，无非是使用一个变量来标志当前是否已经为某个类创建过对象，如果是，则在下一次获取该类的实例时，直接返回创建过的对象，代码如下：

```javascript
    var Singleton = function(name) {
        this.name = name;
    }
    Singleton.instance = null;
    Singleton.prototype.getName = function() {
        console.log(this.name);
    };
    Singleton.getInstance = function(name) {
        if(!this.instance) {
            this.instance = new Singleton(name);
        }
        return this.instance;
    }

    var a = Singleton.getInstance('sven1');
    var b = Singleton.getInstance('sven2');
    console.log(a === b );
```
&emsp;&emsp;我们通过`Singleton.getInstance`来获取`Singleton`类的唯一对象，这种方式相对简单，但有一个问题，就是增加了这个类的“不透明性”，`Singleton类`的使用者必须知道这是一个单例类，同时也只能通过`Singleton.getInstance`来获取对象。

### 1.2 透明的单例模式
&emsp;&emsp;我们现在的目标是实现一个“透明”的单例类，用户从这个类中创建对象的时候，可以像使用其他普通类一样。在下面的例子中，我们通过`CreateDiv单例类`来创建页面中唯一的`div`节点：

```javascript
    var CreateDiv = (function(){
        var instance;
        var CreateDiv = function(html) {
            if(instance) {
                return instance;
            }
            this.html = html;
            this.init();
            return instance = this;
        };
        CreateDiv.ptototype.init = function(){
            var div = document.create('div');
            div.innerHTML = this.html;
            document.body.appendChild(div);
        };
        return CreateDiv;
    })();
    var a = new CreateDiv('feng');
    var b = new CreateDiv('feng2');
    console.log(a === b); //true
```
&emsp;&emsp;现在虽然完成了透明单例类的编写，但是它还存在一定的缺陷，这里为了把`instance`封装起来，我们使用了自执行的匿名函数和闭包，并且让这个匿名函数返回真正的`Singleton`构造方法，这就使得程序复杂起来。此外我们在观察下这个构造函数，它实际上做了两件事情
* 第一是创建对象和执行初始化`init`方法
* 第二是保证只有一个对象，这就有悖与**单一职责原则**，假设我们有天就是想创建多个`div`，那我们就必须改写这个构造函数，很多余

### 1.3用代理实现单例模式
&emsp;&emsp;现在我们通过引入代理类的方式，来解决上面的问题：
```javascript
    //首先在CreateDiv构造函数中，把负责管理单例的代码移除，使它成为一个普通的创建div的类
    var CreateDiv = function(html) {
        this.html = html;
        this.init();
    };
    CreateDiv.prototype.init = function(){
        var div = document.create('div');
        div.innerHTML = this.html;
        document.body.appendChild(div);
    };
    //接下来引入代理类ProxySingletionCreateDiv
    var ProxySingletionCreateDiv = (function(){
        var instance;
        return function(html) {
            if(!instance) {
                instance = new CreateDiv(html);
            }
            return instance;
        }
    })();
    var a = new ProproxySingletionCreateDiv('feng1');
    var b = new ProproxySingletionCreateDiv('feng2');
    console.log(a === b);//true
```
&emsp;&emsp;通过引入代理类的方式，我们同样完成了一个单例类的编写。与之前不同的是，我们把负责管理单例的逻辑移到了代理类当中，这样一来`CreateDiv`就变成了一个普通的类，两者组合能达到单例模式的效果(后续会继续学习代理带来的好处)

## 二、JavaScitpt中的单例模式
&emsp;&emsp;前面提到的几种单例模式的实现，更多的是接近传统面向对象语言中的实现。但`JavaScript`是一门无类语言，也正因如此，生搬单例模式的概念并不意义。
&emsp;&emsp;单例模式的核心是**确保只有一个实例，并提供全局访问**。  
&emsp;&emsp;全局变量不是单例模式，但在`JavaScript开发中，我们经常会把`**全局变量**当作单例模式来使用。但全局变量也存在很多问题，它很容易造成命名空间污染，亦很可能被覆盖。以下几种方式可以相对降低全局变量带来的命名污染：

### 2.1 命名空间
&emsp;&emsp;适当地使用命名空间，能减少全局变量的数量，最简单的就是使用对象字面量的方式：
```javascript
    var namespace = {
        a: 'feng',
        b: 'zheying',
    }
    //升级--动态的创建命名空间
    var myApp = {};
    myApp.namespace = function(name) {
        var parts = name.split('.');
        var current = myApp;
        for (var i in parts) {
            if(!current[parts[i]]) {
                current[parts[i]] = {};
            }
            current = current[parts[i]];
        }
    };
    myApp.namespace('event');
    myApp.namespace('dom.style');

    console.dir(myApp);
```
### 2.2 使用闭包封装私有变量
&emsp;&emsp;这种方法把一些变量封装在闭包内部，只暴露一些接口跟外界通信：
```javascript
    var user = (function(){
        var __name = 'feng',
            __age = 25;

            return {
                getUserInfo: function(){
                    return __name + '-' + __age;
                }
            }
    })()
```

## 三、惰性单例
&emsp;&emsp;所谓惰性单例指的是在**需要的时候**才创建出来。**惰性单例**是单例模式的重点，第一小节中的`instance`实例对象就是一个惰性单例，它总是在哦我们调用`Singleton.getInstance`的时候才被创建，而不是**页面加载好的时候**。不过那是基于**"类"**的单例模式，这在`JavaScript`中并不适用。
&emsp;&emsp;下面以WebQQ的登录浮窗为例，介绍与全局变量结合实现的惰性单例。首先登陆浮窗在页面中总是唯一的，不可能同时出现两个:
### 3.1 页面加载完成便创建
&emsp;&emsp;该方法在页面加载完成时便创建好这个`div`浮窗，但是是隐藏的，用户点击登录按钮时，它才显示：
```html
    <html>
        <body>
            <button id="loginBtn">登录</button>
        </body>
        <script>
            var loginLayer = (function(){
                var div = document.createElement('div');
                div.innerHTML = '我是登录浮窗';
                div.style.display = 'none';
                document.body.appendChild(div);
                return div;
            })();

            document.getElementById('loginBtn').onclick = function(){
                loginLayer.style.display = 'block';
            };
        </script>
    </html>
```
### 3.2 点击登录时创建
&emsp;&emsp;第一种方法有个问题，也许我们进入`WebQQ`只是看看天气，根本不需要登录操作，这样就白白浪费一个`DOM节点`，现在修改下代码，在点击登录按钮时才创建浮窗：
```html
<html>
    <body>
        <button id="loginBtn">登录</button>
    </body>
    <script>
        var createLoginLayer = function(){
            var div = document.createElement('div');
            div.innerHTML = '我是登录浮窗';
            div.style.display = 'none';
            document.body.appendChild(div);
            return div;
        };

        document.getElementById('loginBtn').onclick = function(){
            var loginLayer = createLoginLayer();
            loginLayer.style.display = 'block';
        };
    </script>
</html>
```
### 3.3 加入标志判断
&emsp;&emsp;第二种方法虽然达到了惰性的目的，但是失去了单例的效果。当我们每次点击按钮时都会创建一个新的登录浮窗，因此这是我们可以使用一个变量来判断：
```html
    <html>
        <body>
            <button id="loginBtn">登录</button>
        </body>
        <script>
            var createLoginLayer = (function(){
                var div;
                return function(){
                    if(!div) {
                        var div = document.createElement('div');
                        div.innerHTML = '我是登录浮窗';
                        div.style.display = 'none';
                        document.body.appendChild(div);
                    }
                    return div;
                }
            })();

            document.getElementById('loginBtn').onclick = function(){
                var loginLayer = createLoginLayer();
                loginLayer.style.display = 'block';
            };
        </script>
    </html>
```
## 四、通用的惰性单例
&emsp;&emsp;上一节中我们完成了一个可用的惰性单例，但是它还存在一定的问题：  
&emsp;&emsp;①这段代码仍是违反单一职责原则的，创建对象和管理单例的逻辑都放在`createLoginLayer对象`内部  
&emsp;&emsp;②如果我们下次需要创建页面中唯一的`iframe`或者`script`标签就必须得把代码进行需改或者重新照抄一遍    
&emsp;&emsp;首先我们需要把不变的部分隔离出来，比如管理单例的逻辑部分：用一个变量来标志是否创建过该对象，如果是，则下次直接返回这个对象：
```javascript
    var obj;
    if(!obj) {
        obj = xxx;
    }
```
&emsp;&emsp;现在我们把如何管理单例的逻辑从原来的代码中进行抽离，将其封装在getSingle函数内部，创建对象的方法`fn`被当作参数动态传入`getSingle`函数：
```javascript
    var getSingle = function(fn) {
        var result;
        return function(){
            return result||(result = fn.apply(this,arguments));
        }
    }
    //创建div
    var createLoginLayer = function() {
        var div = document.createElement('div');
        div.innerHTML = '我是登录浮窗';
        div.style.display = 'none';
        document.body.appendChild(div);
        return div;
    }
    var createSingleLoginLayer = getSingle(createLoginLayer);
    document.getElementById('loginBtn').onclick = function(){
        var loginLayer = createSingleLoginLayer();
        loginLayer.style.display = 'block';
    };
```
&emsp;&emsp;在这个例子中，我们将**创建实例对象**的职责和**管理单例**的职责分别放置于两个方法之中，这两个方法相互独立且互不影响。