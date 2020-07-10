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
