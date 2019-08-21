# 闭包与高阶函数
## 一、闭包
**闭包**的形成与**变量的作用域**&**变量的生存周期**密切相关，下面我们先了解下这两个知识点：
* 变量的作用域：指变量的有效范围，我们常谈到的是函数中声明的变量作用域，函数中定义变量，有 `var` 等声明该变量就是局部变量，仅在函数内部才能访问，外部访问不到，没有则为隐式全局变量
* 变量的生存周期：对于全局变量，它的生存周期当然是永久的，除非主动销毁这个变量；而局部变量在函数调用就是后被销毁。我们来看看这段代码：
```javascript
var func = function() {
  var a = 1;
  return function(){
    a++;
    console.log(a);
  }
}
var f = func();
f(); //2
f(); //3
f(); //4
f(); //5
```
这里 `a` 变量并没有被销毁的原因是：我们在执行 `var f = func()` 的时候，变量 `f` 赋值为一个匿名函数的引用，它可以访问 `func()` 被调用时产生的环境，而局部变量 `a` 就一直处在这个环境当中。由于局部变量所处的环境还能被外界访问，那么这个局部变量就有了不被销毁的理由----这里就产生了一个**闭包**结构，局部变量的生命看起来被延续了

### 1.1 闭包的更多作用：
**封装变量**  
闭包可以把一些不需要暴露在全局的变量封装成**私有变量**，假设有个计算乘积的简单函数：
```javascript
var mult = function() {
  var a = 1;
  for(var i = 0; l = arguments.length; i<l; i++) {
    a = a*arguments[i];
  }
  return a;
}
```
现在我们加入缓存机制来提高这个函数的性能：
```javascript
var cache = {};
var mult = function () {
  var args = Array.prototype.join.call(arguments, ',');
  if (cache[args]) {
    return cache[args];
  }
  var a = 1;
  for (var i = 0, l = arguments.length; i < l; i++) {
    a = a * arguments[i];
  }
  return cache[args] = a;
}

```
我们看到 `cache` 这个变量仅仅在 `mult` 函数中被用到，为了减少页面中全局变量，我们修改如下：
```javascript
var mult = (function () {
  var cache = {};
  return function () {
    var args = Array.prototype.join.call(arguments, ',');
    if (cache[args]) {
      return cache[args];
    }
    var a = 1;
    for (var i = 0, l = arguments.length; i < l; i++) {
      a = a * arguments[i];
    }
    return cache[args] = a;
  }
})();
```
**提炼函数**  
是代码重构中常见的技巧，如果一个大函数内有一些代码能够独立出来，我们常常把这些代码块封装在独立的小函数里，且有助于复用。如果这些小函数不需要在程序的其他地方使用，最好把它们用闭包封装起来：

```javascript
var mult = (function(){
  var cache = {};
  var calculate = function() {
    var a = 1;
    for (var i = 0; l = arguments.length; i < l; i++) {
        a = a * arguments[i];
    }
    return a;
  };
  
  return function() {
    var args = Array.prototype.join.call(arguments, ',');
    if (cache[args]) {
      return cache[args];
    }
    return cache[args] = calculate.apply(null,aruments);
  }
})
```

### 1.2 闭包和面向对象设计
过程与数据的结合是形容面向对象中“对象”常用的表达。对象以方法的形式包含了过程，而闭包则是在过程中以环境的形式包含了数据。通常面向对象思想能实现的功能，闭包也能实现，反之亦然：
```javascript
var extent = function(){
  var value = 0;
  return function() {
    console.log(++value);
  }
};
extent.call();//1
extent.call();//2
extent.call();//3
```

## 二、高阶函数
高阶函数是指至少满足下列条件之一的函数：  
* 函数可以作为参数被传递  
* 函数可以作为返回值输出

### 2.1 函数作为参数传递：
这代表我们可以抽一一部分容易**变化**的业务逻辑，将这部分业务逻辑放在函数参数中，这样一来就可以分离业务代码中变化与不变的部分：

**回调函数**  
在 `ajax` 异步请求的应用中，回调函数的使用非常频繁。当我们想在 `ajax` 请求返回之后做一些事情，但又并不知道返回的确定时间时，最常见的方案就是把 `callback` 函数作为参数传入发送 `ajax` 请求的方法中，待请求完成之后执行 `callback` 函数：
```javascript
var getUSerId = function(userId,callbcak) {
  $.ajax('xxx网址?x='+userId, function(data){
    if(typeof callback === 'function') {
      callback(data);
    }
  })
}
```
回调函数不仅仅应用与异步请求中，当一个函数不适合执行一些请求时，我们也可以把这些请求封装成一个函数，并将它作为参数传递给另外一个函数，委托它来执行，比如我们要在页面中创建100个 `div` 节点，然后全部隐藏：
```javascript
var appendDiv = function() {
  for(var i = 0;i<100;i++) {
    var div = document.createElement('div');
    div.innerHTML = i;
    document.body.appendChild(div);
    div.style.display = 'none';
  }
};
```
将 `div.style.display = 'none'` 逻辑写在 `appendDiv` 中显然是不合理的，这让其成为了一个难以复用的函数，并不是每个人创建了节点之后都希望他们立即隐藏，于是我们将这部风逻辑抽离出来，以回调函数的形式传入：
```javascript
var appendDiv = function(callback) {
  for(var i = 0;i<100;i++) {
    var div = document.createElement('div');
    div.innerHTML = i;
    document.body.appendChild(div);
    if(typeof callback === 'function') {
      callback(div);
    }
  }
}
appendDiv(function(node){
  node.style.display = 'none'；
})
```
**Array.prototype.sort**  
`Array.prototype.sort` 接受一个函数作为参数，这个函数里封装了数组元素的排序原则，从这里我们可以看到，我们的目的是对数组进行排序，这是不变的部分；而使用什么规则排序，则是可变的部分。把可变的部分封装在函数参数里，动态传入 `Array.prototype.sort`，使其成为了一个非常灵活的方法
```javascript
//从小到大排序
[1,4,3].sort(function(a,b){
    return a - b;
})
```

### 2.2 函数作为返回值输出：
相比把函数作为参数传递，函数作为返回值输出的应用场景更多，也更能体现函数式编程的巧妙，让函数继续返回一个可执行的函数，意味着运算过程式可延续的：  
**判断数据类型**  
我们来看看这个例子，判断一个数据是否为数组，我们可以使用例如判断这个数据有没有 `length` 属性，有没有 `sort` 方法或者 `slice` 方法等。当更好的方法是 `Object.prototype.toString` 来计算，代码如下：
```javascript
var isString = function(obj) {
  return Object.prototype.toString.call(obj) === '[object String]';
}
var isArray = function(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}
var isNumber = function(obj) {
  return Object.prototype.toString.call(obj) === '[object Number]';
}
```
我们发现，这些函数大部分是相同的，不同只是字符串内容，因此我们可以尝试将其作为参数提前植入到函数中：
```javascript
var isType = function(type){
return function(obj) {
    return Object.prototype.toString.call(obj) === '[object '+ type +']';
  }
}
var isString = isType('String');
console.log(isString('hello world'));
```