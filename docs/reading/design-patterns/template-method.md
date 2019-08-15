# 模板方法模式
## 一、定义和组成
**模板方法模式**：一种只需要使用继承就可以实现的设计模式。该模式由两部分结构组成：
* 第一部分是**抽象父类**，封装了子类的**算法框架**，其中包括一些公共方法以及封装子类中所有方法的执行顺序  
* 第二部分是**具体的实现子类**，通常在抽象父类中而子类通过**继承**这个抽象类，也继承了整个算法结构，并可以选择**重写**父类方法

## Coffee or Tea 案例
也许上面的定义还比较抽象，我们通过一个案例进行说明：    
首先，我们先来泡一杯咖啡，如果没有什么太个性化的需求，泡咖啡的步骤通常如下：  
1. 把水煮沸  
2. 用沸水冲泡咖啡  
3. 把咖啡倒进杯子  
4. 加糖和牛奶  

通过下面这段代码，我们就能得到一杯香浓的咖啡：
```js
let Coffee = function(){};
  Coffee.prototype.boilWater = () => {
  console.log( '把水煮沸' );
};
Coffee.prototype.brewCoffeeGriends = () => {
  console.log( '用沸水冲泡咖啡' );
};
Coffee.prototype.pourInCup = () => {
  console.log( '把咖啡倒进杯子' );
};
Coffee.prototype.addSugarAndMilk = () => {
  console.log( '加糖和牛奶' );
};
Coffee.prototype.init = function(){
    this.boilWater();
    this.brewCoffeeGriends();
    this.pourInCup();
    this.addSugarAndMilk();
};
let coffee = new Coffee();
coffee.init();
```
接下来，开始准备我们的茶，泡茶的步骤跟泡咖啡的步骤相差并不大：  
1. 把水煮沸  
2. 用沸水浸泡茶叶  
3. 把茶水倒进杯子  
4. 加柠檬  

同样用一段代码来实现泡茶的步骤：  
```js
let Tea = function(){};
Tea.prototype.boilWater = function(){
  console.log( '把水煮沸' );
};
Tea.prototype.steepTeaBag = function(){
  console.log( '用沸水浸泡茶叶' );
};
Tea.prototype.pourInCup = function(){
  console.log( '把茶水倒进杯子' );
};
Tea.prototype.addLemon = function(){
  console.log( '加柠檬' );
};
Tea.prototype.init = function(){
    this.boilWater();
    this.steepTeaBag();
    this.pourInCup();
    this.addLemon();
};
let tea = new Tea();
tea.init();
```
分离出共同点：  
泡咖啡 |  泡茶  
-|-
把水煮沸 | 把水煮沸 |
用沸水冲泡咖啡 | 用沸水冲泡茶叶 |
把咖啡倒进杯子 | 把茶水倒进杯子 |
加糖和牛奶 | 加柠檬 |     
我们找到泡咖啡和泡茶主要有以下不同点： 
* 原料不同。一个是咖啡，一个是茶，但我们可以把它们都**抽象为“饮料”**
* 泡的方式不同。咖啡是冲泡，而茶叶是浸泡，我们可以把它们都**抽象为“泡”**  
* 加入的调料不同。一个是糖和牛奶，一个是柠檬，但我们可以把它们都**抽象为“调料”**

