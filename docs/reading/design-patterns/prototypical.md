# JavaScript中的原型编程
## 一、背景知识
### 1.1 原型编程的基本规则：
* 所有数据都是对象
* 要得到一个对象，不是通过实例化类，而是找到一个对象作为原型并克隆它
* 对象会记住它的原型
* 如果对象无法响应某个请求，它会把这个请求委托给自己的原型

### 1.2 所有数据都是对象    
&emsp;&emsp;JavaScript中**绝大部分数据**都是对象，而其中**根对象**是Object.prototype对象--一个空对象。事实上，我们在JS中遇到的每个对象都是从根对象克隆而来，即Object.prototype对象就是它们的原型，例如：
```javascript
        var obj1 = new Object();
        var obj2 = {};
        //可以利用ES5提供的Object.getPrototypeOf来查看对象的原型
        console.log(Object.getPrototypeOf(obj1) === Object.prototype);//true
        console.log(Object.getPrototypeOf(obj2) === Object.prototype);//true
```

### 1.3 得到一个对象，不是通过实例化类，而是找到一个对象作为原型并克隆它   
&emsp;&emsp;&emsp;&emsp;JavaScript中我们不需要关心克隆的细节，这些都是引擎内部负责实现，我们只需要显示的调用`var obj1 = new Object()`或者`var obj2 = {}`。此时，引擎内部会从Object.prototype上克隆一个对象出来，这也就是我们得到的`obj1 or obj2`。
&emsp;&emsp;&emsp;&emsp;再来看看通过`new`运算符从**构造器**中得到一个对象：

```javascript
        function Person(name) {
            this.name = name;
        }
        Person.prototype.getName = function() {
            return this.name;
        }
        var a = new Person('feng');
        console.log(a.name);
        console.log(a.getName());
        console.log(Object.getPrototypeOf(a) === Person.prototype);
```
&emsp;&emsp;&emsp;&emsp;这里Person并不是类，而是函数构造器，JS函数首字母大写是就是作为构造器被调用。此外，在Chrome和Firefox浏览器中向外暴露了对象`__proto__`属性，我们可以通过下面的代码来理解new运算的过程：
```javascript
        function Person(name) {
            this.name = name;
        }
        Person.prototype.getName = function() {
            return this.name;
        }
        var objectFactory = function() {
            var obj = new Object();//从Obejct.prototype上克隆一个空对象
            Constructor = [].shift.call(arguments);//取得外部传入的构造器，此例是Person
            obj.__proto__ = Constructor.prototype;//只像正确的原型
            var ret = Constructor.apply(obj, arguments);//借用外部传入的构造器给obj设置属性

            return typeof ret === 'Object'?ret : obj;
        };

        var a = objectFactory( Person, 'feng')

        console.log(a.name);
        console.log(a.getName());
        console.log(Object.getPrototypeOf(a) === Person.prototype);
```
&emsp;&emsp;&emsp;&emsp;我们看到，分别调用下面的代码，能产生一样的结果：
```javascript
        var a = objectFactory(A, 'feng');
        var a = new A('feng');
```
### 1.4 对象会记住它的原型  
&emsp;&emsp;&emsp;&emsp;就JS真正实现而言，其实并不能说对象有原型，只能说**对象的构造器有原型**--对象把请求委托给它构造器的原型。那么对象是如何转交的呢？
&emsp;&emsp;&emsp;&emsp;JS给对象提供了一个名为`__proto__`的隐藏属性，某个对象的`__proto__`属性默认会指向它构造器的原型对象，即`{Constructot}.prototype`，上一小节中我们就是通过修改`__proto__`指向来模拟new 创建对象的。

### 1.5 如果对象无法响应某个请求，它会把这个请求委托给自己的原型  
&emsp;&emsp;&emsp;&emsp;在JS中对象最初都是由Object.prototype对象克隆而来，但对象构造器的原型可以动态指向其他对象，即当对象a需要借用对象b的能力时，可以有选择性的把a对象的构造器原型指向b对象，从而达到继承的效果：
```javascript
		var obj = {name: 'feng'};
		var A = function(){};
		A.prototype = obj;
		
		var a = new A();
		console.log(a.name);
```
&emsp;&emsp;&emsp;&emsp;我们来看看上述代码执行时，引擎做了哪些事情：  
&emsp;&emsp;&emsp;&emsp;①首先尝试遍历对象a中的所有属性，发现没有name  
&emsp;&emsp;&emsp;&emsp;②查找name属性的这个请求被委托给对象a的构造器原型，而它被`a.__proto__`记录并指
&emsp;&emsp;&emsp;&emsp;向`A.prototype`，而`A.prototype`被设置为对象obj  
&emsp;&emsp;&emsp;&emsp;③在对象obj中找到了name属性并返回


## 二、总结
&emsp;&emsp;本节讲述了本书第一个设计模式--原型模式，同时它也是一种编程泛型，构成了JavaScript这门语言的根本。

