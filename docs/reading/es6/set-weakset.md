# Set 与 WeakSet数据结构

## Set
### 基本概念
`ES6` 提供了新的数据结构 `Set`。它类似于数组，但是成员的值都是唯一的，**没有重复的值**。而`Set`本身是一个构造函数，用来生成 `Set` 数据结构
```js
const s = new Set();

[2, 3, 5, 4, 5, 2, 2].forEach(x => s.add(x));

for (let i of s) {
  console.log(i);
}
// 2 3 5 4
```
上述代码通过 `add()` 方法向 `Set` 结构加入成员，结果表明 `Set` 结构不会添加重复的值  
此外，`Set` 函数可以接受一个数组（或者具有 `iterable` 接口的其他数据结构）作为参数，用来初始化  
```js
const set = new Set([1,2,3,4,4]);
console.log(...set)              // 1 2 3 4
console.log(set.size)            // 4
console.log(set.length)          // undefined
```
上述代码中可以看出 `Set` 函数可以直接接受一个数组作为输入参数，同时使用 `size` 属性来计算长度  

### Set应用
这里介绍下 `Set` 在数组和字符串中的去重
```js
// 去除数组的重复成员
[...new Set(array)]

[...new Set('ababbc')].join('')
```
向 `Set` 加入值的时候，不会发生类型转换，所以 `5` 和 `"5"` 是两个不同的值。`Set` 内部判断两个值是否不同，使用的算法叫做`Same-value-zero equality`，它类似于精确相等运算符（`===`），主要的区别是向 `Set` 加入值时认为 `NaN`等于**自身**，而精确相等运算符认为 `NaN` 不等于自身:
```js
let set = new Set();
let a = NaN;
let b = NaN;
set.add(a);
set.add(b);
set // Set {NaN}
```

### Set实例的属性和方法
`Set` 结构的实例有以下属性：
* `Set.prototype.constructor`：构造函数，默认就是 `Set` 函数
* `Set.prototype.size`：返回 `Set` 实例的成员总数

`Set` 实例的方法分为两大类：**操作方法**(用于操作数据)以及**遍历方法**(用于遍历成员)  

这里先介绍四个操作方法：
* `Set.prototype.add(value)`：添加某个值，返回 `Set` 结构本身
* `Set.prototype.delete(value)`：删除某个值，返回一个布尔值，表示删除是否成功
* `Set.prototype.has(value)`：返回一个布尔值，表示该值是否为 `Set` 的成员
* `Set.prototype.clear()`：清除所有成员，没有返回值

然后是四个遍历操作，可以用于遍历成员:
* `Set.prototype.keys()`：返回键名的遍历器
* `Set.prototype.values()`：返回键值的遍历器
* `Set.prototype.entries()`：返回键值对的遍历器
* `Set.prototype.forEach()`：使用回调函数遍历每个成员

需要特别指出的是，`Set`的**遍历顺序就是插入顺序**。这个特性可用来保存一个回调函数列表，调用时就能保证按照添加顺序调用  
（1） `keys()`，`values()`，`entries()`  
`keys`方法、`values`方法、`entries` 方法返回的都是遍历器对象。而由于 `Set` 结构没有键名，只有键值（或者说键名和键值是同一个值），所以 `keys` 方法和 `values` 方法的行为完全一致:
```js
let set = new Set(['red', 'green', 'blue']);

for (let item of set.keys()) {
  console.log(item);
}
// red
// green
// blue

for (let item of set.values()) {
  console.log(item);
}
// red
// green
// blue

for (let item of set.entries()) {
  console.log(item);
}
// ["red", "red"]
// ["green", "green"]
// ["blue", "blue"]
```
上面代码中，`entries` 方法返回的**遍历器**，同时包括**键名**和**键值**，所以每次输出一个数组，它的两个成员完全相等  
（2）`forEach()`
`Set` 结构的实例与数组一样，也拥有 `forEach` 方法，用于对每个成员执行某种操作，没有返回值:
```js
let set = new Set([1, 4, 9]);
set.forEach((value, key) => console.log(key + ' : ' + value))
// 1 : 1
// 4 : 4
// 9 : 9
```
上面代码说明，`forEach` 方法的参数就是一个处理函数。该函数的参数与数组的 `forEach` 一致，依次为键值、键名。这里需要注意，`Set` 结构的**键名就是键值**（两者是同一个值），因此第一个参数与第二个参数的值永远都是一样的

