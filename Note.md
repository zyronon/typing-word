例句:On Jan. 20, former Sen. Barack Obama became the 44th President of the U.S. Millions attended the Inauguration.
sentence-tokenizer
    可以正常断句，但无法识别例句
sentence-splitter
    无法正常断句（在引号里面的问号和感叹号会被断句），但可以识别例句

https://github.com/Tessmore/sbd
    无法识别Mr.James Scott has a garage in Silbury and now he has just bought another garage in Pinhurst. 
    会将Mr.James 断句

wink-nlp
    'What a day!' I thought.
    'What are you doing?' she asked.
    会被断句

compromise
    表现良好，另外自带分词功能

以上所有库都会将：'Do you always get up so late? It's one o'clock!'分成两句....