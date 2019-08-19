# JavaScript中的原型编程
## 一、`this`
### `this`的指向：
具体的使用中，`this` 的指向大致可以分为一下四种：  
* 作为对象调用  
* 作为普通函数调用  
* 构造器调用  
* `Function.prototype.call` 和 `Function.prototype.apply` 调用  

对于前两种，我们通过以下小例子进行说明：
```javascript
var obj = {
  myName: 'Hello',
  getName: function(){
    return this.myName;
  }
}
console.log(obj.getName()); //Hello
var getName2 = obj.getName; 
console.log(getName2()); //undefined
```
当调用 `obj.getName` 时，`getName` 方法是作为 `obj` 对象的属性被调用，故此时的 `this` 指向 `obj` 对象。而 `getName2` 变量来引用 `obj.getName` 时，此时是作为普通函数被调用，因此 `this` 是指向全局 `window` 的  

对于第三种，通常情况下构造器里的 `this` 指向返回的这个实例对象，但如果构造器显示的返回了一个 `object` 类型的对象，那么返回结果就不再是 `this` 了。
```javascript
var MyClass = function() {
  this.name = 'foo';
}
var obj = new MyClass();
console.log(obj.name);  //foo

var MyClass2 = function() {
  this.name = 'bar';
  return {
    name: 'hello world'
  }
}
var obj2 = new MyClass();
console.log(obj2.name);   //hello world
```
最后一种情况放入下一小节中讲解。

## 二、`call`和`apply`
`Funtion.prototype` 和 `Function.prototype.call` 都可以动态地改变传入函数的 `this`

### 两者的区别：
`apply` 接受两个参数，第一个参数指定了函数体内的 `this` 对象的指向，第二个参数作为一个带下标的集合，可以是数组亦可以是类数组，`apply` 方法将这个集合里的元素作为参数传入被调用的函数当中：
```javascript
var func = function(a,b,c){
  console.log([a,b,c]);
}
func.apply(null,[1,2,3]);
```
而 `call` 传入的参数数量不固定，跟 `apply` 保持一致的是，第一个参数也是代表函数体内 `this` 的指向，而函数的参数则是需要一个个传入，此外 `call` 可以在第一个参数中传入伪数组 `arguments` ，但 `apply` 不可以：
```javascript
var func = function(a,b,c){
  console.log([a,b,c]);
}
func.call(null,1,2,3);
```
当使用 `apply` 和 `call` 的时候，如果我们第一个参数传入的是 `null`，函数体内的 `this` 会指向默认的宿主对象，在浏览器中则是 `window`，但是在严格模式中，函数体内的 `this` 还是为 `null`

### `call`和`apply`的用途：
**改变 `this` 的指向**  
这里有一个案例，`document.getElementById` 这个方法的名字实在是过长，这里使用 `getId` 函数进行替换:
```javascript
var getId = function(id) {
    return document.getElementById(id);
}
getId('div')
//我们也许尝试过更简单的方法
var getId = document.getElementById;
getId('div');
```
执行下代码发现，在 `chrome、火狐、IE10` 中都会抛出异常，这是因为许多引擎的 `document.getElementById` 方法内部实现中都使用到了 `this`。而后一种方法中 `getId` 是当作普通函数进行调用的，因此此时的 `this` 不再是 `document`，而是 `window` ，解决办法可以使用 `apply\call`:
```javascript
document.getElementById = (function(func) {
  return function() {
    func.apply(document, arguments);
  }
})(document.getElementById)

var getId = document.getElementById;
var div = getId( 'div1' );
```
**`Function.prototype.bind`**  
大部分浏览器都支持该方法该指定函数内部的 `this` 指向，我们来模拟一下：
```javascript
Function.prototype.bind = function(context) {
  var self = this;//保存原函数
  return function() {
    return self.apply(context,arguments);//执行新函数时，会把之前传入的context当作新函数体内的this
  }
}
var obj = {
  name: 'hello',
}
var func = function() {
  console.log(this.name);
}.bind(obj);
func();
```
在 `Function.prototype.bind` 函数内部，我们先把 `func` 函数的引用保存起来，然后返回一个新的函数。而在我们执行 `fun` 函数时，实际上先执行的时这个刚刚返回的新函数，`self.apply(...)` 才是执行原来的 `fun` 函数，同时通过函数**闭包**修改函数内的 `this` 指向   
上面是一个简化版 `Function.prototype.bind` 实现，通常我们还会把它实现得更复杂一点，使得可以往 `fun` 函数中预先添加一些参数：
```javascript
Function.prototype.bind = function() {
  var self = this;                        //保存原函数
  var context = [].shift.call(arguments); //需要绑定的this上下文
  var arg = [].slice.call(arguments);     //将剩余参数转为数组
  return function() {
    self.apply(context,[].concat.call(arg,[].slice.call(arguments))); //将初始参数和新传入参数拼接起来
  }
}
var obj = {
  name: 'hello',
}
var func = function(a,b,c,d) {
  console.log(this.name);
  console.log([a,b,c,d]);
}.bind(obj,1,2);
func(3,4);
```
**借用其他对象的方法**  
借用方法的第一种场景就是**借用构造函数**，通过该技术，我们可以实现一种类似继承的效果:
```javascript
var A = function(name){
    this.name = name;
};
var B = function(){
    A.apply(this,arguments);
}
B.prototype.getName = function(){
    console.log(this.name);
}
var b = new B('feng');
b.getName();
```
借用方法的第二种场景，函数的参数列表 `arguments` 是一个类数组对象，虽然它也有下标，但它并非真正的数组，故无法像数组一样，进行排序、插入等操作。这种情况下，我们常常会借用 `Array.prototype` 对象上的方法，比如：
```javascript
(function(){
	Array.ptototype.push.apply(arguments,3);
    console.log(arguments);
}(1,2))
```
