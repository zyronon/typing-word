import fs from 'fs';
import path from 'path';
import {chromium} from 'playwright';
import pLimit from 'p-limit';
import {fileURLToPath} from 'url';
import dayjs from 'dayjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 路径设置
const SOURCE_DIR = path.join(__dirname, 'source');
const RESULT_DIR = path.join(__dirname, 'result');
const TOTAL_RESULT_FILE = path.join(__dirname, 'save', 'all.json');
const TOTAL_RESULT_FILE2 = path.join(__dirname, 'save', 'all2.json');
const FAILED_FILE = path.join(__dirname, 'save', 'failed.json');

// 控制参数
const CONCURRENCY = 6;

let failList = []

// 创建结果目录
if (!fs.existsSync(RESULT_DIR)) {
  fs.mkdirSync(RESULT_DIR);
}

const existingMap = new Map();
// 加载已爬数据（增量去重）
if (fs.existsSync(TOTAL_RESULT_FILE)) {
  const lines = fs.readFileSync(TOTAL_RESULT_FILE, 'utf-8').split('\n').filter(Boolean);
  console.log(lines.length)
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (obj?.word) {
        existingMap.set(obj.word.toLowerCase(), {...obj, id: existingMap.size});
      }
    } catch {
    }
  }
  console.log(`📦 已加载 ${existingMap.size} 个已爬词`);
}

const failStr = fs.readFileSync(FAILED_FILE, 'utf-8')

if (failStr) {
  failList = JSON.parse(failStr)
}
(async () => {
  const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(SOURCE_DIR, file);
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    let result = [];
    raw.forEach(obj => {
      try {
        let key = String(obj.name).toLowerCase();
        let r = existingMap.get(key)
        if (r) {
          result.push({...r, word: String(r.word)});
        } else {
          try {
            // console.log(`不存在：`, key)
            let d = {
              id: existingMap.size,
              "word": String(obj.name),
              "phonetic0": "",
              "phonetic1": "",
              "trans": [],
              "sentences": [],
              "phrases": [],
              "synos": [],
              "relWords": {"root": "", "rels": []},
              "etymology": [],
            }
            if (Array.isArray(obj.trans)) {
              d.trans = obj?.trans?.map((a) => ({pos: '', cn: a})) || []
            } else {
              d.trans = [{pos: '', cn: d.trans}]
            }
            existingMap.set(key, d);
            result.push(d);
          } catch (e) {
            console.log('filePath:' + filePath, 'word:' + obj.name)
            console.error(e);
          }
        }
      } catch (e) {
        console.log('--------filePath:' + filePath, 'word:' + JSON.stringify(obj));
        console.error(e);
      }
    })

    const outputName = path.basename(file, '.json') + '_v2.json';
    const outputPath = path.join(RESULT_DIR, outputName);

    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
    // console.log(`✅ 已保存：${outputName}`);
  }

  console.log(`最终${existingMap.size}个单词`);
  fs.writeFileSync(TOTAL_RESULT_FILE2, JSON.stringify(Array.from(existingMap), null, 2), 'utf-8');


  console.log('\n🎉 所有任务完成！');
})();
