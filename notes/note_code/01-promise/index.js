const MyPromise = require('./myPromise')

let promise = new MyPromise((resolve, reject) => {
  resolve('成功')
  // setTimeout(() => {
  //   // resolve('成功')
  //   reject('失败')
  // }, 2000)
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
