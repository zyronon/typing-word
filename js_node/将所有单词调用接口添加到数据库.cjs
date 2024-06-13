let path = require("path");
let fs = require("fs");
const axios = require('axios')

//这里一开始读取的是allNew.min.json文件,因为这个文件是之前生成的,就直接用了
//后面如果这个文件没了,也可以读取从git下载下来的词典,不过要先汇总去重

//这里调接口添加单词,添加失败的会写到fail.txt
//然后总一个文件会去allNew.min.json里面查失败的单词,放到failWord.txt文件
//然后又执行这个脚本,不过是从failWord.txt里面读
//感觉多此一举了
// let str = fs.readFileSync('./failWord.txt', "utf8");
let str = fs.readFileSync('./allNew.min.json', "utf8");
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