经过抽象之后，不管是泡咖啡还是泡茶，我们都能整理为下面四步：  
把水煮沸-->用沸水冲泡饮料-->把饮料倒进杯子-->加调料  
所以，不管是冲泡还是浸泡，我们都能给它一个新的方法名称，比如说 `brew()`  
同理，不管是加糖和牛奶，还是加柠檬，我们都可以称之为 `addCondiments()`  
让我们忘记最开始创建的 `Coffee类` 和 `Tea类`。 现在可以**创建一个抽象父类**来表示泡一杯饮料的整个过程。不论是 `Coffee`，还是 `Tea`，都被我们用 `Beverage` 来表示，代码如下：
```js
let Beverage = function(){};

Beverage.prototype.boilWater = function() {
  console.log('把水煮沸');
};
Beverage.prototype.brew = function(){};          // 空方法，应该由子类重写
Beverage.prototype.pourInCup = function(){};     // 空方法，应该由子类重写
Beverage.prototype.addCondiments = function(){}; // 空方法，应该由子类重写

Beverage.prototype.init = function(){
  this.boilWater();
  this.brew();
  this.pourInCup();
  this.addCondiments();
};
```
### 创建 Coffee 子类
现在创建一个 `Beverage` 类的对象对我们来说没有意义，因为世界上能喝的东西没有一种真正叫“饮料”的，饮料在这里还只是一个抽象的存在。接下来我们要创建**咖啡类**和**茶类**，并让它们继承饮料类：
```js
	let Coffee = function(){};
	Coffee.prototype = new Beverage();
```
接下来要重写抽象父类中的一些方法，只有“把水煮沸”这个行为可以直接使用父类 `Beverage`中的 `boilWater` 方法，其他方法都需要在 `Coffee` 子类中重写，代码如下：
```js
Coffee.prototype.brew = function(){
  console.log( '用沸水冲泡咖啡' );
};
Coffee.prototype.pourInCup = function(){
  console.log( '把咖啡倒进杯子' );
};
Coffee.prototype.addCondiments = function(){
  console.log( '加糖和牛奶' );
};
let coffee = new Coffee();
coffee.init();
```
至此我们的 `Coffee` 类已经完成了，当调用 `coffee.init()` 方法时，由于 `coffee` 对象和 `Coffee` 构造器的原型 `prototype` 上都没有对应的 `init` 方法，所以该请求会顺着原型链，被委托给 `Coffee` 的“父类” `Beverage.init` 方法。关于 `Tea` 子类的创建可以照葫芦画瓢，这里省略了。  
在上面的例子中，到底谁才是所谓的模板方法呢？  
答案是`Beverage.prototype.init`。该方法中**封装了子类的算法框架**，它作为一个算法的模板，指导子类以**何种顺序去执行哪些方法**。

## 抽象类
首先要说明的是，模板方法模式是一种严重依赖抽象类的设计模式。`JavaScript`在语言层面并没有提供对抽象类的支持，我们也很难模拟抽象类的实现。这一节我们将着重`JavaScript`没有抽象类时所做出的让步和变通。
### JavaScript 没有抽象类的缺点和解决方案
`JavaScript` 并没有从语法层面提供对抽象类的支持。抽象类的第一个作用是隐藏对象的具
体类型，由于 `JavaScript` 是一门**类型模糊**的语言，所以隐藏对象的类型在 `JavaScript` 中并不重要  
另一方面， 当我们在`JavaScript`中使用原型继承来模拟传统的类式继承时，并没有编译器帮助我们进行任何形式的检查，**我们也没有办法保证子类会重写父类中的“抽象方法”**。  
我们知道，`Beverage.prototype.init`方法作为模板方法，已经规定了子类的算法框架，代码如下：
```js
Beverage.prototype.init = function(){
  this.boilWater();
  this.brew();
  this.pourInCup();
  this.addCondiments();
};
```
如果我们的 `Coffee类` 或者 `Tea类` 忘记实现这 4 个方法中的一个呢？  
拿 `brew方法` 举例，如果我们忘记编写 `Coffee.prototype.brew` 方法，那么当请求`coffee` 对象的 `brew` 时，请求会顺着原型链找到 `Beverage` 父类对应的 `Beverage.prototype.brew` 方法，而 `Beverage.prototype.brew` 方法到目前为止是一个空方法，这显然是不能符合我们需要的  
在`Java`中**编译器会保证子类会重写父类中的抽象方法**，但在 `JavaScript` 中却没有进行这些检查工作。我们在编写代码的时候得不到任何形式的警告，完全寄托于程序员的记忆力和自觉性是很危险的，特别是当我们使用模板方法模式这种完全依赖继承而实现的设计模式时。下面提供两种变通的解决方案：    
* 第 1 种方案是用鸭子类型来模拟接口检查，以便确保子类中确实重写了父类的方法。但模
拟接口检查会带来不必要的复杂性，而且要求程序员主动进行这些接口检查，这就要求我们在业务代码中添加一些跟业务逻辑无关的代码
* 第 2 种方案是让 `Beverage.prototype.brew` 等方法直接抛出一个异常，如果因为粗心忘记编写 `Coffee.prototype.brew` 方法，那么至少我们会在程序运行时得到一个错误：
```js
Beverage.prototype.brew = function(){
  throw new Error( '子类必须重写 brew 方法' );
};
Beverage.prototype.pourInCup = function(){
  throw new Error( '子类必须重写 pourInCup 方法' );
};
Beverage.prototype.addCondiments = function(){
  throw new Error( '子类必须重写 addCondiments 方法' );
};
```
第 2 种解决方案的优点是实现简单，付出的额外代价很少；缺点是我们得到错误信息的**时间点太靠后**。我们一共有 3 次机会得到这个错误信息:
1. 第 1 次是在编写代码的时候，通过编译器的检查来得到错误信息；
2. 第 2 次是在创建对象的时候用鸭子类型来进行“接口检查”；
3. 而目前我们不得不利用**最后一次机会**，在程序运行过程中才知道哪里发生了错误。

