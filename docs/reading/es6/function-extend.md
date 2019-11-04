# 函数的扩展
## 函数参数的默认值
基本使用方法如下:
```js
function log(x, y = 'world') {
  console.log(`${x} ${y}`);
}
log('hello');
```
相较于 `ES5`，`ES6` 写法除了简洁以外还具有两个优点：
* 便于协同开发者阅读，能快速意识到哪些参数是**可省略的**
* 便于未来代码优化，拿掉该参数仍不会影响代码运行

### 与解构赋值默认值结合使用
参数默认值可以与解构赋值的默认值，结合起来使用:
```js
function foo({x, y = 5}) {
  console.log(x, y);
}
foo({})              // undefined 5
foo({x: 1})          // 1 5
foo({x: 1, y: 2})    // 1 2
foo()                // TypeError: Cannot read property 'x' of undefined
```
上面代码只使用了对象的**解构赋值**默认值，没有使用**函数参数的默认值**，因此只有当函数 `foo` 的参数是一个**对象**时，变量 `x` 和 `y` 才会通过解构赋值生成。  
相反，如果调用时未传参则会抛出引用格式的异常(传入其他格式数据并不会抛出异常)。为了避免这种情况，可以通过提供函数参数的默认值来解决，比如：
```js
function foo({x, y = 5} = {}) {
  console.log(x, y);
}

foo() // undefined 5
```
下面是另一个解构赋值默认值的例子:
```js
// 写法一
function m1({x = 0, y = 0} = {}) {
  return [x, y];
}

// 写法二
function m2({x, y} = { x: 0, y: 0 }) {
  return [x, y];
}
```
上面两种写法都对函数的参数设定了默认值，区别是:
* 前者函数参数的默认值是空对象，但是**设置了**对象解构赋值的默认值
* 后者参数的默认值是一个有具体属性的对象，但是**没有设置**对象解构赋值的默认值
```js
// 函数没有参数的情况
m1() // [0, 0]
m2() // [0, 0]

// x 和 y 都有值的情况
m1({x: 3, y: 8}) // [3, 8]
m2({x: 3, y: 8}) // [3, 8]

// x 有值，y 无值的情况
m1({x: 3}) // [3, 0]
m2({x: 3}) // [3, undefined]

// x 和 y 都无值的情况
m1({}) // [0, 0];
m2({}) // [undefined, undefined]

m1({z: 3}) // [0, 0]
m2({z: 3}) // [undefined, undefined]
```

### 参数默认值的位置
通常情况下，定义了默认值的参数，应该是函数的**尾参数**。因为这样比较容易看出来，到底省略了哪些参数。如果非尾部的参数设置默认值，实际上这个参数是**没法省略**的
```js
function f(x = 1, y) {
  return [x, y];
}

f()             // [1, undefined]
f(2)            // [2, undefined])
f(, 1)          // 报错
f(undefined, 1) // [1, 1]
```
上面代码中，有默认值的参数都不是尾参数时，无法只省略该参数，而不省略它后面的参数，除非显式输入`undefined`

### 函数的length属性
指定了默认值以后，函数的 `length` 属性，将返回没有指定默认值的参数个数。也就是说，指定了默认值后，`length`属性将失真
```js
(function (a) {}).length           // 1
(function (a = 5) {}).length       // 0
(function (a, b, c = 5) {}).length // 2
(function (a, b = 5, c) {}).length // 1
```
**个人理解**：这里的 `length` 属性是以第一个设置默认值的参数为界限来计算的

