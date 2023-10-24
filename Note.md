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


1 错题本，添加错误次数

bug
换段的时候没发音
打完一段的一最后一行的时候，没有自动换行，需要按下空格才能换段
打完了没检测到

所有的图标hover时，有放大效果
各种声音可以单独调节音量大小

列表加搜索

BaseIcon 在选中模式下，应该显示白色

添加文章时，正文输入123报错

没有内容时，要显示占位符

A cold welcome 有bug

[EditAbleText.vue](src%2Fcomponents%2FEditAbleText.vue) 不能自动聚焦

在文章模式下，背单词时不能调出面板

单词发音，点击第二遍时减速

http://enpuz.com/ 语法分析工具

键盘音效应该多放几遍

加载单词列表时需要loading

背单词页面div，位置应该恒定，不应该随翻译内容变动而跳动

