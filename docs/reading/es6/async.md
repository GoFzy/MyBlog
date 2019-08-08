# async函数
`ES2017` 标准引入了 `async` 函数，使得异步操作变得更加方便。`async` 函数是什么？一句话，它就是 `Generator` 函数的语法糖。
定义一个 `Generator` 函数，依次读取两个文件
```js
const co = require('co');
const fs = require('fs');

const readFile = function (fileName) {
  return new Promise(function (resolve, reject) {
    fs.readFile(fileName, function(error, data) {
      if (error) return reject(error);
      resolve(data);
    });
  });
};

const gen = function* () {
  const f1 = yield readFile('/etc/fstab');
  const f2 = yield readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};

co(gen);
```
上面代码的函数 `gen` 可以写成 `async` 函数，就是下面这样
```js
const asyncReadFile = async function () {
  const f1 = await readFile('/etc/fstab');
  const f2 = await readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};
```
一比较就会发现，`async` 函数就是将 `Generator` 函数的星号（`*`）替换成 `async` ，将 `yield` 替换成 `await`，仅此而已，但起到了很好的效果，例如:
```js
async function demo() {
  const f = await 1;
  const z = await 2;
  console.log(f, z);
}

demo();
```
![demo](https://raw.githubusercontent.com/GoFzy/pic-bed/master/demo.png)  
也就是说 `async` 函数直接就自动执行其内部的 `Generator` 函数，这就不需要我们再使用额外的 `co` 模块了。  
关于 `async` 函数对 `Generator` 函数的改进，这里小结为以下四点：
* **内置执行器**： `Generator` 函数的执行必须靠执行器，所以才有了 `co`模块，而 `async` 函数自带执行器。也就是说， `async` 函数的执行，与普通函数一模一样，只要一行
* **更好的语义**： `async` 和 `await` ，比起星号和 `yield` ，语义更清楚了。 `async` 表示函数里有异步操作， `await` 表示紧跟在后面的表达式需要等待结果。

* **更广的适用性**： `co` 模块约定， `yield` 命令后面只能是 `Thunk` 函数或 `Promise` 对象， 而 `async` 函数的 `await` 命令后面，可以是 `Promise` 对象和原始类型的值（数值、字符串和布尔值，但这时会自动转成立即 `resolved` 的 `Promise` 对象）
* **返回值是 ``Promise``**： `async` 函数的返回值是 `Promise` 对象，这比 `Generator` 函数的返回值是 `Iterator` 对象方便多了。你可以用 `then` 方法指定下一步的操作。

进一步说， `async` 函数完全可以看作多个异步操作，包装成的一个 `Promise` 对象，而 `await` 命令就是内部 `then` 命令的语法糖

## async函数返回Promise对象
`async` 函数返回一个 `Promise` 对象，可以使用 `then` 方法添加回调函数
```js
//50ms后输出hello world
async function timeout(ms) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function asyncPrint(value, ms) {
  await timeout(ms);
  console.log(value);
}

asyncPrint('hello world', 50);
```
`async` 函数内部抛出错误，会导致返回的 `Promise` 对象变为 `reject` 状态。抛出的错误对象会被 `catch` 方法回调函数接收到
```js
async function f() {
  throw new Error('出错了');
}

f().then(
  v => console.log(v),
  e => console.log(e)
)
// Error: 出错了
```
此外， `async` 函数返回的 `Promise` 对象，必须等到内部所有 `await` 命令后面的 `Promise` 对象执行完，才会发生状态改变，除非遇到 `return` 语句或者抛出错误。也就是说，只有 `async` 函数内部的异步操作执行完，才会执行 `then` 方法指定的回调函数

## await命令
正常情况下，`await` 命令后面是一个 `Promise` 对象，返回该对象的结果。如果不是 `Promise` 对象，就直接返回对应的值
```js
async function f() {
  // 等同于
  // return 123;
  return await 123;
}

f().then(v => console.log(v))
// 123
```
`await` 命令后面的 `Promise` 对象如果变为 `reject` 状态，则 `reject` 的参数会被 `catch` 方法的回调函数接收到
```js
async function f() {
  await Promise.reject('出错了');
}

f()
.then(v => console.log(v))
.catch(e => console.log(e))
// 出错了
```
需要注意的是，任何一个 `await` 语句后面的 `Promise` 对象变为 `reject` 状态，那么整个 `async` 函数都会中断执行，即
```js
async function f() {
  await Promise.reject('出错了');
  await Promise.resolve('hello world'); // 不会执行
}
```
有时，我们希望即使前一个异步操作失败，也不要中断后面的异步操作。这时可以将第一个 `await` 放在 `try...catch` 结构里面，这样不管这个异步操作是否成功，第二个 `await` 都会执行:
```js
async function f() {
  try {
    await Promise.reject('出错了');
  } catch(e) {
  }
  return await Promise.resolve('hello world');
}

f()
.then(v => console.log(v))
// hello world
```
另一种方法是 `await` 后面的 `Promise` 对象再跟一个 `catch` 方法，处理前面可能出现的错误
```js
async function f() {
  await Promise.reject('出错了')
    .catch(e => console.log(e));
  return await Promise.resolve('hello world');
}

f()
.then(v => console.log(v))
// 出错了
// hello world
```

## 使用注意点
**第一点**，前面已经说过， `await` 命令后面的 `Promise` 对象，运行结果可能是 `rejected`，所以最好 `把await` 命令放在 `try...catch` 代码块中
```js
async function myFunction() {
  try {
    await somethingThatReturnsAPromise();
  } catch (err) {
    console.log(err);
  }
}

// 另一种写法
async function myFunction() {
  await somethingThatReturnsAPromise()
  .catch(function (err) {
    console.log(err);
  });
}
```
**第二点**，多个 `await` 命令后面的异步操作，如果不存在继发关系，最好让它们同时触发
```js
let foo = await getFoo();
let bar = await getBar();
```
上面代码中， `getFoo` 和 `getBar` 是两个独立的异步操作（即互不依赖），被写成继发关系。这样比较耗时，因为只有 `getFoo` 完成以后，才会执行 `getBar` ，完全可以让它们同时触发
```js
// 写法一
let [foo, bar] = await Promise.all([getFoo(), getBar()]);

// 写法二
let fooPromise = getFoo();
let barPromise = getBar();
let foo = await fooPromise;
let bar = await barPromise;
```
**第三点**，`await` 命令只能用在 `async` 函数之中，如果用在普通函数，就会报错  
**第四点**，`async` 函数可以保留运行堆栈
```js
const a = () => {
  b().then(() => c());
};
```
上面代码中，函数 `a` 内部运行了一个异步任务 `b()`。当 `b()` 运行的时候，函数 `a()` 不会中断，而是继续执行。等到 `b()` 运行结束，可能 `a()` 早就运行结束了， `b()` 所在的上下文环境已经消失了。如果 `b()` 或 `c()` 报错，错误堆栈将不包括 `a()` 
现在将这个例子改成 `async` 函数
```js
const a = async () => {
  await b();
  c();
};
```
上面代码中， `b()` 运行的时候， `a()` 是暂停执行，上下文环境都保存着。一旦 `b()` 或 `c()` 报错，错误堆栈将包括 `a()`