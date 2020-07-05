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
}

module.exports = MyPromise
