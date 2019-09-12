# 发布-订阅模式
## 一、定义
发布-订阅模式又称观察者模式，它定义**对象间的一对多**的依赖关系，当一个对象的状态发生改变时，所有依赖它的对象都将得到通知。在 `JS` 开发中，我们一般用**事件模型**来替代传统的发布-订阅模式

## 二、发布-订阅模式购房案例
比如我们在现实生活中购房时，一般会将手机号留在售楼处。而当有新楼盘推出时，销售人员就会翻开电话簿，遍历上面的电话号码并依次发送短息通知  
上述例子就是一个典型的发布-订阅模式，其中售楼处为**发布者**，购房者为**订阅者**，而该模式的优势在于:
* 购房者不用再天天给售楼处打电话咨询开售时间，在合适的时间点，售楼处作为发布者会通知这些消息订阅者
* 购房者和售楼处之间不再强耦合在一起，当有新的购房者出现时，他只需把手机号码留在售楼处，售楼处不关心购房者的任何情况。 而售楼处的任何变动也不会影响购买者

第一点说明发布—订阅模式可以广泛应用于**异步编程**中，这是一种替代传递回调函数的方案。比如，我们可以订阅 `ajax` 请求的 `error、succ` 等事件。在异步编程中使用发布—订阅模式，我们就无需过多关注对象在异步运行期间的内部状态，而只需要订阅感兴趣的事件发生点  
第二点说明发布—订阅模式可以取代对象之间硬编码的通知机制，一个对象不用再显式地调用另外一个对象的某个接口。发布—订阅模式让两个对象**松耦合**地联系在一起，虽然不太清楚彼此的细节，但这不影响它们之间相互通信。当有新的订阅者出现时，发布者的代码不需要任何修改；同样发布者需要改变时，也不会影响到之前的订阅者。只要之前约定的事件名没有变化，就可以自由地改变它们

### 简单实现
现在看看如何一步步实现发布—订阅模式：
* 首先要指定好谁充当发布者（比如售楼处）
* 然后给发布者添加一个缓存列表，用于存放回调函数以便通知订阅者（售楼处的花名册）
* 最后发布消息的时候，发布者会遍历这个缓存列表，依次触发里面存放的订阅者回调函数（遍历花名册，挨个发短信）  

另外，我们还可以往回调函数里填入一些参数，订阅者可以接收这些参数。这是很有必要的，比如售楼处可以在发给订阅者的短信里加上房子的单价、面积、容积率等信息，订阅者接收到这些信息之后可以进行各自的处理：
```js
const salesOffices = {};             // 定义售楼处

salesOffices.clientList = [];        // 缓存列表，存放订阅者的回调函数

salesOffices.listen = function(fn) { // 增加订阅者
  this.clientList.push(fn);
}

salesOffices.trigger = function() {  // 发布消息
  for(let fn of this.clientList) {
    fn.apply(this, arguments);
  }
}

salesOffices.listen((price, size) => {
  console.log('f订阅-价格:', price);
  console.log('f订阅-面积:', size);
})

salesOffices.listen((price, size) => {
  console.log('z订阅-价格:', price);
  console.log('z订阅-面积:', size);
})

salesOffices.trigger( 2000000, 88 );
salesOffices.trigger( 3000000, 110 );
```
至此，我们已经实现了一个最简单的发布—订阅模式，但这里还存在一些问题。我们看到订阅者接收到了发布者发布的每个消息，虽然小明只想买 88 平方米的房子，但是发布者把 110 平方米的信息也推送给了小明，这对小明来说是不必要的困扰。所以我们有必要增加一个标示 `key`，让订阅者只订阅自己感兴趣的消息。改写后的代码如下：
```js
const salesOffices = {};                   // 定义售楼处

salesOffices.clientList = [];              // 缓存列表，存放订阅者的回调函数

salesOffices.listen = function (key, fn) { // 增加订阅者
  if (!this.clientList[key]) {             // 订阅者只订阅自己想要的信息
    this.clientList[key] = [];
  }
  this.clientList[key].push(fn);
}

salesOffices.trigger = function (...args) { // 发布消息
  const key = args.shift();
  const fns = this.clientList[key];
  if (!fns || !fns.length) return false;
  for (let fn of fns) {
    fn.apply(this, args);
  }
}

salesOffices.listen('size88', (price) => {
  console.log('f订阅-价格:', price);
})

salesOffices.listen('size110', (price) => {
  console.log('z订阅-价格:', price);
})

salesOffices.trigger( 'size88', 2000000 ); // 发布 88 平方米房子的价格
salesOffices.trigger( 'size110', 3000000 ); // 发布 110 平方米房子的价格
```

