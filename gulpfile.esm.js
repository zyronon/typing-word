import { src, dest } from 'gulp';
import through from 'through2';
import * as XLSX from 'xlsx';
import * as path from 'path';

function excel2json() {
  let json = {};
  const stream = through.obj(function(file, encode, cb) {
    if (!file.isBuffer()) {
      return cb(null, file);
    }
    const workbook = XLSX.read(file.contents);
    // const excelData = XLSX.utils.sheet_to_json(
    //   workbook.Sheets[workbook.SheetNames[0]],
    // );
    const excelData = XLSX.utils.sheet_to_json(workbook.Sheets['Sheet1']);
    json = excelData.reduce((result, current) => {
      let newCurrent = {};
      for (var key in current) {
        var letterPattern = /[a-zA-Z]+/g;
        var matches = key.match(letterPattern);
        if (matches) {
          var string = matches[0].toLocaleLowerCase();
          newCurrent[string] = current[key].replace(/@{/g, '{');
        }
      }
      result[newCurrent.key] = {};
      result[newCurrent.key]['en'] = newCurrent.en || '';
      result[newCurrent.key]['zh'] = newCurrent.zh || '';
      result[newCurrent.key]['id'] = newCurrent.id || '';
      result[newCurrent.key]['tw'] = newCurrent.tw || '';
      result[newCurrent.key]['th'] = newCurrent.th || '';
      result[newCurrent.key]['ru'] = newCurrent.ru || '';
      result[newCurrent.key]['vi'] = newCurrent.vi || '';
      result[newCurrent.key]['es'] = newCurrent.es || '';
      result[newCurrent.key]['pt'] = newCurrent.pt || '';

      result[newCurrent.key]['ja'] = newCurrent.ja || '';
      result[newCurrent.key]['uk'] = newCurrent.uk || '';
      result[newCurrent.key]['ko'] = newCurrent.ko || '';
      result[newCurrent.key]['de'] = newCurrent.de || '';
      result[newCurrent.key]['fr'] = newCurrent.fr || '';
      return result;
    }, json);
    file.contents = Buffer.from(JSON.stringify(json, null, '\t'));
    file.path = path.join(file.base, 'i18n.json');
    cb(null, file);
  });

  return stream;
}

// 将翻译好的excel写入json
function i18nwrite() {
  return src(['./src/locales/i18n.xlsx'])
    .pipe(excel2json())
    .pipe(dest('src/locales'));
}

export { i18nwrite };
