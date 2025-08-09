let path = require("path");
let fs = require("fs");

const RESULT_DIR = path.join(__dirname, 'result');
const RESULT2_DIR = path.join(__dirname, 'result2');


(async () => {
  const files = fs.readdirSync(RESULT_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const filePath = path.join(RESULT_DIR, file);
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    fs.writeFileSync(path.join(RESULT2_DIR, file), JSON.stringify(raw), 'utf-8');
  }
})();
