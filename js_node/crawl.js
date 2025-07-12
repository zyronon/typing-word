const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const SOURCE_DIR = path.join(__dirname, 'source');
const RESULT_DIR = path.join(__dirname, 'result');
const TOTAL_RESULT_FILE = path.join(__dirname, 'all.json');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MAX_COUNT = 3; // ✅ 设定最大爬取数（调试用）

let crawlCount = 0;
const allResults = [];

// 创建 result 目录（如无）
if (!fs.existsSync(RESULT_DIR)) {
  fs.mkdirSync(RESULT_DIR);
}

// 追加写入总文件
function appendToAll(result) {
  fs.appendFileSync(TOTAL_RESULT_FILE, JSON.stringify(result) + ',\n', 'utf-8');
}

async function crawlWord(word, page, retry = 0) {
  const data = {
    word: word,
    phonetic0: '',
    phonetic1: '',
    trans: [],
    sentences: [],
    phrases: [],
    synos: [],
    relWords: [],
    memory: '',
  };

  const url = `https://www.youdao.com/result?word=${encodeURIComponent(word)}&lang=en`;

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });

    // word
    const titleEl = await page.locator('.title').first();
    data.word = await titleEl.evaluate(el => el.firstChild?.nodeValue || '');

    // phonetic
    const phones = await page.$$('.per-phone .phonetic');
    if (phones[0]) data.phonetic0 = (await phones[0].textContent())?.trim() || '';
    if (phones[1]) data.phonetic1 = (await phones[1].textContent())?.trim() || '';

    // trans
    const trans = await page.$$('.basic .word-exp');
    for (const el of trans) {
      const pos = await el.$('.pos');
      const tran = await el.$('.trans');
      data.trans.push({
        pos: pos ? (await pos.textContent())?.trim() : '',
        cn: tran ? (await tran.textContent())?.trim() : '',
      });
    }

    // sentences
    const sentList = await page.$$('.blng_sents_part .trans-container ul li .col2');
    for (const el of sentList) {
      const en = await el.$('.sen-eng');
      const ch = await el.$('.sen-ch');
      data.sentences.push({
        v: en ? (await en.textContent())?.trim() : '',
        tran: ch ? (await ch.textContent())?.trim() : '',
      });
    }

    // phrases
    const phrs = await page.$$('.phrs ul li .phrs-content');
    for (const el of phrs) {
      const point = await el.$('.point');
      const tran = await el.$('.phr_trans');
      data.phrases.push({
        v: point ? (await point.textContent())?.trim() : '',
        tran: tran ? (await tran.textContent())?.trim() : '',
      });
    }

    // 同义词（optional）
    try {
      await page.getByText('同近义词', { timeout: 2000 }).click();
      await page.waitForSelector('.syno', { timeout: 3000 });
      const synos = await page.$$('.syno-item');
      for (const el of synos) {
        const pos = await el.$('.index');
        const tran = await el.$('.synptran');
        const wordEl = await el.$('.clickable');
        let str = wordEl ? (await wordEl.textContent())?.trim() : '';
        data.synos.push({
          pos: pos ? (await pos.textContent())?.trim() : '',
          tran: tran ? (await tran.textContent())?.trim() : '',
          ws: str.split('/').map(s => s.trim()).filter(Boolean),
        });
      }
    } catch {}

    return data;
  } catch (err) {
    if (retry < 2) {
      console.log(`🔁 ${word} 抓取失败，重试中...`);
      await sleep(1000);
      return crawlWord(word, page, retry + 1);
    } else {
      console.log(`❌ ${word} 抓取失败，跳过。`);
      return null;
    }
  }
}

(async () => {
  const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.json'));
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const file of files) {
    const filePath = path.join(SOURCE_DIR, file);
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const wordList = raw.map(obj => obj.word).filter(Boolean);

    const resultForThisFile = [];

    console.log(`📂 处理文件：${file}，共 ${wordList.length} 个单词`);

    for (const word of wordList) {
      if (crawlCount >= MAX_COUNT) {
        console.log(`🚫 达到调试上限 ${MAX_COUNT}，终止爬取`);
        await browser.close();
        return;
      }

      const result = await crawlWord(word, page);
      if (result) {
        crawlCount++;
        appendToAll(result);
        resultForThisFile.push(result);
      }

      await sleep(500);
    }

    const outputName = path.basename(file, '.json') + '_v2.json';
    const outputPath = path.join(RESULT_DIR, outputName);
    fs.writeFileSync(outputPath, JSON.stringify(resultForThisFile, null, 2), 'utf-8');

    console.log(`✅ 已保存：${outputName}`);
  }

  await browser.close();
  console.log('\n🎉 所有任务完成！');
})();