此时**TypeScript**的价值就体现出来了！


## 模板方法模式的使用场景
在 `Web` 开发中能找到很多模板方法模式的适用场景，比如我们在构建一系列的 `UI` 组件，这些组件的构建过程一般如下所示：  
1. 初始化一个`div`容器；  
2. 通过`ajax`请求拉取相应的数据；  
3. 把数据渲染到`div`容器里面，完成组件的构造；  
4. 通知用户组件渲染完毕。  
我们看到，任何组件的构建都遵循上面的 4 步，其中:
* 第(1)步和第(4)步是**相同的**
* 第(2)步不同的地方只是请求 `ajax` 的**远程地址** 
* 第(3)步不同的地方是**渲染数据的方式**

于是我们可以把这 4 个步骤都抽象到父类的模板方法里面，父类中还可以顺便提供第(1)步和第(4)步的具体实现。当子类继承这个父类之后，会重写模板方法里面的第(2)步和第(3)步。

## 钩子方法
通过模板方法模式，我们在父类中封装了子类的算法框架。这些算法框架在正常状态下是适用于大多数子类的，但如果有一些特别“个性”的子类呢？比如我们在 `饮料类 Beverage` 中封装了饮料的冲泡顺序：  
1. 把水煮沸  
2. 用沸水冲泡饮料  
3. 把饮料倒进杯子  
4. 加调料  

这 4 个冲泡饮料的步骤适用于咖啡和茶，在我们的饮料店里，根据这 4 个步骤制作出来的咖啡和茶，一直顺利地提供给绝大部分客人享用。但有一些客人**喝咖啡是不加调料**（糖和牛奶）的。既然 `Beverage` 作为父类，已经规定好了冲泡饮料的 4 个步骤，那么有什么办法可以让子类不受这个约束呢？  
钩子方法 `（hook）` 可以用来解决这个问题，放置钩子是隔离变化的一种常见手段。我们在**父类中容易变化的地方**放置钩子，钩子可以有**一个默认的实现**，究竟要不要“挂钩”，这由子类自行决定。钩子方法的返回结果决定了模板方法后面部分的执行步骤，也就是程序接下来的走向，这样一来，程序就拥有了变化的可能  
在这个例子里，我们把挂钩的名字定为 `customerWantsCondiments` ，接下来将挂钩放入 `Beverage类`，看看我们如何得到一杯不需要糖和牛奶的咖啡，代码如下：
```js
let Beverage = function(){};
Beverage.prototype.boilWater = function(){
  console.log( '把水煮沸' );
};
Beverage.prototype.brew = function(){
  throw new Error( '子类必须重写 brew 方法' );
};
Beverage.prototype.pourInCup = function(){
  throw new Error( '子类必须重写 pourInCup 方法' );
};
Beverage.prototype.addCondiments = function(){
  throw new Error( '子类必须重写 addCondiments 方法' );
};
Beverage.prototype.customerWantsCondiments = function(){
  return true; // 默认需要调料
};
Beverage.prototype.init = function(){
  this.boilWater();
  this.brew();
  this.pourInCup();
  if ( this.customerWantsCondiments() ){ // 如果挂钩返回 true，则需要调料
    this.addCondiments();
  }
};
```

