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
    reject('p2')
  })
}

MyPromise.all(['a', 'b', p1(), p2(), 'c']).then(result => {
  console.log(result)
}, console.log)
