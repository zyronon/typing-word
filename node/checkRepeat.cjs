let path = require("path");
let fs = require("fs");

const str = fs.readFileSync("../public/dicts/en/cn/translate.json", "utf8");
let translateDict = JSON.parse(str);

let pathName = "../public/dicts/en/cn";

let newDicts = []

//判断是不是目录
const dirs = fs.readdirSync(pathName)
dirs.forEach(dictName => {
  if (!dictName.includes('translate.json')) {
    let dictPath = path.join(pathName, dictName)
    console.log('d', dictPath)
    formatDict(dictPath)
  }
})


function formatDict(path) {
  try {
    const str = fs.readFileSync(path, "utf8");
    let dicts = JSON.parse(str);

    newDicts = newDicts.concat(dicts)

    console.log(dicts.length);
    console.log(newDicts.length);
    newDicts = Array.from(new Set(newDicts))
    console.log(newDicts.length);


    // fs.writeFileSync(
    //   path,
    //   JSON.stringify(dicts, null, 2)
    // );
  } catch (e) {
    console.log('err', e)
  }
}

