let path = require("path");
let fs = require("fs");
const axios = require('axios')

let str = fs.readFileSync('./save/allNew.min.json', "utf8");
let failStr = fs.readFileSync('./fail.txt', "utf8");

let failList = JSON.parse(failStr)
let list = JSON.parse(str)

async function sleep(val) {
  return new Promise(resolve => {
    setTimeout(resolve, val)
  })
}

let s = []

function fail(word) {
  s.push(word)
  console.log('失败：', s.length)
  fs.writeFileSync('./failWord.txt', JSON.stringify(s, null, 2));
}

// console.log('failList',failList)
async function test() {
  for (let i = 0; i < list.length; i++) {
    // for (let i = 0; i < 3000; i++) {
    let v = list[i]
    if (failList.includes(v.word)) {
      console.log('进度', v.word)
      fail(v)
    }
  }
}

test()
