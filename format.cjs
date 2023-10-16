const { log } = require('console');
const fs = require('fs');

try {
  const str = fs.readFileSync('./public/dicts/coca20000.json', 'utf8');
  let dicts = JSON.parse(str)
  console.log(dicts[0]);

  let a = [
    'n.',
    'v.',
    'vt.& vi.',
    'pron.',
    'adj.',
    'adv.',
    'num.',
    'interj.',
    'art.',
    'aux.',
    'conj.',
    'prep.',
  ]
  dicts.map(v => {
    v.trans = v.trans.map(s => {
      s = s.replaceAll(',', "，")
      a.map(b => {
        s = s.replaceAll(b, `；${b}`)
      })

      if (s[0] === '；') {
        s = s.substr(1)
      }
      let c = [
        'vt.',
        'vi.',
      ]

      s = s.split('；').filter(v => v)

      return s
    })
    v.trans = v.trans.flat()
    return v
  })
  // console.log(dicts);

  fs.writeFileSync('./public/dicts/coca20000.json', JSON.stringify(dicts, null, 2));

} catch (err) {
  console.error(err);
}
