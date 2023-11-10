let path = require("path");
let fs = require("fs");


let pathName = "../public/translate";

const str = fs.readFileSync(`${pathName}/en2zh_CN.json`, "utf8");
let translateDict = JSON.parse(str);

fs.writeFileSync(
  pathName + `/en2zh_CN-min.json`,
  JSON.stringify(translateDict)
);