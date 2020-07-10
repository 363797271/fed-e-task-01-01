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

## 实现 then 方法的【同步】链式调用

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

### 在then的回调中返回promise

在then方法的回调函数中，可以返回一个普通值，也可以返回一个promise对象。

then方法返回的promise对象中判断回调函数返回的promise对象的状态。

如果是成功，则调用resolve()，如果是失败，则调用reject()。

由于这个逻辑在promise状态在以下情况都要使用：

1. then回调为同步代码：promise对象状态是成功时执行。
2. then回调为同步代码：promise对象状态时失败时执行。
3. then回调为异步代码：执行回调时同样根据状态去执行。

所以需要把它写在一个公共函数（比如解析promise函数：resolvePromise）中，需要时调用即可。

resolvePromise函数接收3个参数：

1. 回调返回的结果
2. then中创建promise的执行器的resolve和reject方法

```js
// 使用
const MyPromise = require('./myPromise')

let promise = new MyPromise((resolve, reject) => {
  resolve('成功')
})

function other() {
  return new MyPromise((resolve, reject) => {
    resolve('other')
  })
}

promise.then(
  value => {
    console.log(value)
    return other()
  }
).then(
  value => {
    console.log(value)
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
    // 创建一个promise对象
    let promise2 = new MyPromise((resolve, reject) => {
      // 判断状态
      if (this.status === FULFILLED) {
        let x = successCallback(this.value)
        /** 封装逻辑
         * 判断 x 的值是普通值还是promise对象
         * 普通值：直接调用resolve
         * promise对象：
         *   查看promise对象返回的结果
         *   再根据promise对象返回的结果，决定调用resolve 还是 reject
         */
        resolvePromise(x, resolve, reject)
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
}

function resolvePromise(x, resolve, reject) {
  if (x instanceof MyPromise) {
    // promise 对象
    // 调用promise对象的then方法
    // 如果成功会调用第一个回调，失败则调用第二个回调
    x.then(resolve, reject)
  } else {
    // 普通值
    resolve(x)
  }
}

module.exports = MyPromise

```

### then方法链式调用识别Promise对象自返回

在then方法的回调中，不能返回当前这个then方法所返回的promise对象（自返回）。

如果then方法回调返回了then方法所返回的promise对象，就会造成循环调用这个promise对象，程序就会报错。

运行以下代码查看：

```js
var promise = new Promise((resolve, reject) => {
  resolve(100)
})

var p1 = promise.then(value => {
  console.log(value)
  // 返回了then方法返回的对象(自己)
  return p1
})
// 首先正常打印100
// 然后报错：TypeError: Chaining cycle detected for promise #<Promise>
// promise对象被循环调用
```

这个错误会导致p1的状态为失败，并将这个错误信息作为失败原因传递给reject方法。

```js
var promise = new Promise((resolve, reject) => {
  resolve(100)
})

var p1 = promise.then(value => {
  console.log(value)
  // 返回了then方法返回的对象(自己)
  return p1
})

p1.then(() => {}, reason => {
  console.log(reason.message)
})
// 正常打印 100
// 正常打印 错误信息 Chaining cycle detected for promise #<Promise>
```

修改自定义的promise代码，只需要将回调返回的结果与then方法创建的promise对象对比即可判断出来。

扩展resolvePromise方法：

