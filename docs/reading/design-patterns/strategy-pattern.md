# 策略模式
## 一、定义及其实现
&emsp;&emsp;**策略模式**：定义一系列算法，把它们一个个**封装**起来，并且使它们可以互相替换。

### 1.1 计算奖金--直接实现
&emsp;&emsp;一般年终奖是根据员工的工资基数×年底绩效来计算，比如绩效为S级的人，他的年终奖有4倍工资；绩效为A级的人，他的年终奖有3倍工资。  
&emsp;&emsp;这里直接实现的方式是编写一个`calculateBonus`函数来计算每个人的奖金，很显然它需要两个参数：员工的基本工资和绩效等级：
```javascript
	var calculateBonus = function(level,salary) {
        if(level === 'S') {
            return salary*4;
        } 
        if(level === 'A') {
            return salary*3;
        }
        if(leverl === 'B') {
            return salary*2;
        }
	}
	
	calculateBonus('S',6000); //24000
```
&emsp;&emsp;上述代码十分简单，但存在着显而易见的缺陷：
* `calculateBonus`函数十分庞大，包含了很多`if`语句，这些语句要覆盖**所有逻辑分支**。
* `cal`函数缺乏**弹性**，如果新增一个C等级，或者想修改S等级，那我们必须深入该函数的内部实现，这是违反**开放-封闭**原则的。
* 算法的复用性差，如果在程序的其他地方需要重用这些计算奖金的算法呢？我们只能复制粘贴。

&emsp;&emsp;因此我们要重构这段代码。

### 1.2 计算奖金--组合函数重构
&emsp;&emsp;一般最容易想到使用组合函数来重构--我们将各种算法封闭到一个个小函数中，这些小函数有着良好的命名，可以一目了然地知道它对应哪种算法，同时它们也可以被复用到程序其他地方：
```javascript
	var levelS = function(salary) {
        return salary*4;
	}
	var levelA = function(salary) {
        return salary*3;
	}
	var levelB = function(salary) {
        return salary*2;
	}
	var calculateBonus = function(level,salary) {
        if(level === 'S') {
            return levelS(salary);
        } 
        if(level === 'A') {
            return levelA(salary);
        }
        if(leverl === 'B') {
            return levelB(salary);
        }
	}
	
	calculateBonus('S',6000); //24000
```
&emsp;&emsp;目前，我们的程序有了一定的改善，但是十分有限，我们依然没有解决最重要的问题：**`cal`函数可能越来越庞大**，且在系统变化时**缺乏弹性**。

### 1.3 计算奖金--策略模式重构
&emsp;&emsp;将**不变**与**变化**的部分隔开是每个设计模式的主题，策略模式也不例外。在这个例子中，算法的使用方式是不变的--都是根据算法取得计算后的奖金数额。而算法的实现是变化的，因为每种绩效对应着不同的计算规则。  
&emsp;&emsp;一个基于策略模式的程序**至少由两部分组成**。第一部分是**一组策略类**，策略类封装了具体的算法，并负责具体的计算过程。第二部分是**环境类`Context`**，它接受客户的请求，随后将请求委托给**某一个策略类**。要做到这点，说明`Context`中要维持对某个策略对象的引用。接下来还是先模仿传统面向对象语言中的实现方式：
```javascript
	//绩效类
	var LevelS  = function() {};
	levelS.prototype.cal = function(salary) {
        return salary*4;
	}
	
	var LevelA  = function() {};
	levelA.prototype.cal = function(salary) {
        return salary*3;
	}
	
	var LevelB  = function() {};
	levelB.prototype.cal = function(salary) {
        return salary*2;
	}
	
	//奖金类
	var Bonus = function() {
        this.salary = null;//原始工资
        this.strategy = null;//绩效等级对应的策略对象
	}
	Bonus.prototype.setSalary = function(salary) {
        this.salary = salary;
	}
	Bonus.prototype.setStrategy = function(strategy) {
        this.strategy = strategy;
	}
	Bonus.prototype.getBonus = function() {
     	if(!this.strategy) {
            throw new Error('未设置strategy属性');
     	}
     	return this.strategy.cal(this.salary);
	}
```
&emsp;&emsp;完成最终代码之前，我们来回顾下策略模式的思想：    
<div style="text-indent:2em">
    <b>"定义一些列的算法，把它们一个个封装起来，并且使它们可以相互替换"</b>
</div>

&emsp;&emsp;这句话在这里就是我们先创建一个`bonus`对象，并且给`bonus`设置工资数额，然后将某个计算奖金的**策略对象**传入`bonus`对象内部保存起来，当调用`getBouns()`来计算奖金的时候，`bouns`对象本身没有能力进行计算，而是将请求委托给了之前保存好的策略对象。其中每次可以传入不同的策略对象，这就是相互替换。
```javascript
	var bonus = new Bonus();
	bonus.setSalary(15000);
	bonus.setStrategy(new levelS());//传入策略对象
	console.log(bonus.getBonus());//60000;
	
	bonus.setStrategy(new levelA());//传入新的策略对象
	console.log(bonus.getBonus());//45000;
```

