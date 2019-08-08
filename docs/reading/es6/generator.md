# Generator函数
## 背景知识
尽管 `Promise` 方法能够解决 `JS` 异步方法带来的嵌套地狱问题，但其本质上只是回调函数的改进，使用 `then` 方法以后，异步任务的两端执行更清楚了，除此以外，并无新意。而 `Promise` 最大的问题是代码冗余，原来的任务被 `Promise` 包装后，无论什么操作，一眼看上去都是很多 `then` 的堆积，原来的语义也变得很不清楚，因此 `Generator` 函数就产生了。
## 基本语法
形式上 `Generator` 函数是一个普通函数，但是有两特征:
*  `function` 命令与函数名之间有一个 `*` ；
* 函数体内部使用 `yield` 语句定义不同的内部状态：
`Generator` 函数的调用方法与普通函数一样，也是在函数名后面加上一对圆括号。但不同之处在于调用 `Generator` 函数后，该函数并不是马上执行，而是返回一个指向内部状态的指针对象--遍历器对象
```js
function *show(){
    yield console.log(1);
    yield console.log(2);
}
let genObj = show();
```  
下一步，必须使用 `next` 方法，使得指针移向下一个状态，也就是说，每次我们调用 `next` 方法，内部指针从函数头部或上一次停下来的地方开始执行，直到遇到下个 `yield` 或 `return` 语句
```js
genObj.next();
genObj.next();
```
![genObj](https://raw.githubusercontent.com/GoFzy/pic-bed/master/genObj.png)  
## yield表达式
由于 `Generator` 函数返回的遍历器对象，只有调用 `next` 方法才会遍历下一个内部状态，所以其实提供了一种可以暂停执行的函数。`yield` 表达式就是暂停标志,遍历器对象的 `next` 方法的运行逻辑如下
* 遇到 `yield` 表达式，就暂停执行后面的操作，并将紧跟在 `yield` 后面的那个表达式的值，作为返回的对象的`value` 属性值
* 下一次调用 `next` 方法时，再继续往下执行，直到遇到下一个 `yield` 表达式
* 如果没有再遇到新的 `yield` 表达式，就一直运行到函数结束，直到 `return` 语句为止，并将 `return` 语句后面的表达式的值，作为返回的对象的 `value`属性值
* 如果该函数没有 `return` 语句，则返回的对象的 `value` 属性值为 `undefined`
需要注意的是，`yield` 表达式后面的表达式，只有当调用 `next` 方法、内部指针指向该语句时才会执行，因此等于为 `JavaScript` 提供了手动的**惰性求值**（`Lazy Evaluation`）的语法功能  

`yield` 表达式与 `return` 语句既有相似之处，也有区别:  
**相似**:，都能返回紧跟在语句后面的那个表达式的值  
**区别**: 每次遇到 `yield`，函数暂停执行，下一次再从该位置继续向后执行，而 `return`语句不具备位置记忆的功能。一个函数里面，只能执行一次（或者说一个）`return`语句，但是可以执行多次（或者说多个）`yield` 表达式。正常函数只能返回一个值，因为只能执行一次 `return`；`Generator` 函数可以返回一系列的值，因为可以有任意多个`yield`。从另一个角度看，也可以说 `Generator` 生成了一系列的值，这也就是它的名称的来历（英语中，`generator` 这个词是“生成器”的意思）

## next方法的参数
`yield` 表达式本身没有返回值，或者说总是返回 `undefined`。`next` 方法可以带一个参数，该参数就会被当作上一个 `yield` 表达式的返回值，例如
```js
function *f() {
  for(let i = 0; true; i++) {
    let reset = yield i;

    if(reset) {
      console.log('reset', reset);
    } else {
      console.log('reset undefined');
    }
  }
}

const gen = f();
gen.next();
gen.next();
gen.next(100)
```
![gen](https://raw.githubusercontent.com/GoFzy/pic-bed/master/gen.png)  
上面代码先定义了一个可以无限运行的 `Generator` 函数 `f`，如果 `next` 方法没有参数，每次运行到 `yield` 表达式，变量 `reset` 的值总是 `undefined`。当 `next` 方法带一个参数100时，变量 `reset` 就被重置为这个参数（即100）  
这个功能有很重要的语法意义。`Generator` 函数从暂停状态到恢复运行，它的上下文状态（`context`）是不变的。通过next方法的参数，就有办法在 `Generator` 函数开始运行之后，继续向函数体内部注入值。也就是说，可以在 `Generator` 函数运行的不同阶段，从外部向内部注入不同的值，从而调整函数行为

## Generator异步应用
这里需要结合`Promise`对象来执行，首先把 `fs` 模块的 `readFile` 方法包装成一个`Promise`对象
```js
var fs = require('fs');

function readFile(filepath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filepath, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    })
};

var gen = function* () {
    var f1 = yield readFile('./data/a.txt');
    var f2 = yield readFile('./data/b.txt');
    var f3 = yield readFile('./data/c.txt');
    console.log(f1.toString());
    console.log(f2.toString());
    console.log(f3.toString());
};
```
然后我们先手动执行上述代码，需要注意的是每次 `yield` 返回的是一个 `Promise` 对象：
```js
var g = gen();
g.next().value.then(function(data) {
  g.next(data).value.then(function(data)) {
    ...
  }
})
```
手动执行其实就是用 `then` 方法层层添加回调函数。理解了这一点，就可以写出一个自动的执行器：
```js
function run(gen){
  const g = gen();
  
  function next(data){
    const result = g.next(data);
    if(result.done) return result.value;
    result.value.then(function(data){
      next(data);
    })
  }
  next();
}
run(gen);
```
而 `co` 模块就是上面自动执行器的扩展，用于 `Generator` 函数的自动执行：
```js
var fs = require('fs');
var co = require('co');

function readFile(filepath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filepath, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    })
};

var gen = function* () {
    var f1 = yield readFile('./data/a.txt');
    var f2 = yield readFile('./data/b.txt');
    var f3 = yield readFile('./data/c.txt');
    console.log([f1,f2,f3]);
};
co(gen);
```
![coGen](https://raw.githubusercontent.com/GoFzy/pic-bed/master/coGen.png)  
个人小结：  
* `generator` 函数通过 `yield` 将 `promise` 对象通过属性 `value` 返回到函数外部
* 函数外部通过 `promise` 对象 `then` 方法拿到异步处理结果
* 通过 `generator next` 方法将异步处理结果作为上一个 `yield` 表达式的返回值，传回给函数内部，并继续向下执行