## WeakSet
`WeakSet` 结构与 `Set` 类似，也是不重复的值的集合。但是，它与 `Set` 有两个区别:
* `WeakSet` 的成员只能是对象，而不能是其他类型的值
* `WeakSet` 中的对象都是**弱引用**，即垃圾回收机制不考虑 `WeakSet` 对该对象的引用

先说前者:
```js
const ws = new WeakSet();
ws.add(1)
// TypeError: Invalid value used in weak set
ws.add(Symbol())
// TypeError: invalid value used in weak set
```
上面代码试图向 `WeakSet` 添加一个数值和 `Symbol` 值，结果报错，因为 `WeakSet` 只能放置对象  

关于第二点，`WeakSet` 中的对象都是弱引用，即**垃圾回收**机制不考虑 `WeakSet` 对该对象的引用，也就是说，如果其他对象都不再引用该对象，那么垃圾回收机制会自动回收该对象所占用的内存，不考虑该对象还存在于 `WeakSet` 之中  
由于上面这个特点，`WeakSet` 的成员是不适合引用的，因为它会随时消失。另外，由于 `WeakSet` 内部有多少个成员，取决于垃圾回收机制有没有运行，运行前后很可能成员个数是不一样的，而垃圾回收机制何时运行是不可预测的，因此 `ES6` 规定 `WeakSet` **不可遍历**

### WeakSet基本语法
`WeakSet` 是一个构造函数，可以使用 `new` 命令，创建 `WeakSet` 数据结构  
```js
const ws = new WeakSet();
```
作为构造函数，`WeakSet` 可以接受一个数组或类似数组的对象作为参数。（实际上，任何具有 `Iterable` 接口的对象，都可以作为 `WeakSet` 的参数。）该数组的所有成员，都会自动成为 `WeakSet` 实例对象的成员
```js
const a = [[1, 2], [3, 4]];
const ws = new WeakSet(a);
// WeakSet {[1, 2], [3, 4]}
```
上面代码中，`a` 是一个数组，它有两个成员，也都是数组。将 `a` 作为 `WeakSet` 构造函数的参数，`a` 的成员会自动成为 `WeakSet` 的成员
注意，是 `a` 数组的成员成为 `WeakSet` 的成员，而不是 `a` 数组本身。这意味着，**数组的成员只能是对象**，如果是其他基本数据类型则会报错，比如：
```js
const b = [3, 4];
const ws = new WeakSet(b);
// Uncaught TypeError: Invalid value used in weak set(…)
```

### WeakSet方法
`WeakSet` 结构有以下三个方法:
* `WeakSet.prototype.add(value)`：向 `WeakSet` 实例添加一个新成员
* `WeakSet.prototype.delete(value)`：清除 `WeakSet` 实例的指定成员
* `WeakSet.prototype.has(value)`：返回一个布尔值，表示某个值是否在 `WeakSet` 实例之中

以下是一些使用的注意点:
`WeakSet` 没有 `size` 属性，没有办法遍历它的成员
```js
ws.size // undefined
ws.forEach // undefined

ws.forEach(function(item){ console.log('WeakSet has ' + item)})
// TypeError: undefined is not a function
```
`WeakSet` 不能遍历，是因为成员都是弱引用，随时可能消失，遍历机制无法保证成员的存在，很可能刚刚遍历结束，成员就取不到了。不过我们可以用来储存 `DOM` 节点，此时就不需要担心这些节点从文档移除的情况  
## 小结
* 对于 `Set` 可以想象成一个**键**和**值**完全相等的特殊对象，由于对象上的属性是独一无二的，所以 `Set` 内部的成员亦是独一无二的
* 对于 `WeakSet` 是成员只能为对象的特殊 `Set`，同时由于 `WeakSet` 中对象都是弱引用，因此在垃圾回收时很可能消失，因此 `WeakSet` 是不可以遍历的