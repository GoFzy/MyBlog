# Promise对象
## 回调地狱
&emsp;&emsp;首先我们知道在 `JS` 中异步执行机制具有非常重要的地位，而 `Node.js` 中 `readFile` 就是一个异步操作，这里我们先进行一个小实验，分别读取 `data` 文件夹下 `a`、`b`、`c` 三个文件并输出：
```js
var fs = require('fs');

fs.readFile('./data/a.txt','utf8',function(err,data){
    if(err) throw err;
    console.log(data);
});
fs.readFile('./data/b.txt','utf8',function(err,data){
    if(err) throw err;
    console.log(data);
});
fs.readFile('./data/c.txt','utf8',function(err,data){
    if(err) throw err;
    console.log(data);
});
```
![callback](https://raw.githubusercontent.com/GoFzy/pic-bed/master/callback.png)  
从上图的执行结果中可以看到，异步操作的执行结果并不是按照代码的顺序执行，而如果我们想保证这三个异步操作的顺序，就可以使用回调嵌套的方式：
```js
var fs = require('fs');

fs.readFile('./data/a.txt','utf8',function(err,data){
    if(err) throw err;
    console.log(data);
    fs.readFile('./data/b.txt','utf8',function(err,data){
      if(err) throw err;
      console.log(data);
      fs.readFile('./data/c.txt','utf8',function(err,data){
      if(err) throw err;
      console.log(data);
     });  
  });
});
```
![callback-res](https://raw.githubusercontent.com/GoFzy/pic-bed/master/callback-res.png)  
目前只是执行三个函数，还不是很复杂，如果出现了`d`、`e`、`f` 时，嵌套过深，代码会非常的难看，同时不利于维护，而这种金字塔型的代码就可以称之为**回调地狱**。
# Promise基本语法
为了解决上述编码方式带来的问题，`ES6` 中新增了一个将 `Promise` 写入了标准，以下是示意图：
![Promise](https://raw.githubusercontent.com/GoFzy/pic-bed/master/Promise.png)  
我们可以将 `Promise` 看作是一个大的容器，容器中存放了一个异步任务，默认该异步认为分为三种状态，即 `Pending`(正在执行)，而 `Pending` 结果只能有一种状态，要么成功(`Resolved`)，要么失败(`Reject`)。接下来就是代码实现：
```js
var fs = require('fs');
console.log(1);
//创建Promise容器--Promise容器一旦创建，就立即执行里面的代码
var promise = new Promise(function(){
    console.log(2);
    fs.readFile('./data/a.txt','utf8',function(err,data){
        console.log(3);
        if(err){
            console.log(err);
        }else{
            console.log(data);
        }
    });
});
console.log(4);
```
![Promise-res](https://raw.githubusercontent.com/GoFzy/pic-bed/master/Promise-res.png)  
这里值得注意的地方在于，`Promise` **本身不是异步操作**，其内部的 `readFile` 才为异步，因此整个执行顺序为`1-2-4-3-aaa`。这里只是对 `Promise` 容器的特性进行一个说明，然后我们来看一下真正的语法标准:
```js
var fs = require('fs');
//创建Promise容器--Promise容器一旦创建，就立即执行里面的代码
var promise = new Promise(function (resolve, reject) {
    fs.readFile('./data/a.txt', 'utf8', function (err, data) {
        if (err) {
            //Promise容器改为Reject
            reject(err);
        } else {
            //Promise容器改为Resolve
            resolve(data);
        }
    });
});
//当promise执行完了，然后做指定操作
promise.then(function (data) {
    //then方法接收的第一个函数就是容器中的resolve函数
    console.log(data);
}, function (err) {
    //then方法接收的第二个函数就是容器中的reject函数
    console.log(err);
});
```
## Promise如何解决嵌套问题
链式调用异步编程
```js
var fs = require('fs');
var pro1 = new Promise(function(resolve,reject){
    fs.readFile('./data/a.txt','utf8',function(err,data){
        if(err) reject(err);
        else resolve(data);
    });
});
var pro2 = new Promise(function(resolve,reject){
    fs.readFile('./data/b.txt','utf8',function(err,data){
        if(err) reject(err);
        else resolve(data);
    });
});
var pro3 = new Promise(function(resolve,reject){
    fs.readFile('./data/c.txt','utf8',function(err,data){
        if(err) reject(err);
        else resolve(data);
    });
});

pro1
.then((data)=>{
    console.log(data);
    return pro2;
},(err)=>console.log(err))
.then((data)=>{
    console.log(data);
    return pro3;
})
.then((data)=>console.log(data))
```
封装上述代码：
```js
var fs = require('fs');

function pReadFile(filepath){
    return new Promise((resolve,reject)=>{
        fs.readFile(filepath,'utf8',(err,data)=>{
            if(err) reject(err);
            else resolve(data);
        })
    })
};
pReadFile('./data/a.txt')
    .then((data)=>{
        console.log(data);
        return pReadFile('./data/b.txt')
    })
    .then((data)=>{
        console.log(data);
        return pReadFile('./data/c.txt');
    })
    .then((data)=>{
        console.log(data);
    })
```
## Promise.all
`Promise.all` 可以将多个 `Promise` 实例包装成一个新的 `Promise` 实例。同时，成功和失败的返回值是不同的，成功的时候返回的是一个结果数组，而失败的时候则返回最先被 `reject` 失败状态的值。我们再对之前代码进行改进：
```js
var fs = require('fs');

function pReadFile(filepath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filepath, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(data);
        })
    })
}

Promise.all([pReadFile('./data/a.txt'),pReadFile('./data/b.txt'),pReadFile('./data/c.txt')])
.then((arr)=>{
    console.log(arr);
},(err)=>console.log(err));
```
![Promise-all](https://raw.githubusercontent.com/GoFzy/pic-bed/master/Promise-all.png)  
需要特别注意的是，`Promise.all` 获得的成功结果的数组里面的数据顺序和 `Promise.all` 接收到的数组**顺序是一致**的，即 `pro1` 的输入顺序如果在前，即便 `pro1` 的结果获取的比 `pro2` 要晚，但结果数组中还是 `pro1` 在前。这带来了一个绝大的好处：在前端开发请求数据的过程中，偶尔会遇到发送多个请求并根据请求顺序获取和使用数据的场景，使用 `Promise.all` 毫无疑问可以解决这个问题。

## Promise.race
```js
var p = Promise.race([pro1,pro2,pro3]);
```
上述代码中，只要 `pro1`、`pro2`、`pro3`中有个一实例率先改变状态，`p` 的状态就随着改变。那个率先改变的`Promise` 实例的返回值就是传递给 `p` 的回调函数。

## 小结
个人对 `Promise` 对象的理解：`Promise` 是包裹异步任务的容器，在其内部中最关键的部分在于**状态的改变**。因此我们在实例化该对象时，需要传入三个参数:
* 异步任务
* 成功状态下的回调函数
* 失败状态下的错误处理函数
