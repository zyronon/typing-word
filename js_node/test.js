import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 路径设置
const SOURCE_DIR = path.join(__dirname, 'source');
const RESULT_DIR = path.join(__dirname, 'result');
const TOTAL_RESULT_FILE = path.join(__dirname, 'save', 'all.json');
const TOTAL_RESULT_FILE2 = path.join(__dirname, 'save', 'all2.json');
const FAILED_FILE = path.join(__dirname, 'save', 'failed.json');


let existingMap = new Map();
// 加载已爬数据（增量去重）
if (fs.existsSync(TOTAL_RESULT_FILE)) {
  let linesStr = fs.readFileSync(TOTAL_RESULT_FILE, 'utf-8')
  if (linesStr) {
    let lines = JSON.parse(linesStr)
    for (const line of lines) {
      if (!existingMap.has(line.word)) {
        fs.appendFileSync(TOTAL_RESULT_FILE2, JSON.stringify(line) + '\n', 'utf-8');
        existingMap.set(line.word.toLowerCase(), line);
      }
    }
    console.log(`📦 已加载 ${lines.length} 个已爬词`);
    console.log(`📦 已加载 ${existingMap.size} 个已爬词`);
  }

}

// 追加写入总文件
function appendToAll(result) {
}
