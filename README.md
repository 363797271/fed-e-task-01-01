# fed-e-task-01-01
拉钩教育-大前端高新训练营-作业
## 1、请说出下列最终的执行结果，并解释为什么？
```js
var a = [];
for (var i = 0; i< 10; i++) {
    a[i] = function () {
        console.log(i);
    };
}
a[6]();
```
### 执行结果
10
### 解答
分解上面的代码：
```js
var a = [];

// for 条件块
// JS默认没有块作用域，代码中也没有使用let const等可以创建块作用域的声明，所以这里的{}可以省略
// {
    var i = 0;
    if (i < 10) {
        // for 执行块
        a[i] = function () {
            console.log(i);
        }
        i++;
    }
    // 循环 if (i < 10) {...}
// }

a[6]();
```
1. 首先全局作用域创建了变量`a`和`i`
2. 依次设置`a`的元素时，`i`需要查询定义的值，所以`a[i]`在循环中的实现是`a[0]` `a[1]` ... `a[9]`
3. `a`的元素都被赋值了一个函数，但是函数没有立即调用，当执行`a[6]()`时，对应的函数才被调用，此时全局变量`i`已经累加到`10`
4. 函数在内部作用域查询变量`i`失败，于是向上级(全局作用域)查询
5. 所以最终打印的是全局变量i，结果是10

