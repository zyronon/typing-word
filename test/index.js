let text = `On Jan. 20, former Sen. Barack Obama became the 44th President of the U.S. Millions attended the Inauguration. It was Sunday? I never get up early on Sundays! I sometimes stay in bed until lunchtime. Last Sunday I got up very late. I looked out of the window. It was dark outside. 'What a day!' I thought. 'It's raining again.' Just then, the telephone rang. It was my aunt Lucy. 'I've just arrived by train,' she said. 'I'm coming to see you.'\n    'But I'm still having breakfast,' I said\n    'What are you doing?' she asked.\n    'I'm having breakfast,' I repeated.\n    'Dear me,' she said. 'Do you always get up so late? It's one o'clock!'`;
// text = `How does the older investor differ in his approach to investment from the younger investor?\nThere is no shortage of tipsters around offering 'get-rich-quick' opportunities. But if you are a serious private investor, leave the Las Vegas mentality to those with money to fritter. The serious investor needs a proper 'portfolio' -- a well-planned selection of investments, with a definite structure and a clear aim. But exactly how does a newcomer to the stock market go about achieving that?\nWell, if you go to five reputable stock brokers and ask them what you should do with your money, you're likely to get five different answers, -- even if you give all the relevant information about your age age, family, finances and what you want from your investments. Moral? There is no one 'right' way to structure a portfolio. However, there are undoubtedly some wrong ways, and you can be sure that none of our five advisers would have suggested sinking all (or perhaps any) of your money into Periwigs*.\nSo what should you do? We'll assume that you have sorted out the basics -- like mortgages, pensions, insurance and access to sufficient cash reserves. You should then establish your own individual aims. These are partly a matter of personal circumstances, partly a matter of psychology.\nFor instance, if you are older you have less time to recover from any major losses, and you may well wish to boost your pension income. So preserving your capital and generating extra income are your main priorities. In this case, you'd probably construct a portfolio with some shares (but not high risk ones), along with gilts, cash deposits, and perhaps convertibles or the income shares of split capital investment trusts.\nIf you are younger, and in a solid financial position, you may decide to take an aggressive approach -- but only if you're blessed with a sanguine disposition and won't suffer sleepless nights over share prices. If portfolio, alongside your more pedestrian in vestments. Once you have decided on your investment aims, you can then decide where to put your money. The golden rule here is spread your risk -- if you put all of your money into Periwigs International, you're setting yourself up as a hostage to fortune.\n*'Periwigs' is the name of a fictitious company.\nINVESTOR'S CHRONICLE, March 23 1990`;
console.time()

 text = text.replaceAll(`'`, '"')
  // 将缩写词的双引号替换回单引号
  text = text.replaceAll(`"t`, `'t`)
  text = text.replaceAll(`"s`, `'s`)
  text = text.replaceAll(`"S`, `'S`)
  text = text.replaceAll(`"m`, `'m`)
  text = text.replaceAll(`"d`, `'d`)
  text = text.replaceAll(`"ve`, `'ve`)
  text = text.replaceAll(`"re`, `'re`)
  text = text.replaceAll(`"clock`, `'clock`)

// var Tokenizer = require('sentence-tokenizer');
// var tokenizer = new Tokenizer('Chuck');

// tokenizer.setEntry(v);
// console.log(tokenizer.getSentences());
var tokenizer = require('sbd');
var optional_options = {
    newline_boundaries: true
};
// // // text = "On Jan. 20, former Sen. Barack Obama became the 44th President of the U.S. Millions attended the Inauguration.";
// // text.split('\n').map(v=>{

// // })
var sentences = tokenizer.sentences(text, optional_options);
console.log(sentences);

// Load wink-nlp package.
const winkNLP = require('wink-nlp');
// Load english language model.
const model = require('wink-eng-lite-web-model');
// Instantiate winkNLP.
const nlp = winkNLP(model);
// Obtain "its" helper to extract item properties.
const its = nlp.its;
// Obtain "as" reducer helper to reduce a collection.
const as = nlp.as;

// NLP Code.
//   text = 'Hello   World🌎! How are you?';
const doc = nlp.readDoc(text);

// console.log( doc.out() );
// -> Hello   World🌎! How are you?

doc.sentences().each(v => {
    console.log(v.out());
    // console.log(v.tokens().out());
})
console.timeEnd()
