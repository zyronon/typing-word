let path = require("path");
let fs = require("fs");
const axios = require('axios')

let str = fs.readFileSync('./save/allNew.min.json', "utf8");
let failStr = fs.readFileSync('./fail.txt', "utf8");
let source = "./source/";
let result = "./result/";

let allNew = JSON.parse(str)
let map = new Map()
allNew.forEach(item => {
  if (item && item.word) {
    map.set(item.word, item);
  }
})


let failList = JSON.parse(failStr)
let list = JSON.parse(str)

//判断是不是目录
const dirs = fs.readdirSync(source)
dirs.forEach(dictName => {
  formatDict(source, dictName)
})

async function sleep(val) {
  return new Promise(resolve => {
    setTimeout(resolve, val)
  })
}

function formatDict(path, name) {
  try {
    let newObj = []
    let str = fs.readFileSync(path + name, "utf8");
    let list = JSON.parse(str)
    list.map(v => {
      if (!v) return
      let r = map.get(v.word);
      if (r) {
        newObj.push(r)
      }
    })

    // fs.writeFileSync(result + name.replace('.json', '_word.json'), JSON.stringify(newObj));
    fs.writeFileSync(result + name.replace('.json', '_word.json'), JSON.stringify(newObj,null, 2));
    console.log(name, newObj.length)
  } catch (e) {
    console.log('err', name, e)
  }
}

