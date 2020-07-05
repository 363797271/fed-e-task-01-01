# 强类型和弱类型（类型安全）
## 强类型
- 语言层面限制函数的实参类型必须与形参类型相同
- 有更强的类型约束
- 强类型语言中不允许有任意的隐式类型转换
## 弱类型
- 语言层面不限制函数的实参类型
- 几乎没有什么约束
- 弱类型语言允许任意的数据隐式类型转换
## 区别
语言层面（编译阶段）是否允许任意的隐式类型转换
```js
'100' + 10
// 强类型语言不允许隐式类型转换，报错
// 弱类型语言不报错
```

# 静态类型和动态类型（类型检查）
## 静态类型
- 一个变量声明时它的类型就是明确的
- 声明过后，它的类型就不允许再修改
## 动态类型
- 运行阶段才能够明确变量的类型
- 变量的类型随时可以改变
- 动态类型语言当中，变量是没有类型的，变量中存放的值是有类型的。
## 区别
是否允许随时修改变量的类型。
```js
var foo = 100;
foo = 'bar';
// 静态类型不允许修改变量类型，报错
// 动态累哦行不报错
```
# JavaScript自有类型系统的问题
- 弱类型 + 动态类型
- 任性，几乎没有任何类型限制
- 不靠谱，缺失了类型系统的可靠性
- 脚本语言，没有编译环节，不需要编译，就可以在运行环境中运行。没有静态语言在编译阶段做类型检查的环节。
- 大规模应用下，这种优势变成了短板。
# 弱类型的问题
- 必须要等待运行阶段才能发现代码中的一些类型异常。
- 类型不明确，可能造成函数功能发生改变
- 对象索引器的错误用法
**约定方式规避这些问题有隐患，强制要求有保障**
# 强类型的优势
1. 错误更早暴露（在编译阶段暴露，而不是等到运行阶段）
2. 代码更智能，编码更准确（开发工具智能提示）
3. 重构更牢靠（类型检查被修改的方法调用的位置）
4. 减少代码层面不必要的类型判断
# Flow
JavaScript的静态类型检查器,一个工具
## 类型注解
```js
function sum(a:number,b:number){
    return a + b;
}
```
通过babel编译将注解代码删除。
## 使用
安装
```bash
npm install --dev flow-bin
```
package.json配置script
```json
"flow":"flow"
```
生成初始化文件.flowconfig
```bash
npm run flow init
```
标记需要检查的文件，JS文件头部添加`@flow`标识（一段注释中包含标识），标识前不能有可运行的js代码
```js
// 注释code... @flow 注释code...
function sum(a:number,b:number){
    return a + b;
}
```
首次运行flow，监控文件，耗时较长
```bash
npm run flow
```
再次运行flow进行检查
```bash
npm run flow
```
停止监控
```bash
npm run flow stop
```
## 编译移除注解
类型注解不是标准的js语法，直接运行会报错，使用编译工具移除注解。
### 官方工具 flow-remove-types
- 安装 `npm install --dev flow-remove-types`
- package.json scripts配置 `"flow-remove":"flow-remove-types [编译目录] -d [输出路径]"`
- 使用 `npm run flow-remove`
### babel
安装
```bash
npm install --dev @babel/core @babel/cli @babel/preset-flow
```
babel配置 .babelrc
```json
{
    "preset":["@babel/preset-flow"]
}
```
package.json scripts配置
```json
"babel": "babel [编译目录] -d [输出路径]"
```
编译 `npm run babel`
## Flow工具插件
- 官方插件 Flow Language Support
- 类似vsCode的javascript validate
- 因为不是vsCode原生插件，所以需要保存后才会校验
- 需要运行flow才会开启校验
# Flow使用
## 类型推断
根据代码当中的使用情况，推断变量的类型
## 类型注解
- 建议尽可能使用类型注解
- 注解变量`变量名:type`
- 注解函数返回值`function 函数名():type`
## flow支持的类型
- 原始类型：JS原始数据类型
- 有结构的类型：对象（对象，数组，函数等）
### 原始类型
```js
const a:string = 'foo';
const b:number = 100；// NaN Infinity;
const c:boolean = false;
const d:null = null;
const e:void = undefined; // typescript可以用undefined
const f:symbol = Symbol();
```
### 数组类型
```js
const arr1:Array<number> = [1,2,3];
const arr2:number[] = [1,2,3];
// 元组
const arr3:[string,number] = ['foo',1];
```
### 对象类型
```js
const obj1:{foo:string, bar:number} = {foo:'string', bar:100};
// 可选属性
const obj2:{foo?:string, bar:number} = {bar:100};
// 限制key类型(与TypeScript语法不同)
const obj3:{[string]:string} = {};
obj3.foo = 'string';
```
### 函数类型
- 参数类型注解
- 返回值类型注解
- 函数表达式创建变量的类型注解
```js
function foo(a:number,b:number):number{
    return a + b;
}
let bar:(number,number)=>number;
bar = foo;
```
### 特殊类型
#### 字面量
限制变量必须是某一个值
```js
const a:'foo' = 'foo1'; // 报错
```
一般配合联合类型（或类型）使用

