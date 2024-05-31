const { log } = require("console");
const fs = require("fs");

try {
  const str = fs.readFileSync("./public/dicts/coca20000.json", "utf8");
  let dicts = JSON.parse(str);
  console.log(dicts.length);

  // let a = [
  //   "vt.",
  //   "vi.",
  //   "pron.",
  //   "adj.",
  //   "adv.",
  //   "num.",
  //   "interj.",
  //   "art.",
  //   "aux.",
  //   "conj.",
  //   "prep.",
  //   // "n.",
  //   // "v.",
  // ];
  // dicts.map((v) => {
  //   v.trans = v.trans.map((s) => {
  //     s = s.replaceAll(",", "，");
  //     a.map((b) => {
  //       s = s.replaceAll(b, `^${b}`);
  //     });

  //     if (s[0] === "^") {
  //       s = s.substr(1);
  //     }

  //     s = s.split("^").filter((v) => v);

  //     let last = null;
  //     s = s.reduce((p, c, i, a) => {
  //       if (last) {
  //         c = last + c;
  //         p.push(c);
  //         last = null;
  //       } else {
  //         if (c.includes("& ")) {
  //           last = c;
  //         } else {
  //           p.push(c);
  //           last = null;
  //         }
  //       }
  //       return p;
  //     }, []);

  //     s = s.map((d) => {
  //       let r1 = d.indexOf("adv.");
  //       if (r1 > -1) {
  //         let t2 = d.substr(r1 + 4).replaceAll("v.", `^v.`);
  //         t2 = t2.split("^").filter((v) => v);
  //         t2[0] = d.substr(0, r1 + 4) + t2[0];
  //         d = t2;
  //       } else {
  //         let t2 = d.replaceAll("v.", `^v.`);
  //         t2 = t2.split("^").filter((v) => v);
  //         d = t2;
  //       }
  //       return d;
  //     });

  //     s = s.flat();

  //     s = s.map((d) => {
  //       let r1 = d.indexOf("pron.");
  //       if (r1 > -1) {
  //         let t2 = d.substr(r1 + 5).replaceAll("n.", `^n.`);
  //         t2 = t2.split("^").filter((v) => v);
  //         t2[0] = d.substr(0, r1 + 5) + t2[0];
  //         d = t2;
  //       } else {
  //         let t2 = d.replaceAll("n.", `^n.`);
  //         t2 = t2.split("^").filter((v) => v);
  //         d = t2;
  //       }
  //       return d;
  //     });

  //     s = s.flat();

  //     return s;
  //   });
  //   v.trans = v.trans.flat();
  //   return v;
  // });
  // console.log(dicts);

  // let newDict = [];
  // dicts.map((v) => {
  //   if (!newDict.find((s) => s.name === v.name)) {
  //     newDict.push(v);
  //   }
  // });

  // console.log(newDict.length);

  dicts.map((v) => {
    v.trans = v.trans.map((d) => {
      let t2 = d.replaceAll("int.", `^int.`);
      t2 = t2.split("^").filter((v) => v);
      d = t2;
      return d;
    });

    v.trans = v.trans.flat();

    return v;
  });
  fs.writeFileSync(
    "./public/dicts/coca20000.json",
    JSON.stringify(dicts, null, 2)
  );
} catch (err) {
  console.error(err);
}