### 作用域(重点)
一旦设置了参数的默认值，函数进行声明初始化时，参数会形成一个单独的**作用域（`context`）**。等到初始化结束，这个作用域就会消失。这种语法行为，在不设置参数默认值时，是不会出现的
```js
let x = 1;
function f(x, y = x) {
  console.log(y);
}

f(2)  // 2
```
上面代码中，调用函数f时，参数形成一个单独的作用域。在这个作用域里面，默认值变量 `x` 指向第一个参数 `x` ，而不是全局变量 `x` ，所以输出是2  
再看下面的例子
```js
let x = 1;
function f(y = x) {
  let x = 2;
  console.log(y);
}

f();
```
上面代码中，函数 `f` 调用时，参数 `y = x` 形成一个单独的作用域。这个作用域里面，变量 `x` 本身没有定义，所以指向外层的全局变量 `x`。函数调用时，函数体内部的局部变量 `x`影响不到默认值变量 `x`。如果参数的默认值是一个函数，该函数的作用域也遵守这个规则：
```js
let foo = 'outer';

function bar(func = () => foo) {
  let foo = 'inner';
  console.log(func());
}

bar(); // outer
```  
**个人理解**：设置默认参数产生的单独作用域是包裹在函数内部作用域之外的

## rest参数
### 基本使用
`ES6` 引入 `rest` 参数（形式为 `...变量名`），用于获取函数的多余参数，其中变量就会是一个包含输入参数的数据，可以理解为是对原 `arguments` 对象的一种优化  
```js
// arguments变量的写法
function sortNumbers() {
  return Array.prototype.slice.call(arguments).sort();
}

// rest参数的写法
function sortNumbers(...numbers) {
  return numbers.sort();
}
```
比较后可以发现，`rest` 参数的写法更自然也更简洁

### 注意点
首先， `rest` 参数只能为尾参数，否则会报错
```js
// 报错
function f(a, ...b, c) {
  //...
}
```
其次，函数的 `length` 属性不包括 `rest` 参数
```js
(function(a, ...b) {}).length; // 1
```

## 严格模式
从 `ES5` 开始，函数内部可以设定为严格模式
```js
function foo() {
  'use strict'
  // code
}
```
但在 `ES6` 中做出了一点修改，其中规定只要函数参数使用了**默认值、解构赋值或扩展运算符**，那么函数内部就不可显示定义为严格模式
```js
// 报错
function doSomething(a, b = a) {
  'use strict';
  // code
}

// 报错
const doSomething = function ({a, b}) {
  'use strict';
  // code
};

// 报错
const doSomething = (...a) => {
  'use strict';
  // code
};
```
这样规定的原因是，函数内部的严格模式，同时作用于**函数体**和**函数参数**。但是，函数执行的时候，**先执行**函数参数，然后再执行函数体，比如：
```js
function doSomething(value = 070) {
  'use strict';
  return value;
}
```
上面代码中，参数 `value` 的默认值是八进制数 `070`，但是严格模式下不能用前缀 `0` 表示八进制，所以应该报错。但是实际上，`JavaScript` 引擎会先成功执行 `value = 070`，然后进入函数体内部，发现需要用严格模式执行，这时才会报错。这样无疑增加了复杂性，故设此限制

## name属性
函数的 `name` 属性，返回该函数的函数名(若是匿名函数赋值的形式，则返回变量名)
```js
function foo() {};
foo.name; // 'foo'

var f = function() {}
f.name; // 'f'
```
此外还有两个特殊的地方需要注意
```js
// Function构造函数返回的函数实例，name属性的值为anonymous
(new Function).name // "anonymous"

// bind返回的函数，name属性值会加上bound前缀
function foo() {};
foo.bind({}).name // "bound foo"
```

## 箭头函数(重点)
这里比较重要，单独使用一篇博客进行总结