## 2、请说出下列最终的执行结果，并解释为什么？
```js
var tmp = 123;
if (true) {
    console.log(tmp);
    let tmp;
}
```
### 执行结果
`console.log(tmp)`执行报错：不能在初始化前访问tmp
### 解答
1. `if`代码块中使用`let`声明变量，使`if`代码块生成了一个块作用域
2. JS引擎扫描到`let`，于是在作用域创建了变量`tmp`，但并没有像`var`一样将其初始化为`undefined`
2. 打印`tmp`时，引擎先在块作用域中查询`tmp`，并查到`let`创建的`tmp`变量
3. 而`tmp`并没有被初始化，所以`console.log`访问`tmp`时会报错
4. 也就是`let`要求的，不允许变量在声明前使用
## 3、结合ES6新语法，用最简单的方式找出数组中的最小值？
```js
var arr = [12, 34, 32, 89, 4];
```
### 解答
```js
const minNumber = Math.min(...arr);
```
使用rest(...)扩展运算符将数组展开，作为Math.min方法的参数传入，获取最小值
## 4、请详细说明var,let,const三种声明变量的方式之间的具体差别？
### 解答
|区别|var|let|const|
|--|--|--|--|
|初始化|`var`创建的变量会默认初始化为`undefined`并且提升到作用域顶部，使变量可以在声明语句之前使用|`let`创建的变量也会提升到作用域顶部，但不会初始化某个值，所以在声明前使用会报错：`Cannot access '变量名' before initialization`|同let一样|
|重复声明|重复声明同名的变量会覆盖前面的声明|不允许重复声明同名变量，否则报错：`Identifier '变量名' has already been declared`|同let一样|
|修改权限|允许修改为任意值|允许修改为任意值|首次赋值后，不允许修改，否则报错：`Assignment to constant variable.`|
|`{}`块作用域(非函数作用域)|在块中声明相当于在块所属的作用域中声明|为块创建作用域，在里面声明的变量只能在块作用域和下级作用域访问|同let一样|
## 5、请说出下列代码最终输出的结果，并解释为什么？
```js
var a = 10;
var obj = {
    a: 20,
    fn () {
        setTimeout(() => {
            console.log(this.a)
        })
    }
}
obj.fn()
```
### 执行结果
20
### 解答
分解代码
```js
var a = 10;
var obj = {
    a: 20,
    fn: function () {
        var this_1 = this;
        // console.log(this_1===obj); // true
        var callback = () => {
            var this_2 = this;
            // console.log(this_2===this_1); // true
            console.log(this_2.a)
        }
        setTimeout(callback, 0);
    }
}
obj.fn();
```
1. 普通函数中`this`指向调用者，`fn`指向的函数（下称`fn函数`）被`obj`调用
2. `fn函数`在全局作用域被`obj`调用，所以`this_1`指向`obj`
2. 箭头函数的`this`指向定义这个函数的作用域
3. 对象没有作用域，所以定义`callback函数`时，它处在`fn函数`的作用域下
4. 也就是 `this_2===this_1`
5. 所以`setTimeout`中打印的`this_2.a===obj.a===20`
## 6、简述`Symbol`类型的用途？
### 解答
1. `Symbol`可以创建唯一存在的值，可以作为对象的属性名，避免同名冲突或覆盖。
2. `Symbol`作为的属性名是不可被枚举的（for in），可以用于创建对象的私有属性，它将被隐藏起来（可以被访问）。
3. 可以访问到内置对象的Symbol属性，如修改或定义一个迭代器Symbol.iterator，使数据可以被迭代。
## 7、说说什么是浅拷贝，什么是深拷贝？
### 解答
#### 数据类型
JS变量的值包含两种数据类型：
- 基本数据类型：String Number Boolean Null Undefined Symbol
- 引用数据类型：不同数据结构的对象 Object Array Function Date RegExp等
##### 内存存放的区别
- 基本类型存放在栈内存，按值存放，可以直接访问
- 引用类型存放在堆内存，每个对象分别存放，将指向这个对象的指针存放在栈内存，可以使用指针访问这个对象。
#### 赋值与修改
JS中的赋值实际上是内存中的值与内存中的变量进行绑定。<br>
修改变量，也就是修改变量的绑定关系。
##### 基本类型复制与修改
```js
var a = 100; // 变量a与基本数据类型值100绑定
var b = a; // 复制a：b与a的值绑定，等效与var b = 100
b = 200; // 变更绑定关系，将b与200绑定
console.log(a) // 100 因为b只是和a的值绑定，所以修改b并没有影响a
```
##### 引用类型复制与修改
```js
var a = { foo: 100 }; // 变量a与对象{foo:100}绑定，属性foo与100绑定

var b = a; // 复制a：b与a的指针绑定，但不等效于var b = {foo:100} 这会创建一个新对象并向指向这个对象的新指针绑定到b上
b.foo = 200; // 修改对象属性foo的绑定，指向200
console.log(a.foo) // 因为a和b都指向一个对象，所以a.foo获取的值是200

b = {foo:200}； // 这里只是修改b的绑定为一个与之前结构相同的对象，而不是修改b指向的对象
b.foo = 300; // 修改新绑定对象的属性的绑定
console.log(a.foo) // a和b分别指向不同的对象，所以不受影响，打印200
```
#### 浅拷贝
复制/拷贝一个对象时，只是拷贝的指向这个对象的指针(地址)。<br>
所有绑定这个地址的变量共享这个对象的修改和访问。<br>
比如上面引用类型的示例：
```js
var a = { foo: 100 };
var b = a; // 浅拷贝
```
#### 深拷贝
复制/拷贝一个对象时，创建的是一个新对象，将被拷贝的对象的数据结构完全复制过来。<br>
两个对象在内存中单独存放，指向不同的地址。<br>
修改一个对象不会影响另一个对象。<br>
比如将对象分解重新组合：
```js
var a = { foo: 100 };
var b = {};
for (var key in a) {
    b[key] = a[key];
}
```
##### 多层嵌套
由于对象中的属性也可能指向某个对象，所以某些拷贝对象的方式只能保证第一层或前几层是深拷贝。<br>
例如：
```js
var child = { bar: 1000 };
var a = { foo: 100, child: child };
var b = {...a};
b.foo = 200;
b.child.bar = 2000;
console.log(a.foo) // 100 深拷贝，未被影响
console.log(a.child.bar) // 2000 浅拷贝 被影响
```
这种不完全的深拷贝，属于浅拷贝，或称为n层深拷贝。<br>
深拷贝示例：
```js
var child = { bar: 1000 };
var a = { foo: 100, child: child };
var b = JSON.parse(JSON.stringify(a));
b.foo = 200;
b.child.bar = 2000; 
console.log(a.foo) // 100 深拷贝，未被影响
console.log(a.child.bar) // 1000 深拷贝，未被影响
```
## 8、谈谈你是如何理解JS异步编程的，Event Loop是做什么的，什么是宏任务，什么是微任务？
### 异步编程
定义一个任务执行后要做的事情，不用关心任务执行状态和执行结果。