```js
const a:'foo'|'foo1'|'foo2' = 'foo1';
```
#### 联合类型(或类型)
组合几种类型或字面量值的类型
```js
const a:string|boolean|100 = false;
```
#### type关键字
- 声明一个类型
- 为类型创建一个别名
```js
type StringOrNumber = string | number;
const a:StringOrNumber = 100;
const b:StringOrNumber = 'foo';
```
#### Maybe 允许为空类型
- 允许为空：在类型之上扩展null undefined
- TypeScript没有这种类型
```js
const a:?number = null;// undefined 100
// 相当于
const b:number|null|void = null;
```
#### Mixed & Any 任意类型
- 可以接收任意类型
```js
let a:mixed = null, b:any = Symbol();
a = b = false;
a = b = null;
a = b = 'foo';
a = b = 100;
console.log(a + 'bar'); // 报错
console.log(b + 'bar'); // 不报错
```
##### 区别
- Mixed是强类型，不允许隐式类型转换。
- Any是弱类型，允许任意转换。
建议尽量使用Mixed。<br>
Any存在的意义时兼容老代码或第三方库
#### 运行环境API和内置对象
```js
const element = HTMLElement | null = document.getElementById('app');
```
##### 对应API的声明文件
- https://github.com/facebook/flow/blob/master/lib/core.js
- https://github.com/facebook/flow/blob/master/lib/dom.js
- https://github.com/facebook/flow/blob/master/lib/bom.js
- https://github.com/facebook/flow/blob/master/lib/cssom.js
- https://github.com/facebook/flow/blob/master/lib/node.js
## 了解Flow的意义
一些框架如react vue使用了Flow进行类型注解
## 第三方类型手册
https://www.saltycrane.com/cheat-sheets/flow-type/latest/


