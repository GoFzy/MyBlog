# Map 与 WeakMap数据结构
## Map
### 基本概念
`JavaScript` 的对象（`Object`），本质上是键值对的集合（`Hash` 结构），但是传统上只能用字符串当作键。这给它的使用带来了很大的限制，而 `Map` 数据结构的出现就是为了解决这一个限制  
`Map` 它类似于对象，也是**键值对**的集合，但是**键的范围不限于字符串**，各种类型的值（包括对象）都可以当作键。也就是说，`Object` 结构提供了**字符串—值**的对应，`Map` 结构提供了**值—值**的对应，是一种更完善的 `Hash` 结构实现  

### 简单使用
```js
const map = new Map();
const obj = {f: 'this is Map'};

map.set(obj, 'content');
map.get(obj);           // 'content'

map.has(obj);           // true
map.delete(obj);        // true;
map.has(obj);           // false
```
上面代码使用 `Map` 结构的 `set` 方法，将对象 `obj` 当作m的一个键，然后又使用 `get` 方法读取这个键，接着使用 `delete` 方法删除了这个键  
除了像上述方法中使用 `set` 添加成员以外， `Map` 还可以作为构造函数，接受一个数组作为参数，该数组的成员就是一个个表示键值的数据(可以简单理解为该数组的成员是一个长度为2的数组)
```js
const map = new Map([
  ['name', '张三'],
  ['title', 'Author']
]);

map.size // 2
map.has('name') // true
map.get('name') // "张三"
map.has('title') // true
map.get('title') // "Author"
```
`Map` 构造函数接受数组作为参数，实际上执行的是下面的算法:
```js
const items = [
  ['name', '张三'],
  ['title', 'Author']
];

const map = new Map();

items.forEach(
  ([key, value]) => map.set(key, value)
);
```
事实上，不仅仅是数组，任何具有 `Iterator` 接口、且每个成员都是一个双元素的数组的数据结构都可以当作 `Map` 构造函数的参数。这就是说，`Set` 和 `Map` 都可以用来生成新的 `Map`  
除此以外，还有一些特殊情况的处理：
* 如果对同一个键多次赋值，后面的值将覆盖前面的值
* 如果读取一个未知的键，则返回 `undefined`
* 只有对同一个对象的引用，`Map` 结构才将其视为同一个键。也就是说 `Map` 的键实际上是跟内存地址绑定的，只要内存地址不一样，就视为两个键
对于最后一点，这里特别说明一下
```js
const map = new Map();

map.set(['a'], 555);
map.get(['a']) // undefined

const k1 = ['a'];
const k2 = ['a'];

// 两个实例被视为两个键
map
.set(k1, 111)
.set(k2, 222);

map.get(k1) // 111
map.get(k2) // 222
```

### 实例的属性和操作方法
`Map` 结构的实例有以下属性和操作方法:
* `size` 属性，返回成员总数
* `Map.prototype.set(key, value)` 用于添加成员，相同键则会覆盖，由于 `set` 方法返回的是当前 `Map` 对象，所以支持链式写法
* `Map.prototype.get(key)` 读取 `key` 对应的键值，如果找不到 `key`，返回 `undefined`
* `Map.prototype.has(key)` 返回一个布尔值，表示某个键是否在当前 `Map` 对象之中
* `Map.prototype.delete(key)` 删除某个键，成功返回 `true`，失败返回  `false`
* `Map.prototype.clear()` 清除所有成员

### 遍历方法
`Map` 结构原生提供三个遍历器生成函数和一个遍历方法，需要特别注意的是，遍历顺序就是插入顺序
* `Map.prototype.keys()`：返回键名的遍历器
* `Map.prototype.values()`：返回键值的遍历器
* `Map.prototype.entries()`：返回所有成员的遍历器
* `Map.prototype.forEach()`：遍历 Map 的所有成员
```js
const map = new Map([
  ['F', 'no'],
  ['T',  'yes'],
]);

for (let key of map.keys()) {
  console.log(key);
}
// "F"
// "T"

for (let value of map.values()) {
  console.log(value);
}
// "no"
// "yes"

for (let item of map.entries()) {
  console.log(item[0], item[1]);
}
// "F" "no"
// "T" "yes"

// 或者
for (let [key, value] of map.entries()) {
  console.log(key, value);
}
// "F" "no"
// "T" "yes"

// 等同于使用map.entries()
for (let [key, value] of map) {
  console.log(key, value);
}
// "F" "no"
// "T" "yes"

map.forEach((value,key,map) => {
  console.log(key,value);
})
// "F" "no"
// "T" "yes"
```

### 与其他数据结构的转换
**`Map`** 转为数组: 扩展运算符（`...`）
```js
const myMap = new Map()
  .set(true, 7)
  .set({foo: 3}, ['abc']);

console.log([...myMap])   // [ [ true, 7 ], [ { foo: 3 }, [ 'abc' ] ] ]
```
**`Map` 转为对象**
```js
function strMapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k,v] of strMap) {
    obj[k] = v;
  }
  return obj;
}

const myMap = new Map()
  .set('yes', true)
  .set('no', false);
console.log(strMapToObj(myMap)) // { yes: true, no: false }
```

**`Map` 转为`JSON`**  
此时要区分两种情况。一种情况是，`Map` 的键名都是字符串，这时可以选择转为对象 `JSON`
```js
function strMapToJson(strMap) {
  return JSON.stringify(strMapToObj(strMap));
}

let myMap = new Map().set('yes', true).set('no', false);
console.log(strMapToJson(myMap))    // '{"yes":true,"no":false}'
```
另一种情况是，`Map` 的键名有非字符串，这时可以选择转为数组 `JSON`
```js
function mapToArrayJson(map) {
  return JSON.stringify([...map]);
}

let myMap = new Map().set(true, 7).set({foo: 3}, ['abc']);
console.log(mapToArrayJson(myMap))  // '[[true,7],[{"foo":3},["abc"]]]'
```

## WeakMap
### 基本概念
`WeakMap` 结构与 `Map` 结构类似，也是用于生成键值对的集合，但两者存在两点区别:
* `WeakMap` 只接受对象作为键名，不接受其他类型的值作为键名
* `WeakMap` 的键名所指向的对象，属于弱引用，不计入垃圾回收机制
总之，`WeakMap` 的专用场合就是，它的键所对应的对象，可能会在将来消失。`WeakMap` 结构有助于防止内存泄漏。**注意**，`WeakMap` 弱引用的只是键名，而不是键值。键值依然是正常引用
```js
const wm = new WeakMap();
let key = {};
let obj = {foo: 1};

wm.set(key, obj);
obj = null;
wm.get(key)
// Object {foo: 1}
```
上面代码中，键值 `obj` 是正常引用。所以，即使在 `WeakMap` 外部消除了 `obj` 的引用，`WeakMap` 内部的引用依然存在

### 实例的属性和操作方法
`WeakMap` 与 `Map` 在 `API` 上的区别主要是两个
* 没有遍历操作（即没有 `keys()`、`values()` 和 `entries()` 方法）和 `size` 属性
* 无法清空，即不支持 `clear` 方法。因此，`WeakMap` 只有四个方法可用：`get()`、`set()`、`has()`、`delete()`

对于第一点是因为没有办法列出所有键名，某个键名是否存在完全不可预测，跟垃圾回收机制是否运行相关。这一刻可以取到键名，下一刻垃圾回收机制突然运行了，这个键名就没了，为了防止出现不确定性，就统一规定不能取到键名