JS将任务的执行模式分为两种：
#### 异步模式
在主线程执行同步任务时，可以在其他线程同时执行其他任务，执行完，回到主线程执行异步任务的回调。<br>
例如：执行一个泡面的任务，一个人可以一边煮开水（异步任务交由其他线程执行），一边准备方便面（在主线程上执行），水煮开后，将一个倒水的任务排到队列中等待，等待方便面准备好后（撕开包装、配调料、换容器等），执行倒水的任务。
#### 同步模式
在单个线程上，按顺序执行任务，同一时间只执行一个任务<br>
例如：执行将大象放出冰箱的任务
1. 打开冰箱
2. 把大象放进去
3. 把冰箱门带上
#### 总结
类似异步模式，定义一个任务执行后要做的事情，不用关心任务执行状态和执行结果的编程思维，称为异步编程。<br>
异步编程不一定处理的是异步任务，但一定是已经配置好驱动机制，不需要显式的去执行<br>
例如事件绑定
```js
document.body.addEventListener('click',() => {
    console.log(1)
})
document.body.click()
console.log(2)
// 打印 1 2
```
事件触发是同步的，但通过绑定事件，不需要再去关心它被点击后会发生的事情
#### 异步编程方案
1. 回调 callback
2. 事件监听
3. 发布订阅
4. Promise
5. Generator + yield
6. Async/Await
### 事件循环 Event Loop
JavaScript拥有一个基于事件循环的并发模型。<br>
JavaScript是单线程运行，主线程只会执行同步任务。异步任务返回的回调被放入消息队列（任务队列）中等待执行。<br>
主线程运行执行栈中的代码，当运行完并清空执行栈后，触发事件循环。<br>
事件循环会从消息队列中提取下一个要处理的任务压入执行栈去执行，其余任务继续等待。直到队列清空。
### 微任务 & 宏任务
JS异步操作会生成微任务或宏任务。<br>
JS代码执行顺序：同步代码>微任务>宏任务。<br>
1. 执行栈会先执行完同步代码。
2. 然后将微任务全部拉入执行栈去执行。
3. 微任务执行完，根据事件循环从队列中提取下一个宏任务。
4. 宏任务继续按照顺序执行：同步代码>微任务>宏任务
#### 微任务
| \# | 浏览器 | Node| 
|--|--|--|
|process.nextTick|✗|✓|
|MutationObserver|✓|✗|
|Promise.then catch finally|✓|✓|
#### 宏任务
| \# | 浏览器 | Node| 
|--|--|--|
|I/O|✓|✓|
|setTimeout|✓|✓|
|setInterval|✓|✓|
|setImmediate|✗|✓|
|requestAnimationFrame	|✓|✗|


## 9、将下面异步代码使用Promise改进？
```js
setTimeout(function () {
    var a = 'hello';
    setTimeout(function () {
        var b = 'lagou';
        setTimeout(function () {
            var c = 'I O U';
            console.log(a + b + c);
        }, 10);
    }, 10);
}, 10);
```
### 解答
```js
function add(prev, str) {
    return new Promise ((resolve,reject) => {
        setTimeout(function () {
            prev.push(str);
            resolve()
        }, 10)
    })
}
(async function() {
    let arr = [];
    await add(arr, 'hello');
    await add(arr, 'lagou');
    await add(arr, 'I O U');
    console.log(arr.join(' '));
})()
```
## 10、请简述TypeScript与JavaScript之间的关系？
### 解答
1. TypeScript基于JavaScript基础之上的编程语言，是JavaScript的超集，可以使用直接JavaScript去编写。
2. TypeScript支持JavaScript新版本的特性。
3. TypeScript扩展了类型系统，使JavaScript可以定义强类型和静态类型。
4. 任何一个JavaScript运行环境都可以运行TypeScript（编译后）
## 11、请谈谈你所认为的TypeScript优缺点？
### 解答
#### 优点
1. 代码可读性，类型注解、接口提示等提供了文档功能。
2. 提高了可维护性，大部分错误在编译阶段暴露，不用等到运行阶段。
3. 方便重构，快速定位影响范围。
4. 编辑器支持，代码补全、接口提示、跳转到定义等。
5. 它是JavaScript的超集，可以直接使用JavaScript代码，渐进式升级为TypeScript
6. 兼容第三方库，可以为没有声明文件的第三方库编写声明，供TypeScript读取。
7. 支持ES6新特性
8. 主流，JS第二语言，拥有活跃的社区，Vue.js 3.0使用它
#### 缺点
1. TypeScript加入了一些新概念，如枚举、接口、泛型、只读类型、私有属性、抽象类等，增加了不少学习成本。
2. 项目中使用TypeScript功能，会配置枚举、接口、抽象类等变量和规范，增加项目初期的开发成本。
3. 使用第三方库可能需要安装对应的声明文件甚至手动声明。