## 三、真实的例子——网站登录
假如我们正在开发一个商城网站，网站里有 `header` 头部、`nav` 导航、消息列表、购物车等模块。这几个模块的渲染有一个共同的前提条件，就是必须先用 `ajax` 异步请求获取用户的登录信息。这是很正常的，比如用户的名字和头像要显示在 `header` 模块里，而这两个字段都来自用户登录后返回的信息  
至于 `ajax` 请求什么时候能成功返回用户信息，这点我们没有办法确定。现在的情节看起来像极了售楼处的例子，小明不知道什么时候开发商的售楼手续能够成功办下来  
异步的问题通常也可以用回调函数来解决。但问题在于，我们不知道除了 `header` 头部、`nav` 导航、消息列表、购物车之外，将来还有哪些模块需要使用这些用户信息。如果使用回调形式，那么它们就会和用户信息模块产生强耦合，比如下面这样的形式：
```js
login.succ(function(data){ 
  header.setAvatar( data.avatar);  // 设置 header 模块的头像
  nav.setAvatar( data.avatar );    // 设置导航模块的头像
  message.refresh();               // 刷新消息列表
  cart.refresh();                  // 刷新购物车列表
});
```
现在登录模块是我们负责编写的，但我们还必须了解 `header` 模块里设置头像的方法叫 `setAvatar`、购物车模块里刷新的方法叫 `refresh`，这种耦合性会使程序变得僵硬，`header` 模块不能随意再改变 `setAvatar` 的方法名，它自身的名字也不能被改为 `header1`、`header2`  
等到有一天，项目中又新增了一个收货地址管理的模块，于是你又得在最后部分加上这行代码：
```js
login.succ(function( data ){ 
  header.setAvatar( data.avatar); 
  nav.setAvatar( data.avatar ); 
  message.refresh(); 
  cart.refresh(); 
  address.refresh(); // 增加这行代码
});
```
而用发布—订阅模式重写之后，对用户信息感兴趣的业务模块将**自行订阅**登录成功的消息事件。当登录成功时，登录模块只需要发布登录成功的消息，而业务方接受到消息之后，就会开始进行各自的业务处理，登录模块并不关心业务方究竟要做什么，也不想去了解它们的内部细节。改善后的代码如下:
```js
$.ajax( 'http:// xxx.com?login', function(data) {  // 登录成功
 login.trigger( 'loginSucc', data);               // 发布登录成功的消息
});
```
各模块监听登录成功的消息：
```js
const header = (function() { // header 模块
    login.listen( 'loginSucc', function( data ) { 
      header.setAvatar( data.avatar ); 
  }); 
  return { 
    setAvatar: function( data ) { 
      console.log( '设置 header 模块的头像' ); 
    } 
  } 
})(); 
const nav = (function() { // nav 模块
    login.listen( 'loginSucc', function( data ) { 
      nav.setAvatar( data.avatar ); 
  }); 
  return { 
    setAvatar: function( avatar ) { 
      console.log( '设置 nav 模块的头像' ); 
    } 
  } 
})();
```
如上所述，我们随时可以把 `setAvatar` 的方法名改成其他名称。如果有一天在登录完成之后，又增加一个刷新收货地址列表的行为，那么只要在收货地址模块里加上监听消息的方法即可，而这可以让开发该模块的同事自己完成，你作为登录模块的开发者，永远不用再关心这些行为了。代码如下：
```js
const address = (function() { // nav 模块
    login.listen( 'loginSucc', function( obj ) { 
    address.refresh( obj ); 
  }); 
 return { 
  refresh: function( avatar ) { 
    console.log( '刷新收货地址列表' ); 
  } 
 } 
})();
```

