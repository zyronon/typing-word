<h1 align="center">
  Typing Word
</h1>

<p align="center">
  可在网页上使用的背单词软件
</p>

<p align="center">
  <a href="https://github.com/zyronon/type-word/blob/master/LICENSE"><img src="https://img.shields.io/github/license/zyronon/type-word" alt="License"></a>
  <a><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"/></a>
  <a><img src="https://img.shields.io/badge/Powered%20by-Vue-blue"/></a>
</p>

## 📸 在线访问

Github Pages: <https://typing-word.ttentau.top>(国内推荐访问这个)

## 🛠 功能列表

### 背单词
可以选择记忆或默写单词，提供了音标显示、发音功能（均可选美音、英音）、错误统计 

### 背文章
内置经典教材书籍，可以练习和背诵文章，逐句输入，自动发音。也可以自行添加、导入文章，提供一键翻译、译文对照功能

### 生词本、错词本、简单词
默写单词时输入错误会自动添加到错词本，以便后续复习。也可以添加到简单词，之后再遇到这个词便会自动跳过，同时也可以将其添加到生词本中，以便巩固复习

### 默写模式
在用户完成一个章节的练习后，如果有错误词，那么会重复练习错误词，直到没有错误词为止。完成之后弹出选项可选择默写本章、重复本章、下一章

### 词库
内置了常用的 CET-4 、CET-6 、GMAT 、GRE 、IELTS 、SAT 、TOEFL 、考研英语、专业四级英语、专业八级英语，也有程序员常见英语单词以及多种编程语言
API 等词库。 尽可能满足大部分用户对背单词的需求，也非常欢迎社区贡献更多的词库。

## 运行项目

本项目是基于`Vue`开发的，需要 node 环境来运行。

### 手动安装

1. 安装 NodeJS，参考[官方文档](https://nodejs.org/en/download)
2. 使用 `git clone` 下载项目到本地, 不使用 git 可能因为缺少依赖而无法运行
3. 打开命令行，在项目根目录下，运行`npm install`来下载依赖。
4. 执行`npm start`来启动项目，项目默认地址为[`http://localhost:3000`](http://localhost:3000)
5. 在浏览器中打开[`http://localhost:3000`](http://localhost:3000)  来访问项目。

### 使用Docker
创建镜像 docker build -t typing-word:001 .

启动容器 docker run --name typing-word -p 3000:3000 -d typing-word:001

## 📕 词库列表

- CET-4、CET-6、GMAT、GRE、IELTS、SAT、TOEFL、BEC
- 考研英语、专业四级英语、专业八级英语、商务英语
- Coder Dict 程序员常用词
- 高考、中考、人教版英语 3-9 年级
- 王陆雅思王听力语料库 
- 日语常见词、N1 ～ N5 

## 📗 API 词库

- JavaScript API、Node.js API、Java API、Linux Command、C#: List API

词库均来源于(除文章以外)：[qwerty-learner](https://github.com/RealKai42/qwerty-learner/)

如果您需要背诵其他词库，欢迎在 Issue 中提出

## 🎙 功能与建议

目前项目处于开发初期，新功能正在持续添加中，如果你对软件有任何功能与建议，欢迎在 Issues 中提出
如果你也喜欢本软件的设计思想，欢迎提交 pr，非常感谢你对我们的支持！

### 灵感来源

[qwerty-learner](https://github.com/RealKai42/qwerty-learner/) 很喜欢作者的这个项目，但是它没有背单词所必备的 **生词本、错词本、简单词** 的功能，可能是作者反复强调和提醒这个项目是“**为键盘工作者设计的单词记忆与英语肌肉记忆锻炼软件**”而不是一个“**背单词**”的软件吧，尽管绝大多数用户都是用它来背单词😂😂😂。

本项目参考其思路使用 Vue 重写了，并添加了 **生词本、错词本、简单词** 、 **文章练习** 等功能 
 
