let path = require("path");
let fs = require("fs");

let fileName = '../public/translate/en2zh_CN.json'
let fileNameWords = '../public/translate/en2zh_CN.words.json'
let read = './format/'
let save = "./format2/";
let standardDictNames = []

//判断是不是目录
const dirs = fs.readdirSync(read)
dirs.forEach(dictName => {
  formatDict(read, dictName)
})

// formatDict(read, 'BEC_2.min.json')

fs.writeFileSync(save + 'standardDictNames.json', JSON.stringify(standardDictNames, null, 2));

function formatDict(path, name) {
  try {
    let str = fs.readFileSync(path + name, "utf8");
    let list = JSON.parse(str)
    let standardName = name.replace('.min', '')
    standardDictNames.push(standardName)
    fs.writeFileSync(save + standardName, JSON.stringify(list, null, 2));
    fs.writeFileSync(save + standardName.replace('.json', '.min.json'), JSON.stringify(list));
  } catch (e) {
    console.log('err', name, e)
  }
}