# TypeScript
- 基于Javascript基础之上的编程语言，是javascript的超集。
- 扩展功能:类型系统，支持ES6+
- 可以编译ES6+到最低ES3标准的代码，类似babel
- 任何一种javascript运行环境都支持
- 框架使用Angular/Vue.js 3.0
- 前端领域中的第二语言
- 渐进式
- 对比Flow，作为完整的编程语言，功能更强大，生态更健全、更完善，特别是开发工具
### 缺点
- 语言本身多了很多概念 接口 泛型 枚举
- 项目初期增加一些成本，小项目不适合
## 基本使用
- 安装`npm install -g typescript`
- 在`.ts`文件编写代码
- 编译`tsc`
tsc命令：typescript compile，在编译过程中，首先检查代码中类型使用异常，然后移除掉类型注解等扩展语法，自动转换ES新特性
## 配置文件
使用命令生成配置文件`tsc --init`
- target 编译后的js文件采用的标准
- module 输出的代码采用什么方式进行模块化
- outDir 输出目录
- rootDir 源代码目录
- sourcrMap 是否开启源代码映射
- strict 是否开启严格模式检查
直接使用tsc命令时才会使用配置文件，`tsc [编译文件]`不使用配置文件
## 语法与Flow类似
## 默认允许为空(null/undefined)
```js
// Flow
const a:string = null; // 报错
const b:?string = null; // 用Maybe解决

// TypeScript
const c:string = null; // 非严格模式允许为空 strict:false
const d:string = undefined; // 严格模式不允许为空报错 strict:true
// 可以设置strictNullChecks:false关闭严格模式不允许为空的校验
```
## 空类型
- Flow中的void用来注解函数返回空 和 undefined类型
- TypeScript中可以用void注解函数返回空 和 undefined，也可以用undefined注解undefined
```js
const a:void = undefined;
const b:undefined = undefined;
```
## 标准库声明
> 标准库就是内置对象所对应的声明文件。
> 在代码中使用内置对象，就要使用对应的声明文件，否则TypeScript就找不到对应的类型。
比如修改配置文件target为"ES5",ES6+新增的Symbol Promise内置对象就识别不了。
```js
Array // 不报错
Symbol // 报错
Promise // 报错
```
比如通过配置文件修改lib覆盖默认配置的标准库声明文件，令TypeScript只支持es5`"lib":["es5"]`。<br>
此时使用DOM内置对象就会报错：
```js
const element:HTMLElement|null = document.getElementById('app')
```
## TypeScript显示中文错误消息
- vsCode搜索typescript locale设置
- 建议使用英文，方便用错误消息google查询问题
## 作用域问题
- 不同文件中，有相同变量名称，Typescript会报错
使用立即执行函数创建作用域
```js
(functiono(){
    const a = 123;
})()
```
使用export将文件变为一个模块，模块拥有自己的作用域
```js
const a = 123;
export {}
```
一般项目中都是以模块形式存在，以上方案只适合演示。
## Object类型
- 并不单指普通对象，泛指所有非原始类型：对象 数组 函数
- 注意：使用时是全小写的
```js
let a:object = [];
a = new Boolean(true);
a = new String('foo');
a = () => {};
a = {};
```
普通对象类型注解：
```js
const a:{} = {};
const b:{foo:number, bar:number} = {foo:1, bar:2};
```
- 普通对象类型，限制了值的结构必须和类型结构一致
- 对象类型注解，一般使用Interface接口类型
## 数组类型
和flow几乎完全一致
```js
function sum(...args:number[]) {
    return args.reduce((prev,current)=>prev+current);
}
sum(1,2,3,4,5);
```
## 元组类型
- 明确元素数量以及元素类型的一个数组
- 要求值至少满足类型的结构
- 添加的元素允许的类型范围=注解的元素类型组成的联合类型
```js
const a: [number, 'foo'] = [1, 'foo'];
a.push(1);
a.push('foo')；
a.push('bar')；// 报错
```
## 枚举类型 enum
使用某几个数值代表不同的状态
- 给一组数值分别起个更好理解的名字
- 一个枚举中只会存在几个固定值，不会出现超出范围的可能性
### 使用
- enum 声明类型
- 在{}中定义具体的枚举值
- 使用等号`=`定义枚举值，不是冒号`:`，逗号`,`分隔
- 类似访问对象属性方式去使用
```js
enum StatusEnum {
    Fail = 400,
    Success = 200,
    Pending = 100
}
const status = StatusEnum.Fail;
```
- 不指定枚举的值，默认会从0开始赋值，后面的累加(+1)。
- 如果定义了某个值，后面的成员就会在这个值的基础上累加
- 枚举的值可以是数字也可以是字符串
- 字符串无法像数字可以累加，所以需要对所有成员设置枚举值
### 影响
编译后会保留一个双向的键值对对象。<br>
双向：可以通过值获取键，也可以通过键获取值。<br>
所以枚举可以像对象一样通过索引器方式访问：`StatusEnum[0]`<br>
如果代码中确认不会通过索引器方式返回枚举，可以使用const创建 **常量枚举** ，这样编译后就不会保留枚举对象。`const enum StatusEnum{}`
## 函数类型
- 对函数的输入（参数）输出（返回值）进行约束。
### 函数声明定义函数
```js
// 限制了函数调用的参数数量，不能少不能多
function sum (a:number,b:number):string{
    return String(a + b);
}
sum(100,100);
```
```js
// 使用可选参数或函数默认值允许参数可以少
function sum(a:number,b:number=100):string{
    return String(a + b);
}
sum(100);
// or
function sum(a:number,b?:number):string{
    return String(a + b);
}
sum(100);
```
```js
// 使用rest扩展运算符，允许多传参数
function sum(a:number,b:number,...rest:number[]):string{
    return String(a + b);
}
sum(100,2,3,4,5,6);
```
### 函数表达式定义函数
```js
const func:(number,number)=>string = function (a:number,b:number):string {
    return 'foo';
}
```
## 任意类型 Any
- 有些内置对象API本身允许接收任意类型的参数，如JSON.stringify()
- any是弱类型、动态类型，允许隐式转换，允许修改值的类型
- any类型不会有任何的类型检查
## 隐式类型推断
- 未进行类型注解的变量，TypeScript根据变量的使用推断变量的类型
- 建议为每个变量添加明确的类型注解
```js
let a = 18; // 相当于将a注解为number类型
let b; // 相当于将b注解为any类型
```
## 类型断言
某些特殊情况下，TS无法推断一个变量的具体类型。
```js
const nums = [1,2,3,4];
const res = nums.find(i => i===3);
// TS根据find推断res是个number|null类型
// 直接使用res去运算，TS会报错
console.log(res * res);
// 但我们清楚，res肯定会返回一个数字，所以需要告诉TS这个变量一定是个什么类型
// 使用as断言
console.log((res as number) * (res as number));
// 或使用标签断言
console.log(<number>res * <number>res)
```
- 标签方式与JSX标签冲突，建议使用`as`
- 断言不是类型转换，断言是在编译阶段的判断，编译后断言会被移除。
## 接口 Interface
- 一种规范、契约
- 约束对象的结构，应该有哪些成员，以及成员的类型
- 一个对象去实现一个接口，就必须拥有接口当中所约束的所有成员
- 接口类型在编译后就会被移除
### 使用
- interface 声明类型
- 在{}中定义具体的成员限制(类型注解)
- 可以用逗号`,`、分号`;`分隔，也可以省略
- 类似访问对象属性方式去使用
```js
interface Person {
    name: string,
    age: number;
    sex: 1|0
    height: number
    say(prop:string):void // 定义方法 'prop'代表形参，而不是定义形参的名称
}
const p:Person = {
    name: 'jack',
    age: 18,
    sex: 1,
    height: 180,
    say: (name)=>{
        console.log(name)
    }
}
```
### 可选成员
```js
interface Person {
    name: string
    age?: number // number|null|undefined
}
const p:Person = {
    name: 'jack'
}
```
### 只读成员 readonly
使用readonly修饰的变量在初始化完成（赋值）后就不能被再次修改。
```js
interface Person {
    name: string
    readonly age: number
}
const p:Person = {
    name: 'jack',
    age: 18
}
p.age = 16 // 报错
```
### 动态成员
动态的键值，比如存储缓存，不知道成员名及它的类型。
```js
// key可以替换为任意名称，这里只是代表属性成员的名称
interface Cache {
    [key: string]: string
}
const cache: Cache = {}

cache.foo = 'value1'
cache.bar = 'value2'
```
## 类 class
### 使用ES7特性定义类的属性
> TypeScript中使用对象的属性，必须明确声明对象拥有的属性，而不是通过动态添加
```js
const obj = {}
obj.foo = 'value1' // 类型“{}”上不存在属性“foo”
class Person {
    constructor(name: string) {
        // typescript报错this中未声明name属性
        this.name = name
    }
}
```
> ES7新语法允许在class类中声明属性
```js
// 使用ES7新特性定义类属性
class Person {
    // 一般赋值工作交给构造函数
    // name = 'jack'
    // 可以只声明并添加类型注解
    name:string
    constructor(name: string) {
        // typescript报错this.name不存在
        this.name = name
    }
}
```
#### 总结
1. TypeScript中使用对象的属性，必须明确声明对象拥有的属性，而不是通过动态添加
2. Typescript可以使用ES7新语法在构造函数外声明属性。
3. Typescript会校验类属性必须有一个初始值，否则就会报错。一般在构造函数中定义。或者在声明时定义。

