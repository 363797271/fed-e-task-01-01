# 手写Promise源码

## Promise 核心逻辑实现

1. 使用Promise需要创建一个promise对象实例，所以Promise就是一个类class（或构造函数）。
2. 在创建Promise时，需要传递一个立即执行的函数作为参数，这个函数称作“执行器”。
3. 执行器在实例化Promise时立即执行，它包含两个函数参数resolve和reject，调用它们，就会更改promise的状态。
4. Promise有3种状态，分别为：等待pending、成功resolved/fulfilled、失败rejected
5. Promise的状态变更只能是以下的变化：
   1. 调用resolve()：pending -> fulfilled 等待到成功
   2. 调用reject()：pending -> rejected 等待到失败
6. Promise 一旦状态确定就不可更改。
7. 调用resolve和reject更改promise的状态：
   1. resolve传递的参数就是成功的值
   2. reject传递的参数就是失败的原因
8. promise对象包含一个then方法
   1. then方法内部做的事情就是判断状态
   2. 它接受两个回调函数作为参数
      1. 参数1-成功回调：状态成功时调用
         1. 接受一个参数，表示成功之后的值
      2. 参数2-失败回调：状态失败时调用
         1. 接受一个参数：表示失败之后的原因

实现以上内容：

```js
// 使用
const MyPromise = require('./myPromise')

let promise = new MyPromise((resolve, reject) => {
  resolve('成功')
	reject('失败')
})

promise.then(
  value => {
    console.log(value)
  },
  reason => {
    console.error(reason)
  }
)
```

```js
// 状态使用常量枚举
// 使用常量的好处是：编辑器有提示
const PENDING = 'pending' // 等待
const FULFILLED = 'fulfilled' // 等待
const REJECTED = 'rejected' // 等待

class MyPromise {
  constructor(executor) {
    executor(this.resolve, this.reject)
  }

  // Promise状态：初始值为pending
  status = PENDING
  // 成功之后的值
  value = undefined
  // 失败之后的原因
  reason = undefined

  // 使用箭头函数
  // 使resolve reject方法内部的this指向实例化的Promise对象
  // 而不是实例化操作时所属的上下文（window或其他）
  resolve = value => {
    // 如何状态不是等待，阻止程序向下执行
    if (this.status !== PENDING) return
    // 将状态更改为成功
    this.status = FULFILLED
    // 保存成功之后的值
    this.value = value
  }

  reject = reason => {
    // 如何状态不是等待，阻止程序向下执行
    if (this.status !== PENDING) return
    // 将状态更改为失败
    this.status = REJECTED
    // 保存失败之后的原因
    this.reason = reason
  }

  // then内部的this需要指向调用它的上下文
  then(successCallback, failCallback) {
    // 判断状态
    if (this.status === FULFILLED) {
      successCallback(this.value)
    } else if (this.status === REJECTED) {
      failCallback(this.reason)
    }
  }
}

module.exports = MyPromise

```



细节注意：

1. 在promise类中定义的resolve和reject方法，使用的是箭头函数。原因是希望调用这两个方法时，内部的this指向Promise类，而不是实例化Promise时所属的上下文。

## 在Promise类中加入异步逻辑

上面实现的功能，如果执行器executor中使用了异步代码，then方法不会等待异步代码执行完，而会立即执行。

彼时，then方法内部判断的状态仍为pending，就不会执行回调函数。

所以需要在then中加入pending的判断。

当状态为pending的时候，将回调函数存储起来，在promise类调用resolve或reject时再执行对应的回调函数。

```js
// 使用
const MyPromise = require('./myPromise')

let promise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('成功')
  }, 2000)
  // reject('失败')
})

promise.then(
  value => {
    console.log(value)
  },
  reason => {
    console.error(reason)
  }
)
```

```js
// 状态使用常量枚举
// 使用常量的好处是：编辑器有提示
const PENDING = 'pending' // 等待
const FULFILLED = 'fulfilled' // 等待
const REJECTED = 'rejected' // 等待

class MyPromise {
  constructor(executor) {
    executor(this.resolve, this.reject)
  }

  // Promise状态：初始值为pending
  status = PENDING
  // 成功之后的值
  value = undefined
  // 失败之后的原因
  reason = undefined
  // 成功回调
  successCallback = undefined
  // 失败回调
  failCallback = undefined

  // 使用箭头函数
  // 使resolve reject方法内部的this指向实例化的Promise对象
  // 而不是实例化操作时所属的上下文（window或其他）
  resolve = value => {
    // 如何状态不是等待，阻止程序向下执行
    if (this.status !== PENDING) return
    // 将状态更改为成功
    this.status = FULFILLED
    // 保存成功之后的值
    this.value = value
    // 判断成功回调是否存在，如果存在就调用
    this.successCallback && this.successCallback(value)
  }

  reject = reason => {
    // 如何状态不是等待，阻止程序向下执行
    if (this.status !== PENDING) return
    // 将状态更改为失败
    this.status = REJECTED
    // 保存失败之后的原因
    this.reason = reason
    // 判断失败回调是否存在，如果存在就调用
    this.failCallback && this.failCallback(reason)
  }

  // then内部的this需要指向调用它的上下文
  then(successCallback, failCallback) {
    // 判断状态
    if (this.status === FULFILLED) {
      successCallback(this.value)
    } else if (this.status === REJECTED) {
      failCallback(this.reason)
    } else {
      // 等待
      // 将成功回调和失败回调存储起来
      this.successCallback = successCallback
      this.failCallback = failCallback
    }
  }
}

module.exports = MyPromise

```