## 好莱坞原则
学习完模板方法模式之后，我们要引入一个新的设计原则——著名的**好莱坞原则**    
好莱坞无疑是演员的天堂，但好莱坞也有很多找不到工作的新人演员，许多新人演员在好莱坞把简历递给演艺公司之后就只有回家等待电话。有时候该演员等得不耐烦了，给演艺公司打电话询问情况，演艺公司往往这样回答：**不要来找我，我会给你打电话**。在设计中，这样的规则就称为**好莱坞原则**。在这一原则的指导下：
我们允许**底层组件将自己挂钩到高层组件**中，而高层组件会决定什么时候、以何种方式去使用这些底层组件，高层组件对待底层组件的方式，跟演艺公司对待新人演员一样，都是**别调用我们，我们会调用你**    
模板方法模式是好莱坞原则的一个典型使用场景，它与好莱坞原则的联系非常明显，当我们用模板方法模式编写一个程序时，就意味着子类放弃了对自己的控制权，而是改为父类通知子类，哪些方法应该在什么时候被调用。作为子类，只负责提供一些设计上的细节。  
除此之外，好莱坞原则还常常应用于其他模式和场景，例如发布订阅模式和回调函数。  
## 真的需要"继承"吗
模板方法模式是基于继承的一种设计模式，父类封装了子类的**算法框架**和**方法的执行顺序**，子类继承父类之后，父类通知子类执行这些方法，好莱坞原则很好地诠释了这种设计技巧，即高层组件调用底层组件。  
本文中我们通过模板方法模式，编写了一个 `Coffee or Tea` 的例子。模板方法模式是为数不多的基于继承的设计模式，但 `JavaScript` 语言实际上没有提供真正的**类式继承**，继承是通过对象与对象之间的委托来实现的  
也就是说，虽然我们在形式上借鉴了提供类式继承的语言，但本章学习到的模板方法模式并不十分正宗。而且在 `JavaScript` 这般灵活的语言中，实现这样一个例子，是否真的需要继承这种重武器呢？  
在好莱坞原则的指导之下，下面这段代码可以达到和继承一样的效果。
```js
let Beverage = function( param ){
  let boilWater = function(){
      console.log( '把水煮沸' );
  };
  let brew = param.brew || function(){
      throw new Error( '必须传递 brew 方法' );
  };
  let pourInCup = param.pourInCup || function(){
      throw new Error( '必须传递 pourInCup 方法' );
  };
  let addCondiments = param.addCondiments || function(){
      throw new Error( '必须传递 addCondiments 方法' );
  };
  let F = function(){};
  F.prototype.init = function(){
      boilWater();
      brew();
      pourInCup();
      addCondiments();
  };
  return F;
};
let Coffee = Beverage({
    brew: function(){
      console.log( '用沸水冲泡咖啡' );
  },
  pourInCup: function(){
    console.log( '把咖啡倒进杯子' );
  },
  addCondiments: function(){
    console.log( '加糖和牛奶' );
  }
});
```
在这段代码中，我们把`brew、 pourInCup、 addCondiments`这些方法依次传入 `Beverage`函数，`Beverage`函数被调用之后返回构造器 `F`。`F 类`中包含了**模板方法**   `F.prototype.init`。跟继承得到的效果一样，该模板方法里依然封装了饮料子类的算法框架。

## 七、小结
模板方法模式是一种典型的通过封装变化提高系统扩展性的设计模式。在传统的面向对象语
言中，一个运用了模板方法模式的程序中，子类的方法种类和执行顺序都是不变的，所以我们把这部分**不变逻辑抽象到父类的模板方法**里面  
而子类的方法具体怎么实现则是可变的，于是我们把这部分**变化的逻辑封装到子类中**。通过增加新的子类，我们便能给系统增加新的功能，并不需要改动抽象父类以及其他子类，这也是符合**开放-封闭原则**。  
但在`JavaScript`中，我们很多时候都不需要依样画瓢地去实现一个模版方法模式，**高阶函数**是更好的选择。