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