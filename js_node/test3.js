import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 路径设置
const TOTAL_RESULT_FILE = path.join(__dirname, 'save', 'normalList-fetch.json');
const TOTAL_RESULT_FILE2 = path.join(__dirname, 'save', 'unnormalList-fetch.json');
const TOTAL_RESULT_FILE3 = path.join(__dirname, 'save', 'all.json');

function s() {
  let list = []
  let linesStr = fs.readFileSync(TOTAL_RESULT_FILE, 'utf-8')
  if (linesStr) {
    let lines = JSON.parse(linesStr)
    console.log(`📦 已加载 ${lines.length} 个已爬词`);
    list = list.concat(lines);
  }

  linesStr = fs.readFileSync(TOTAL_RESULT_FILE2, 'utf-8')
  if (linesStr) {
    let lines = JSON.parse(linesStr)
    console.log(`📦 已加载 ${lines.length} 个已爬词`);
    list = list.concat(lines);
  }

// 加载已爬数据（增量去重）
  const lines = fs.readFileSync(TOTAL_RESULT_FILE3, 'utf-8').split('\n').filter(Boolean);
  let list2 = []
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      list2.push(obj);
    } catch {
    }
  }
  list = list.concat(list2);
  console.log(`📦 已加载 ${list2.length} 个已爬词`);

  const existingMap = new Map();
  list.map(v => {
    existingMap.set(v.word, v)
  })

  console.log(`📦 已加载 ${list.length} 个已爬词`);
  console.log(`📦 已加载 ${existingMap.size} 个已爬词`);
  fs.writeFileSync(path.join(__dirname, 'save', 'all-all.json'), JSON.stringify(Array.from(existingMap.values())), 'utf-8');
}

s()
