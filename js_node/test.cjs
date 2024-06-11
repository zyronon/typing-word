let path = require("path");
let fs = require("fs");
const axios = require('axios')

let str = fs.readFileSync('./save/allNew.min.json', "utf8");

console.log('str',JSON.parse(str)[0])