## 实现 then 方法多次调用

**同一个** promise 对象下的then方法可以多次调用（注意本节不是链式调用）。

当then方法被多次调用时，每个then方法中传递的回调都会执行。

如果执行器中是**同步代码**，多次调用then方法不会冲突。

如果执行器中是**异步代码**，那多次调用then方法，最终执行的回调就是最后存储的回调。

所以需要将每个then方法的回调，都存储下来，在状态变更后执行它们。

并且在执行完后，从存储的回调列表中清除掉。

```js
// 使用
const MyPromise = require('./myPromise')

let promise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    // resolve('成功')
    reject('失败')
  }, 2000)
})

promise.then(
  value => {
    console.log('then1:', value)
  },
  reason => {
    console.log('then1:', reason)
  }
)
promise.then(
  value => {
    console.log('then2:', value)
  },
  reason => {
    console.log('then2:', reason)
  }
)
promise.then(
  value => {
    console.log('then3:', value)
  },
  reason => {
    console.log('then3:', reason)
  }
)

```

```js
// 状态使用常量枚举
// 使用常量的好处是：编辑器有提示
const PENDING = 'pending' // 等待
const FULFILLED = 'fulfilled' // 等待
const REJECTED = 'rejected' // 等待

class MyPromise {
  constructor(executor) {
    executor(this.resolve, this.reject)
  }

  // Promise状态：初始值为pending
  status = PENDING
  // 成功之后的值
  value = undefined
  // 失败之后的原因
  reason = undefined
  // 成功回调
  successCallback = []
  // 失败回调
  failCallback = []

  // 使用箭头函数
  // 使resolve reject方法内部的this指向实例化的Promise对象
  // 而不是实例化操作时所属的上下文（window或其他）
  resolve = value => {
    // 如何状态不是等待，阻止程序向下执行
    if (this.status !== PENDING) return
    // 将状态更改为成功
    this.status = FULFILLED
    // 保存成功之后的值
    this.value = value
    // 判断成功回调是否存在，如果存在就调用
    // 从前往后执行并清理
    while (this.successCallback.length) this.successCallback.shift()(value)
  }

  reject = reason => {
    // 如何状态不是等待，阻止程序向下执行
    if (this.status !== PENDING) return
    // 将状态更改为失败
    this.status = REJECTED
    // 保存失败之后的原因
    this.reason = reason
    // 判断失败回调是否存在，如果存在就调用
    // 从前往后执行并清理
    while (this.failCallback.length) this.failCallback.shift()(reason)
  }

  // then内部的this需要指向调用它的上下文
  then(successCallback, failCallback) {
    // 判断状态
    if (this.status === FULFILLED) {
      successCallback(this.value)
    } else if (this.status === REJECTED) {
      failCallback(this.reason)
    } else {
      // 等待
      // 将成功回调和失败回调存储起来
      this.successCallback.push(successCallback)
      this.failCallback.push(failCallback)
    }
  }
}

module.exports = MyPromise

```

## 实现 then 方法的链式调用（一）

promise对象可以链式调用then方法。

后面then方法的回调函数接受的参数其实是上一个then方法的 **成功(resolve)** 回调函数返回的值。

### 首先实现then方法的链式调用

then方法是promise对象的方法，可以通过让then方法返回一个promise对象，实现它的链式调用。

在then方法中创建一个promise对象，将原来的执行代码放入到执行器方法中。

then方法最终返回这个promise对象。

```js
then(successCallback, failCallback) {
  // 创建一个promise对象
  let promise2 = new MyPromise(() => {
    if (this.status === FULFILLED) {
      successCallback(this.value)
    } else if (this.status === REJECTED) {
      failCallback(this.reason)
    } else {
      this.successCallback.push(successCallback)
      this.failCallback.push(failCallback)
    }
  })
  // 最终返回这个promise对象
  return promise2
}
```

### 其次实现then方法回调函数接受上一个then方法成功回调函数的返回值

执行器中如果是同步代码，获取then方法回调函数执行后的返回值，作为参数，传递给新建promise对象时执行器中resolve或reject方法。

```js
// 使用
const MyPromise = require('./myPromise')

let promise = new MyPromise((resolve, reject) => {
  resolve('成功')
})

promise.then(
  value => {
    console.log(value)
    return 100
  }
).then(
  value => {
    console.log(value)
  }
)

```

```js
then(successCallback, failCallback) {
  // 创建一个promise对象
  let promise2 = new MyPromise((resolve, reject) => {
    // 判断状态
    if (this.status === FULFILLED) {
      let x = successCallback(this.value)
      resolve(x)
    } else if (this.status === REJECTED) {
      failCallback(this.reason)
    } else {
      // 等待
      // 将成功回调和失败回调存储起来
      this.successCallback.push(successCallback)
      this.failCallback.push(failCallback)
    }
  })
  // 最终返回这个promise对象
  return promise2
}
```

## 实现 then 方法的链式调用（二）

在then方法的