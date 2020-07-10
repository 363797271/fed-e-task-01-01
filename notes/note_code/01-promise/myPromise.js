// 状态使用常量枚举
// 使用常量的好处是：编辑器有提示
const PENDING = 'pending' // 等待
const FULFILLED = 'fulfilled' // 等待
const REJECTED = 'rejected' // 等待

class MyPromise {
  constructor(executor) {
    try {
      executor(this.resolve, this.reject)
    } catch (e) {
      // 捕获执行器的错误
      this.reject(e)
    }
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
    // 补充回调
    successCallback = successCallback ? successCallback : value => value
    failCallback = failCallback
      ? failCallback
      : reason => {
          throw reason
        }
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

  catch(failCallback) {
    return this.then(undefined, failCallback)
  }

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
}

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    // 循环调用报的时ypeError错误,拷贝原生Promise的错误提示
    // 使用return防止代码继续向下执行
    return reject(
      new TypeError('TypeError: Chaining cycle detected for promise #<Promise>')
    )
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

module.exports = MyPromise