## 尾调用优化
### 什么是尾调用
尾调用（`Tail Call` ）是函数式编程的一个重要概念，本身非常简单，一句话就能说清楚，就是指某个函数的**最后一步**是调用另一个函数
```js
// 非尾调用--调用函数后，进行了赋值操作
function f(x) {
  let y = g(x);
  return y;
}

// 非尾调用--函数调用完后还有操作
function f(x) {
  return g(x) + 1;
}

// 非尾调用--函数默认return undefined
function f(x) {
  g(x);
}

// 尾调用
function f(x) {
  return g(x);
}
```
尾调用不一定出现在函数尾部，只要是**最后一步操作**即可
```js
function f(x) {
  if(x > 0) {
    return m(x);
  }
  return n(x);
}
```
### 尾调用优化
首先我们需要知道，函数调用会在内存形成一个"调用记录"，又称"调用帧"(`call frame`)，保存调用位置和内部变量等信息。如果在函数 `A` 的内部调用函数 `B`，那么在 `A` 的调用帧上方，还会形成一个 `B` 的调用帧。等到 `B` 运行结束，将结果返回到 `A`，`B` 的调用帧才会消失。如果函数B内部还调用函数 `C`，那就还有一个 `C` 的调用帧，以此类推。所有的调用帧，就形成一个**调用栈**(`call stack`)  
而尾调用由于是函数的最后一步操作，所以**不需要保留**外层函数的调用帧，因为调用位置、内部变量等信息都不会再用到了，只要直接用内层函数的调用帧，取代外层函数的调用帧就可以了
```js
function f() {
  let m = 1;
  let n = 2;
  return g(m + n);
}
f();

// 等同于
function f() {
  return g(3);
}
f();

// 等同于
g(3);
```
因此，尾调用优化（`Tail call optimization`），即只保留内层函数的调用帧。如果所有函数都是尾调用，那么完全可以做到每次执行时，调用帧**只有一项**，这将大大节省内存
::: tip
注意，目前只有 Safari 浏览器支持尾调用优化，Chrome 和 Firefox 都不支持。
:::

### 尾递归
函数调用自身，称为递归。如果尾调用自身，就称为尾递归，即尾递归是尾调用中的一种  
递归非常耗费内存，因为需要同时保存成千上百个调用帧，很容易发生**栈溢出**错误（`stack overflow`）。但对于尾递归来说，由于只存在一个调用帧，所以永远不会发生**栈溢出**错误
```js
function factorial(n) {
  if (n === 1) return 1;
  return n * factorial(n - 1);
}

factorial(5) // 120
```
上面代码是一个阶乘函数，计算 `n` 的阶乘，最多需要保存 `n` 个调用记录，复杂度 `O(n)`  
如果改写成尾递归，只保留一个调用记录，复杂度 `O(1)`
```js
function factorial(n, total) {
  if (n === 1) return total;
  return factorial(n - 1, n * total);
}

factorial(5, 1) // 120
```
由此可见，**尾调用优化**对递归操作意义重大，所以一些函数式编程语言将其写入了语言规格。`ES6` 亦是如此，第一次明确规定，所有 `ECMAScript` 的实现，都必须部署“尾调用优化”。这就是说，`ES6` 中只要使用尾递归，就不会发生栈溢出（或者层层递归造成的超时），相对节省内存

### 递归函数的改写
两个方法可以进行递归函数的改写。方法一是把所有用到的内部变量改写成函数的参数
```js
function Fibonacci(n) {
  if(n <= 1) return 1;
  return Fibonacci(n - 1) + Fibonacci(n - 2);
}

function Fibonacci(n, ac1 = 1; ac2 = 1) {
  if(n <= 1) return ac2;
  return Fibonacci(n - 1, ac2, ac1 + ac2);
}
```
方法二是函数柯里化(`curring`)，即将多参数函数转换成单参数形式
```js
function curry(fn, arr = []) {
  return fn.length === arr.length ? fn.apply(null, arr) : function(...args) {
    return curry(fn, arr.concat(args));
  }
}

function tailFactorial(n, total) {
  if (n === 1) return total;
  return tailFactorial(n - 1, n * total);
}

const factorial = curry(tailFactorial)(1);

factorial(5) // 120
```
总结一下，递归本质上是一种循环操作。纯粹的函数式编程语言没有循环操作命令，所有的循环都用**递归**实现，这就是为什么尾递归对这些语言极其重要。对于其他支持**尾调用优化**的语言（比如 `Lua，ES6`），只需要知道循环可以用递归代替，而一旦使用递归，就最好使用尾递归