## 四、全局的发布-订阅对象
回想下刚刚实现的发布—订阅模式，我们给售楼处对象和登录对象都添加了订阅和发布的功能，这里还存在两个小问题:
* 我们给每个发布者对象都添加了 `listen` 和 `trigger` 方法，以及一个缓存列表 `clientList`，这其实是一种资源浪费
* 小明跟售楼处对象还是存在一定的耦合性，小明至少要知道售楼处对象的名字是 `salesOffices`，才能顺利的订阅到事件。见如下代码：
```js
salesOffices.listen( 'squareMeter100', function( price ) { // 小明订阅消息
  console.log( '价格= ' + price ); 
});
```
如果小明还关心 300 平方米的房子，而这套房子的卖家是 `salesOffices2`，这意味着小明要开始订阅 `salesOffices2` 对象。见如下代码：
```js
salesOffices2.listen( 'squareMeter300', function( price ) { // 小明订阅消息
  console.log( '价格= ' + price ); 
});
```
其实在现实中，买房子未必要亲自去售楼处，我们只要把订阅的请求交给**中介公司**，而各大房产公司也只需要通过中介公司来发布房子信息。这样一来，我们不用关心消息是来自哪个房产公司，我们在意的是能否顺利收到消息。当然，为了保证订阅者和发布者能顺利通信，订阅者和发布者都必须知道这个中介公司  
同样在程序中，发布—订阅模式可以用一个全局的 `Event` 对象来实现，订阅者不需要了解消息来自哪个发布者，发布者也不知道消息会推送给哪些订阅者，`Event` 作为一个类似**中介者**的角色，把订阅者和发布者联系起来。见如下代码：
```js
const Event = (function() {
  let clientList = {},
      listen,
      trigger,
      remove;
  listen = function(key, fn) {
    if( !clientList[ key ] ) {
      clientList[ key ] = [];
    }
    clientList[ key ].push( fn );
  };

  trigger = function() {
    let key = [].shift.call( arguments ),
        fns = clientList[ key ];
        if( !fns || !fns.length) {
          return false;
        }
        for(let fn of fns) {
          fn.apply(this, arguments);
        }
  };

  remove = function( key, fn) {
    const fns = clientList[ key ];
    if( !fns ) {
      return false;
    }
    if( !fn ) {
      fns && ( fns.length =0 );
    } else {
      const index = fns.findIndex(item => item === fn);
      ~index && fns.splice(index, 1);
    }
  }

  return {
    listen: listen,
    trigger: trigger,
    remove: remove,
  }
})()

Event.listen( 'squareMeter88', function( price ) { // 小红订阅消息
  console.log( '价格= ' + price );                 // 输出：'价格=2000000' 
}); 
Event.trigger( 'squareMeter88', 2000000 );         // 售楼处发布消息
```

### 五、模块间通信
上一节中实现的发布—订阅模式的实现，是基于一个全局的 `Event` 对象，我们利用它可以在两个封装良好的模块中进行通信，这两个模块可以完全不知道对方的存在。就如同有了中介公司之后，我们不再需要知道房子开售的消息来自哪个售楼处  
比如现在有两个模块，`a` 模块里面有一个按钮，每次点击按钮之后，`b` 模块里的 `div` 中会显示按钮的总点击次数，我们用全局发布—订阅模式完成下面的代码，使得 `a` 模块和 `b` 模块可以在保持封装性的前提下进行通信  
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <button id="count">点我</button> 
  <div id="show"></div>
</body>
<script type="text/JavaScript">
  const a = (function() { 
    let count = 0; 
    const button = document.getElementById( 'count' );
    button.onclick = function() { 
      Event.trigger( 'add', count++ ); 
    } 
  })();

  const b = (function() { 
    const div = document.getElementById( 'show' ); 
    Event.listen( 'add', function( count ) { 
      div.innerHTML = count; 
    }); 
  })();
</script>
</html>
```

### 六、小结
发布—订阅模式的优点非常明显，一为**时间上**的解耦，二为**对象之间**的解耦  
它的应用非常广泛，既可以用在异步编程中，也可以帮助我们完成更松耦合的代码编写。还可以用来帮助实现一些别的设计模式，比如中介者模式。从架构上来看，无论是 `MVC` 还是 `MVVM`，都少不了发布—订阅模式的参与，而且 `JavaScript` 本身也是一门基于事件驱动的语言。

个人对发布-订阅模式的理解:
* 时间上的**解耦**，对于异步事件，不再需要将逻辑全部集中在回调之中
* 对象上的**解耦**，各个订阅对象自行订阅即可，便于扩展