## 类成员的访问修饰符
- `public` 公共属性 默认就是public，建议加上，使代码容易理解
- `private` 私有属性 只能在当前类的内部访问
- `protected` 受保护的 只能在当前类或继承它的类中访问
### 控制类当中成员的可访问级别
```js
class Person {
    public name = 'Jack'
    private age = 18
    protected sex = 1
}
class Student extends Person {
    show() {
        console.log(this.name)
        console.log(this.age) // 不允许访问
        console.log(this.sex) // 允许访问
    }
}

const p = new Person()
console.log(p.name)
console.log(p.age) // 不允许访问
console.log(p.sex) // 不允许访问
```
### 修改实例化方式
- 构造函数私有化
- 创建一个静态方法，在方法中实例化并返回
```js
class Person {
    public name = 'Jack'
    private constructor(name) {
        this.name = name
    }
    static create(name) {
        return new Person(name);
    }
}

const p = Person.create('Tom')
```
## 类的只读成员
- 通过readonly修饰符将成员设置为只读的
- readonly应该跟在访问修饰符的后面
```js
class Person {
    public readonly name = 'Jack'
}
class Student {
    public readonly name
    private constructor(name) {
        this.name = name
    }
}
```
## 类与接口
- 使用interface接口去约束不同class中公共的部分
- 类class使用implements去实现接口，而不像对象一样用冒号`:`添加注解
```js
interface EatAndRun{
    name:string
    eat(foo:string):void
    run(distance:number):void
}
class Person implements EatAndRun {
    name = 'Jack'
    eat(foo:string) {
        console.log(`吃了 ${foo}`)
    }
    run(distance:number) {
        console.log(`跑了 ${distance}`)
    }
}
class Animal implements EatAndRun {
    name = '旺财'
    eat(foo:string) {
        console.log(`吃了 ${foo}`)
    }
    run(distance:number) {
        console.log(`跑了 ${distance}`)
    }
}
```
### 应用
建议每个接口的定义更简单、更细化，也就是：
- 一个接口只约束一个功能
- 一个类型同时实现多个接口
```js
interface Name{
    name:string
}
interface Eat{
    eat(foo:string):void
}
interface Run{
    run(distance:number):void
}
class Person implements Name, Eat, Run {
    name = 'Jack'
    eat(foo:string) {
        console.log(`吃了 ${foo}`)
    }
    run(distance:number) {
        console.log(`跑了 ${distance}`)
    }
}
```
## 抽象类
- 类似接口，用于约束子类当中必须要有某些成员
- 不同于接口的是，抽象类包含一些具体的实现，而接口只是成员的抽象，不包括实现
### 使用
- 使用`abstract`将class定义为抽象类
- 抽象类只能被继承，不能被实例化
- 使用`abstract`定义class的抽象方法，子类就必须去实现，可以使用vscode的代码修正功能自动生成这个方法的代码
- 抽象方法和接口一样，不需要方法体，但子类必须实现(定义)这个方法
```js
abstract class Animal {
    eat(foo:string):void {
        console.log(foo)
    }
    abstract run (n:number): void
}
class Dog extends Animal {
    run(distance: number): void {
        console.log(distance)
    }
}

const d = new Dog()
d.eat('饼干')
d.run(120)
```
## 泛型
- 定义函数、接口或类的时候没有指定具体的类型，等到使用的时候才指定具体类型的特征
- 使用上就是在定义函数、接口或类的时候，将不能明确的类型，变成一个参数（形参），使用时再传递这个类型参数（实参）
### 函数使用
- 在变量名后使用`<>`，在里面定义泛型的参数，一般用`T`作为名称
- 使用时在变量名后使用`<>`传递泛型参数的值为某个类型
```js
// 函数使用
function createArray<T> (length:number,value:T):T[] {
    return Array(length).fill(value);
}

const strArr = createArray<string>(3, 'a')
const numArr = createArray<number>(3, 1)

// 类使用
class Computer<T> {
    message:T
    constructor(message:T) {
        this.message = message
    }
    show():T {
        return this.message
    }
}
const c1 = new Computer<string>('hello')
const c2 = new Computer<number>(200)
```
## 类型声明
- 使用的第三方NPM模块并不一定通过TS编写的。
- 使用这种模块的成员时，TS不会有对应的类型提示和进行响应的类型检查。
- 这种情况就需要单独的类型声明。
- 为了兼容一些npm模块
- 有的模块包含类型声明文件。
- 社区中提供了也一些npm模块对应的类型声明模块。

### 使用总结
- 在TS中使用第三方模块
- 如果这个模块并不包含所对应的类型声明文件
- 我们可以尝试安装所对应的类型声明模块，一般是`@types/模块名`
- 如果`@types`中找不到对应的类型声明模块
- 就需要自己使用`declare`语句声明对应的模块类型
