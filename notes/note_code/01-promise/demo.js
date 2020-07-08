function p1() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('p1')
    }, 2000)
  })
}
function p2() {
  return new Promise((resolve, reject) => {
    reject('p2')
  })
}

Promise.all(['a', 'b', p1(), p2(), 'c']).then(result => {
  // p1 p2同时调用,应该先返回p2再返回p1,且都在a b c后面
  // 但是最终返回结果:
  // result -> ['a', 'b', 'p1', 'p2', 'c']
  console.log(result)
})