let path = require("path");
let fs = require("fs");
const axios = require('axios')

let str = fs.readFileSync('./failWord.txt', "utf8");
let failList = []
let list = JSON.parse(str)

async function sleep(val) {
  return new Promise(resolve => {
    setTimeout(resolve, val)
  })
}

function fail(word) {
  failList.push(word)
  console.log('失败：', failList.length)
  fs.writeFileSync('./fail.txt', JSON.stringify(failList, null, 2));
}

async function test() {
  for (let i = 0; i < list.length; i++) {
    let v = list[i]
    console.log('进度', i)
    await sleep(100)
    axios({
      url: 'http://localhost/index.php/v1/support/addWord',
      method: 'post',
      data: v
    }).then(r => {
      if (!r.data.success) {
        fail(v.word)
      }
    }).catch(r => {
      fail(v.word)
    })
  }
}


test()