### 1.4 JavaScript版本策略模式重构
&emsp;&emsp;在上一节中我们让`strategy对象`从各个策略类中创建而来，这是模拟一些传统面向对象语言的实现。实际上`JavaScript`语言中，函数就是对象，所以更简单和直接的方法是**直接把`strategy`定义为函数**：
```javascript
	var strategies = {
        "S": function(salary){
            return salary*4;
        },
        "A": function(salary){
            return salary*3;
        },
        "B": function(salary){
            return salary*2;
        },
	};
```
&emsp;&emsp;同样，`Context`也没有必要必须经过`Bonus类`来表示，我们依然用`cal函数`充当`Context`来接受用户的请求。经过改造，代码的结构变得更加简洁：
```javascript
	var cal = function(level,salary) {
        return strategies[level](salary);
	};
	console.log(cal(15000,'S'));
```

### 1.5 多态在策略模式中的体现
&emsp;&emsp;通过使用策略模式重构代码，我们消除了原程序中**大片的条件分支语句**。所有跟计算奖金有关的逻辑不再放在`Context`中，而是分布在各个策略对象中。`Context`并**没有计算奖金的能力**，而是把这个职责**委托**给了某个策略对象，每个策略对象负责的算法已经被各自封装在对象内部。当我们对这些策略对象发出"计算奖金"的请求时，它们会返回各自不同的计算结果，这正是对象**多态**的体现。

## 二、更广义的“算法”
&emsp;&emsp;从定义上看，策略模式就是用来封装算法的。但如果把策略模式**仅仅**用来封装算法，那就有点大材小用了。在实际开发中，我们通常会将算法的含义**扩散**开来，使策略模式也可以用来封装一系列的“业务规则”。只要这些业务规则指向的**目标一致**，并且可以**替换使用**，那么就可以使用策略模式来封装它。
### 2.1 表单校验
&emsp;&emsp;假设我们正在编写一个注册的页面，在点击注册之前，有如下几条校验逻辑：  
&emsp;&emsp;①用户名不可为空  
&emsp;&emsp;②密码长度不能少于6位  
&emsp;&emsp;③手机号码必须符合格式  

### 2.2 表单校验--第一个版本
```html
	<!DOCTYPE html>
    <html lang="en">
    <head>
        <title>Document</title>
    </head>
    <body>
        <form action="xxx" id="registerForm" method="post">
            请输入用户名：<input type="text" name="userName" />
            请输入密码：<input type="text" name="password" />
            请输入手机号： <input type="text" name="phoneNumber" />
            <button>提交</button>
        </form>
        <script>
            var registerForm = document.getElementById('registerForm');

            registerForm.onsubmit = function () {
                if (registerForm.userName.value === '') {
                    alert('用户名不能为空');
                    return false;
                }
                if (registerForm.password.length < 6) {
                    alert('密码长度不能少于6位');
                    return false;
                }
                if (!/(^1[3|5|8][0-9]{9}$)/.test(registerForm.phoneNumber.value)) {
                    alert('手机号码格式不正确');
                    return false;
                }
            }
        </script>
    </body>
    </html>
```
&emsp;&emsp;这是一种常见的代码编写方式，它的缺点和计算奖金案例的最初版本一模一样：  
&emsp;&emsp;①验证函数十分庞大，包含了很多`if`语句，这些语句要覆盖**所有校验规则**。  
&emsp;&emsp;②验证函数缺乏**弹性**，如果新增一个校验规则，或者想修改已有的校验规则，那我们必须深入该函数的内部实现，这是违反**开放-封闭**原则的。  
&emsp;&emsp;③算法的复用性差，如果在程序的其他地方需要重用这些表单验证算法呢？我们只能复制粘贴。