```js
// then内部的this需要指向调用它的上下文
then(successCallback, failCallback) {
  // 创建一个promise对象
  let promise2 = new MyPromise((resolve, reject) => {
    // 判断状态
    if (this.status === FULFILLED) {
      let x = successCallback(this.value)
      /** 封装逻辑
         * 判断 x 的值是普通值还是promise对象
         * 普通值：直接调用resolve
         * promise对象：
         *   查看promise对象返回的结果
         *   再根据promise对象返回的结果，决定调用resolve 还是 reject
         */
      resolvePromise(promise2, x, resolve, reject)
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

```js
function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    // 循环调用报的时ypeError错误,拷贝原生Promise的错误提示
    // 使用return防止代码继续向下执行
    return reject(new TypeError('TypeError: Chaining cycle detected for promise #<Promise>'))
  }
  if (x instanceof MyPromise) {
    // promise 对象
    // 调用promise对象的then方法
    // 如果成功会调用第一个回调，失败则调用第二个回调
    x.then(resolve, reject)
  } else {
    // 普通值
    resolve(x)
  }
}
```

现在有个问题，向resolvePromise中传递promise2时，promise2还在创建中，所以还获取不到。

解决方法就是将这段使用写成一个异步代码，promise2就会先被同步创建，在异步代码执行时，就可以获取到它了。

```js
// then内部的this需要指向调用它的上下文
then(successCallback, failCallback) {
  // 创建一个promise对象
  let promise2 = new MyPromise((resolve, reject) => {
    // 判断状态
    if (this.status === FULFILLED) {
      setTimeout(() => {
        let x = successCallback(this.value)
        /** 封装逻辑
           * 判断 x 的值是普通值还是promise对象
           * 普通值：直接调用resolve
           * promise对象：
           *   查看promise对象返回的结果
           *   再根据promise对象返回的结果，决定调用resolve 还是 reject
           */
        resolvePromise(promise2, x, resolve, reject)
      }, 0)
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

```js
// 使用
const MyPromise = require('./myPromise')

let promise = new MyPromise((resolve, reject) => {
  resolve('成功')
})

let p1 = promise.then(
  value => {
    console.log(value)
    return p1
  }
)

p1.then(
  value => {
    console.log(value)
  },
  reason => {
    console.log(reason.message)
  }
)
```

### 捕获错误及then链式调用其他状态代码补充

#### 1. 捕获执行器中的错误

当执行器发生错误的时候，将promise的状态变更为失败，在then的第二个回调参数中捕获到错误信息。

在promise类的构造函数中，将执行器包括在try catch中

```js
constructor(executor) {
  try {
    executor(this.resolve, this.reject)
  } catch (e) {
    // 捕获执行器的错误
    this.reject(e)
  }
```

```js
// 使用
const MyPromise = require('./myPromise')

let promise = new MyPromise((resolve, reject) => {
  throw new Error('executor error')
  resolve('成功')
})

promise.then(
  value => {
    console.log(value)
  },
  reason => {
    console.log(reason.message)
  }
)

```

#### 2. 捕获then方法回调函数中的错误

then方法回调函数执行中发生错误，要在下一个then方法的第二个回调中捕获到。

将回调函数执行并返回的部分包裹在try catch中

```js
// then内部的this需要指向调用它的上下文
then(successCallback, failCallback) {
  // 创建一个promise对象
  let promise2 = new MyPromise((resolve, reject) => {
    // 判断状态
    if (this.status === FULFILLED) {
      setTimeout(() => {
        try {
          let x = successCallback(this.value)
          /** 封装逻辑
             * 判断 x 的值是普通值还是promise对象
             * 普通值：直接调用resolve
             * promise对象：
             *   查看promise对象返回的结果
             *   再根据promise对象返回的结果，决定调用resolve 还是 reject
             */
          resolvePromise(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      }, 0)
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

```js
// 使用
const MyPromise = require('./myPromise')

let promise = new MyPromise((resolve, reject) => {
  resolve('成功')
})

promise.then(
  value => {
    console.log(value)
    throw new Error('then error')
  },
  reason => {
    console.log(reason.message)
  }
).then(
  value => {
    console.log(value)
  },
  reason => {
    console.log('then2:', reason.message)
  }
)

```

## 处理同步失败情况以及【异步】情况

当前只处理了then方法回调同步代码成功的情况。

现在为失败情况，以及异步代码时的情况添加处理。

#### 同步失败情况

同同步成功情况，一样，复制处理以下：

```js
// then内部的this需要指向调用它的上下文
then(successCallback, failCallback) {
  // 创建一个promise对象
  let promise2 = new MyPromise((resolve, reject) => {
    // 判断状态
    if (this.status === FULFILLED) {
      setTimeout(() => {
        try {
          let x = successCallback(this.value)
          /** 封装逻辑
             * 判断 x 的值是普通值还是promise对象
             * 普通值：直接调用resolve
             * promise对象：
             *   查看promise对象返回的结果
             *   再根据promise对象返回的结果，决定调用resolve 还是 reject
             */
          resolvePromise(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      }, 0)
    } else if (this.status === REJECTED) {

      setTimeout(() => {
        try {
          let x = failCallback(this.reason)
          resolvePromise(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      }, 0)
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

```js
// 使用
const MyPromise = require('./myPromise')

let promise = new MyPromise((resolve, reject) => {
  reject('失败')
})

promise.then(
  value => {
    console.log(value)
  },
  reason => {
    console.log(reason)
    return 10000
  }
).then(
  value => {
    console.log(value)
  }
)

```

#### 异步情况

将setTimeout处理包裹在一个函数中，存储在回调列表中。

并且在resolve和reject中调用回调函数时，就不用传值了。

```js
resolve = value => {
  // 如何状态不是等待，阻止程序向下执行
  if (this.status !== PENDING) return
  // 将状态更改为成功
  this.status = FULFILLED
  // 保存成功之后的值
  this.value = value
  // 判断成功回调是否存在，如果存在就调用
  // 从前往后执行并清理
  while (this.successCallback.length) this.successCallback.shift()()
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
  while (this.failCallback.length) this.failCallback.shift()()
}

// then内部的this需要指向调用它的上下文
then(successCallback, failCallback) {
  // 创建一个promise对象
  let promise2 = new MyPromise((resolve, reject) => {
    // 判断状态
    if (this.status === FULFILLED) {
      setTimeout(() => {
        try {
          let x = successCallback(this.value)
          /** 封装逻辑
             * 判断 x 的值是普通值还是promise对象
             * 普通值：直接调用resolve
             * promise对象：
             *   查看promise对象返回的结果
             *   再根据promise对象返回的结果，决定调用resolve 还是 reject
             */
          resolvePromise(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      }, 0)
    } else if (this.status === REJECTED) {

      setTimeout(() => {
        try {
          let x = failCallback(this.reason)
          resolvePromise(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      }, 0)
    } else {
      // 等待
      // 将成功回调和失败回调存储起来
      this.successCallback.push(() => {
        setTimeout(() => {
          try {
            let x = successCallback(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      })
      this.failCallback.push(() => {
        setTimeout(() => {
          try {
            let x = failCallback(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      })
    }
  })
  // 最终返回这个promise对象
  return promise2
}
```

```js
// 使用
const MyPromise = require('./myPromise')

let promise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('成功')
  }, 2000)
})

promise.then(
  value => {
    console.log(value)
    return 2000
  }
).then(
  value => {
    console.log(value)
  }
)

```

目前已经实现了大部分promise的核心功能。

## 将then方法的参数变成可选参数

then方法的两个参数都是可选参数，也就是调用then方法时可以不传递任何参数。

当调用then方法时不传递任何参数，promise会将状态（结果和值）依次传递，直到有回调函数的then方法中。

```js
let promise = new Promise((resolve, reject) => {
  resolve('成功')
})

promise
  .then()
  .then()
  .then(value => console.log(value))
// 打印 成功
```

这种效果就类似在then方法中执行了返回值的回调：

```js
let promise = new Promise((resolve, reject) => {
  resolve('成功')
})

promise
  .then(value => value)
  .then(value => value)
  .then(value => console.log(value))
```

所以可以在then方法中判断是否有参数，如果没有，则为它补充这样一个参数。

失败也是一样，但要用throw抛出一个错误才能将失败状态传递下去。

```js
// then内部的this需要指向调用它的上下文
  then(successCallback, failCallback) {
    // 补充回调
    successCallback = successCallback ? successCallback : value => value
    failCallback = failCallback ? failCallback : reason => { throw reason }
    // 创建一个promise对象
    let promise2 = new MyPromise((resolve, reject) => {
      // 判断状态
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            let x = successCallback(this.value)
            /** 封装逻辑
             * 判断 x 的值是普通值还是promise对象
             * 普通值：直接调用resolve
             * promise对象：
             *   查看promise对象返回的结果
             *   再根据promise对象返回的结果，决定调用resolve 还是 reject
             */
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      } else if (this.status === REJECTED) {
        
        setTimeout(() => {
          try {
            let x = failCallback(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      } else {
        // 等待
        // 将成功回调和失败回调存储起来
        this.successCallback.push(() => {
          setTimeout(() => {
            try {
              let x = successCallback(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
        this.failCallback.push(() => {
          setTimeout(() => {
            try {
              let x = failCallback(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
      }
    })
    // 最终返回这个promise对象
    return promise2
  }
```

```js
// 使用
const MyPromise = require('./myPromise')

let promise = new MyPromise((resolve, reject) => {
  // resolve('成功')
  reject('失败')
})

promise.then().then().then(
  value => {
    console.log(value)
  },
  reason => {
    console.log('reject:', reason)
  }
)

```

## Promise.all 方法的实现

Promise.all()是用来解决异步并发的。

它允许按照异步API（代码）调用的顺序得到它们的执行结果。

```js
function p1() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('p1')
    }, 2000)
  })
}
function p2() {
  return new Promise((resolve, reject) => {
    resolve('p2')
  })
}

Promise.all(['a', 'b', p1(), p2(), 'c']).then(result => {
  // p1 p2同时调用,应该先返回p2再返回p1,且都在a b c后面
  // 但是最终返回结果:
  // result -> ['a', 'b', 'p1', 'p2', 'c']
})
```

Promise.all()方法接收一个数组参数，数组元素可以为任意值（包括普通值和promise对象），最后返回一个promise对象。

这个数组中值的顺序，一定是all方法返回的promise对象的值的顺序。

如果all方法数组参数中所有的promise对象结果都是成功的，那all方法返回的promise对象就是成功的。

如果有一个失败，那all方法返回的promise对象就是失败的，并且不会返回所有结果。

1. 首先all方法是通过Promise类调用的，所以它一定是一个静态方法
2. all方法接收一个数组参数
3. all方法返回一个promise对象，它的值是数组参数的所有结果
4. all方法内部循环数组参数，判断是普通值还是promise对象
   1. 普通值：直接放到结果数组中
   2. promise对象：执行这个promise对象，再将它的结果放到结果数组中

```js
// 静态方法
static all(array) {
  let result = []
  function addData(key, value) {
    // 通过下标保证顺序正确
    result[key] = value
  }
  return new MyPromise((resolve, reject) => {
    for (let i = 0; i < array.length; i++) {
      let current = array[i]
      if (current instanceof MyPromise) {
        // promise 对象
        current.then(
          value => addData(i, value),
          reason => reject(reason)
        )
      } else {
        // 普通值
        addData(i, array[i])
      }
    }
    resolve(result)
  })
}
```

当前代码是有问题的，当执行的promise对象的执行器内容是异步的，在最后resolve(result)时，代码还没有执行完。会返回一个空元素。

```js
// 使用
const MyPromise = require('./myPromise')

function p1() {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('p1')
    }, 2000)
  })
}
function p2() {
  return new MyPromise((resolve, reject) => {
    resolve('p2')
  })
}

MyPromise.all(['a', 'b', p1(), p2(), 'c']).then(result => {
  console.log(result)
})
// [ 'a', 'b', <1 empty item>, 'p2', 'c' ]
```

解决方法：在addData方法中执行resolve(result)，声明一个计数器，当完成一个任务就+1，当计数器的值等于任务数量时，执行resolve(result)

```js
// 静态方法
static all(array) {
  // 结果数组
  let result = []
  // 计数器
  let index = 0
  return new MyPromise((resolve, reject) => {
    function addData(key, value) {
      // 通过下标保证顺序正确
      result[key] = value
      index++
      if (index === array.length) {
        resolve(result)
      }
    }
    for (let i = 0; i < array.length; i++) {
      let current = array[i]
      if (current instanceof MyPromise) {
        // promise 对象
        current.then(
          value => addData(i, value),
          reason => reject(reason)
        )
      } else {
        // 普通值
        addData(i, array[i])
      }
    }
  })
}
```

## Promise.resolve 方法的实现

Pormise.resolve()方法的作用，是将给定的值转化为promise对象。

即这个方法的返回值就是一个promise对象，并且这个对象包括给定的值。

resolve方法会判断给定的值：

- promise对象：就会将这个promise对象，原封不动的，作为resolve方法的值返回。
- 普通值：作为 resolve方法 返回的promise对象的值 返回。

```js
function p1 () {
  return new Promise((resolve, reject) => {
    resolve('hello')
  })
}

Promise.resolve(10).then(console.log) // 10
Promise.resolve(p1()).then(console.log) // hello
```

实现方式：

1. 在promise类中定义resolve的静态方法。
2. 在方法中判断接收的值的类型：
   1. promise对象：直接返回值
   2. 普通值：创建一个promise对象，以这个值为参数，调用执行器的resolve方法（把值包裹在promise对象中，最终返回即可）

```js
static resolve(value) {
  if (value instanceof MyPromise) {
    // promise对象
    return value
  } else {
    // 普通值
    return new MyPromise(resolve => {
      resolve(value)
    })
  }
}
```

```js
// 使用
const MyPromise = require('./myPromise')

function p1 () {
  return new MyPromise((resolve, reject) => {
    resolve('hello')
  })
}

MyPromise.resolve(10).then(console.log) // 10
MyPromise.resolve(p1()).then(console.log) // hello
```

## Promise.finally 方法的实现

Promise.finally()有以下特点：

1. 无论Promise的结果是成功还是失败，都会执行finally方法
2. 在finally方法的后面可以使用then方法获得当前promise对象最终返回的结果
   1. then方法会越过finally向上寻找最后返回的promise对象
   2. finally回调参数返回的值不会被后面的then使用
3. finally回调参数如果返回的是promise对象，后面的then方法就会等待这个对象执行完（状态变更）后才执行。
   1. 其实就是后面的then方法会等待finally回调执行完之后才执行。

```js
function p1 () {
  return new Promise((resolve, reject) => {
    resolve('hello')
  })
}

function p2 () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('waiting end')
    }, 2000)
  })
}

// p1().finally(() => {
//   console.log('finally')
//   return 'finally return' // 返回值未被使用
// }).then(console.log)

// finally
// hello

// ------

p1().finally(() => {
  console.log('finally')
  return p2()
}).then(console.log) // then会等待finally返回的promise对象状态变更后才执行
```

实现特点1：

1. 首先确定，finally方法不是promise类的静态方法，需要定义在promise对象的原型对象中（即promise类）
2. finally方法接收一个回调函数作为参数
3. 如何在finally方法内获得当前promise对象的结果状态
   1. 可以通过调用当前promise对象的then方法获得

实现特点2：

1. 实现finally方法后可以链式调用then方法
   1. finally最终返回一个promise对象即可
   2. finally方法中调用的then方法，返回的就是promise对象，将这个对象直接返回即可。
   3. 还需要在这个then方法的回调中，接收成功的值或失败原因，并最终返回或抛出错误。

实现特点3：

1. 使用promise类的resolve方法执行finally回调，在执行完毕后返回当前promise对象的值或失败原因。
2. 并将resolve方法调用then后的promise对象返回。
3. 这样就可以实现后面的then方法，会在等待finally的回调方法执行完才执行

```js
finally(callback) {
  return this.then(
    value => {
      return MyPromise.resolve(callback()).then(() => value)
    },
    reason => {
      return MyPromise.resolve(callback()).then(() => {
        throw reason
      })
    }
  )
}
```



```js
// 使用
const MyPromise = require('./myPromise')

function p1 () {
  return new MyPromise((resolve, reject) => {
    resolve('hello')
  })
}

function p2 () {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('waiting end')
    }, 2000)
  })
}

// p1().finally(() => {
//   console.log('finally')
//   return 'finally return' // 返回值未被使用
// }).then(console.log)

// finally
// hello

// ------

p1().finally(() => {
  console.log('finally')
  return p2()
}).then(console.log) // then会等待finally返回的promise对象状态变更后才执行
```

## 实现 catch 方法

promise对象的catch方法用于处理promise对象失败的情况。

这就表示调用then方法的时候，是不需要传递 失败回调 的。

当then方法不传递 失败回调 时，失败的情况就会被后面的catch方法捕获。

catch方法会执行传入的回调函数。

并且后面还可以链式调用promise对象的方法。

其实就相当于：

1. catch回调的内部执行then方法，并返回它。
2. 并且这个then方法只需要接收失败回调（成功回调传undefined）
3. 而这个失败回调就是catch方法的回调函数参数

```js
catch(failCallback) {
  return this.then(undefined, failCallback)
}
```

```js
// 使用
const MyPromise = require('./myPromise')
const { resolve } = require('./myPromise')

function p1() {
  return new MyPromise((resolve) => {
    resolve('成功')
  })
}

p1()
  .then(value => {
    console.log(value)
    throw new Error('then抛出错误')
  })
  .catch(reason => {
    console.log('catch:', reason.message)
    return 100
  })
  .then(console.log)

```

catch方法用于处理promise对象失败的情况。

它其实内部也是调用then方法，只不过不注册成功回调方法。