### 2.3 表单校验--策略模式重构
&emsp;&emsp;照葫芦画瓢，我们第一步还是将校验逻辑都封装成策略对象：
```js
    const stategies = {
        isNonEmpty: function (value, errorMsg) { //不为空
            if (value === '') {
                return errorMsg;
            }
        },
        minLength: function (value, length, errorMsg) { //限制最小长度
            if (value.length < length) {
                return errorMsg;
            }
        },
        isMobile: function (value, errorMsg) { //手机号格式
            if (!/(^1[3|5|8][0-9]{9}$)/.test(value)) {
                return errorMsg;
            }
        } 
    };
```
&emsp;&emsp;接下来，我们要实现`Context--Validator`类，负责接受用户的请求，并委托给策略类。在写`Validator`类之前，我们有必要知道用户如何向`Validator`类发送请求，这有助于我们知道如何去编写`Validator`类的代码。代码如下：
```js
    const validataFunc = funtion() {
        let validator = new Validator(); //创建一个validator实例对象

        /******添加一些校验规则******/
        validator.add(registerForm.userName, 'isNonEmpty' , '用户名不能为空');
        validator.add(registerForm.password, 'minLength:6' , '密码长度不能少于6位');
        validator.add(registerForm.phoneNumber, 'isMobile' , '手机号格式不正确');

        let errorMsg = validator.start(); //获得校验结果
        return errorMsg; //返回校验结果
    }

    const registerForm = document.getElementById('registerForm');
    registerForm.onsubmit = () => {
        let errorMsg = validataFun(); //如果errorMsg不为空，那么说明未通过校验
        if( errotMsg ) {
            alert( errorMsg );
            return false;//阻止表单提交
        }
    }
```
&emsp;&emsp;在上述代码中，我们首先创建了一个`validator`对象，然后通过`validator.add`方法，往`validator`对象中添加了一些校验规则。`validator.add`方法接收3个参数，以下面这句代码说明:
```js
    validator.add(registerForm.password, 'minLength:6' , '密码长度不能少于6位');
    // 1.registerForm.password为参与校验的input输入框
    // 2.'minLength:6'是一个以冒号隔开的字符串，冒号前面的minLength代表用户挑选的strategy对象，冒号后面的6表示校验过程中的必须参数，这里表示输入框最小长度为6。如果这个字符串中不含冒号，说明校验过程中不需要额外的参数信息，比如'isNonEmpty'。
    // 3.第三个参数表示校验未通过时返回的错误信息
```
&emsp;&emsp;当我们往`validator`对象里添加完一系列的校验规则之后，会调用`validator.start()`方法来启动校验。如果`validator.start()`返回了一个确切的`errorMsg`字符串当作返回值，说明这次校验没有通过，此时需让`registerForm.onsubmit`方法返回`false`来阻止表单的校验。  
&emsp;&emsp;最后是`Validator类`的实现：
```js
    const Validator = function() {
        this.cache = [];
    };
    Validator.prototype.add = function(dom, rule, errorMsg) {
        let ary = rule.split(':'); //将strategy和参数分开
        this.cache.push(function() { //将校验的步骤用空函数包装起来，并且放入cache
            let strategy = ary.shifft(); //用户挑选的strategy
            ary.unshift(dom.value); //将input的value添加进参数列表
            ary.push (errorMsg); //将errorMsg添加进参数列表
            return strategies[ strategy ].apply( dom , ary);
        });
    };

    Validator.prototype.start = function() {
        for(let i = 0, validatorFunc; validatorFunc = this.cahe[ i++ ]) {
            let msg = validatorFunc(); //开始校验，并取得校验后的返回信息
            if( msg ) { //如果有确切的返回值，说明校验未通过
                return msg
            }
        }
    };
```
&emsp;&emsp;使用策略模式重构代码之后，我们仅仅通过"配置"的方式就可以完成一个表单验证，这些校验规则也可以复用到程序的任何地方，还能作为插件的形式，方便地移植到其他项目中。  
&emsp;&emsp;在修改某个校验规则时，只需要编写少量的代码，比如我们想将用户名输入框的校验规则改成用户名不能少于10个字符：
```js
    validator.add( registerForm.userName, 'minLength:10', '用户名长度不能小于10位' );
```

### 2.4 单个输入框添加多个校验规则
&emsp;&emsp;目前表单校验只是实现了一个文本输入框对应一种校验规则，但如果我们想为它添加多个校验规则，比如验证用户名输入框是否为空，同时校验它长度不能大于10，这部分内容可以在书上继续学习，这里不再赘述---书籍P83页。

## 三、策略模式的优缺点
&emsp;&emsp;优点：
<ul style="padding-left:3em">
    <li>策略模式利用组合、委托和多态等技术的思想，可以有效的<b>避免多重条件选择语句</b></li>
    <li>策略模式提供了<b>对外-封闭原则</b>的完美支持，将算法封装在strategy中，使其易于切换、理解和扩展</li>
    <li>策略模式中利用<b>组合和委托</b>来让Context拥有执行算法的能力，这也是继承的一种更为轻便的替代方案</li>
</ul>
&emsp;&emsp;缺点：
<ul style="padding-left:3em">
    <li>首先，使用策略模式会在程序中增加很多<b>策略类和策略对象</b></li>
    <li>其次，使用策略类<b>必须了解所有strategy以及它们间的不同</b>，这样才能选出一个合适的strategy。比如，我们选择一种合适旅游出行路线，必须先了解选择飞机、火车、自行车等方案的细节。此时strategy要向客户暴露所有的实现，这是违反<b>最少知识原则</b>的</li>
</ul>