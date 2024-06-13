let path = require("path");
let fs = require("fs");
let axios = require('axios')

let DictType = {
  word: 'word'
}

// 中国考试
const chinaExam = [
  {
    id: 'xinghuoqiaoji_4',
    name: '四级巧记速记',
    description: '四级巧记速记',
    category: '中国考试',
    tags: ['大学英语'],
    url: 'xinghuoqiaoji_4.json',
    length: 2522,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'xinghuoqiaoji_6',
    name: '六级巧记速记',
    description: '六级巧记速记',
    category: '中国考试',
    tags: ['大学英语'],
    url: 'xinghuoqiaoji_6.json',
    length: 7520,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'cet4-sub',
    name: 'CET-4-Sub',
    description: '单词的减法-四级',
    category: '中国考试',
    tags: ['大学英语'],
    url: 'DanCiDeJianFa_4.json',
    length: 1957,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'cet6-sub',
    name: 'CET-6-Sub',
    description: '单词的减法-六级',
    category: '中国考试',
    tags: ['大学英语'],
    url: 'DanCiDeJianFa_6.json',
    length: 1949,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'kaoyan',
    name: '考研',
    description: '研究生英语入学考试词库',
    category: '中国考试',
    tags: ['考研'],
    url: 'KaoYan_3_T.json',
    length: 3728,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'kaoyan_2024',
    name: '考研 2024',
    description: '研究生英语入学考试词库 2024',
    category: '中国考试',
    tags: ['考研'],
    url: 'KaoYan_2024.json',
    length: 3731,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'kaoyanshanguo_2023',
    name: '考研闪过 2023',
    description: '高中低频词2023',
    category: '中国考试',
    tags: ['考研'],
    url: 'KaoYanShanGuo_2023.json',
    length: 1771,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'dancimimi_1',
    name: '单词的秘密-英语一',
    description: '单词的秘密英语（一）',
    category: '中国考试',
    tags: ['考研'],
    url: 'DanCiDeMimi_1.json',
    length: 5657,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'dancimimi_2',
    name: '单词的秘密-英语二',
    description: '单词的秘密英语（二）',
    category: '中国考试',
    tags: ['考研'],
    url: 'DanCiDeMimi_2.json',
    length: 3827,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'level4',
    name: '专四',
    description: '英语专业四级词库',
    category: '中国考试',
    tags: ['大学英语'],
    url: 'Level4luan_2_T.json',
    length: 4025,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'level8',
    name: '专八',
    description: '英语专业八级词库',
    category: '中国考试',
    tags: ['大学英语'],
    url: 'Level8luan_2_T.json',
    length: 12197,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'archVocabulary',
    name: '建筑专业英语',
    description: '大学建筑专业英语词汇',
    category: '中国考试',
    tags: ['专业英语'],
    url: 'archVocabulary.json',
    length: 630,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'itVocabulary',
    name: '计算机专用英语',
    description: '大学计算机专业英语词汇',
    category: '中国考试',
    tags: ['专业英语'],
    url: 'itVocabulary.json',
    length: 1665,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'pets3',
    name: 'PETS',
    description: '全国英语等级考试常考词汇',
    category: '中国考试',
    tags: ['PET'],
    url: 'PETS_3.json',
    length: 1942,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'pets3-2023',
    name: 'PETS-2023',
    description: '全国英语等级考试常考词汇',
    category: '中国考试',
    tags: ['PET'],
    url: 'PETS3-2023.json',
    length: 4449,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'self-study_English1',
    name: '自考1800高频单词',
    description: '自考1800高频单词',
    category: '中国考试',
    tags: ['自考英语二'],
    url: 'self-study_English1.json',
    length: 1800,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'self-study_English2',
    name: '自考英语二高频悠悠单词',
    description: '自考英语二高频悠悠单词',
    category: '中国考试',
    tags: ['自考英语二'],
    url: 'self-study_English2.json',
    length: 2181,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'self-study_English3',
    name: '自考英语二完整单词',
    description: '00015自考英语二完整单词书',
    category: '中国考试',
    tags: ['自考英语二'],
    url: 'self-study_English3.json',
    length: 4603,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'coca_20000',
    name: 'COCA20000词',
    description: 'COCA20000词',
    category: '中国考试',
    tags: ['其他'],
    url: 'coca20000.json',
    length: 20199,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: '4000_Essential_English_Words1',
    name: 'Essential Words',
    description: '4000 Essential English Words meaning',
    category: '中国考试',
    tags: ['其他'],
    url: '4000_Essential_English_Words-meaning.json',
    length: 3600,
    translateLanguage: 'en',
    language: 'en',
    type: DictType.word
  },
  {
    id: '4000_Essential_English_Words2',
    name: 'Essential Words',
    description: '4000 Essential English Words sentence',
    category: '中国考试',
    tags: ['其他'],
    url: '4000_Essential_English_Words-sentence.json',
    length: 3600,
    translateLanguage: 'en',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'longman_communication_3000_words',
    name: 'Longman Communication 3000',
    description: 'Most frequent words in both spoken and written English',
    category: '中国考试',
    tags: ['其他'],
    url: 'Longman_Communication_3000.json',
    length: 3168,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'top_2000_English_Words',
    name: 'Top 2000 words',
    description: 'with highest frequency',
    category: '中国考试',
    tags: ['其他'],
    url: 'top2000words.json',
    length: 1867,
    translateLanguage: 'en',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'top_1500_nouns_Words',
    name: 'Top 1500 Nouns',
    description: 'with highest frequency',
    category: '中国考试',
    tags: ['其他'],
    url: 'Top1500NounWords.json',
    length: 1525,
    translateLanguage: 'en',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'top_1000_verb_Words',
    name: 'Top 1000 Verbs',
    description: 'with highest frequency',
    category: '中国考试',
    tags: ['其他'],
    url: 'Top1000VerbWords.json',
    length: 1011,
    translateLanguage: 'en',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'top_500_Adj_Words',
    name: 'Top 500 adj.',
    description: 'with highest frequency',
    category: '中国考试',
    tags: ['其他'],
    url: 'Top500AdjectiveWords.json',
    length: 527,
    translateLanguage: 'en',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'top_250_Adv_Words',
    name: 'Top 250 adv.',
    description: 'with highest frequency',
    category: '中国考试',
    tags: ['其他'],
    url: 'Top250AdverbWords.json',
    length: 255,
    translateLanguage: 'en',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'top_60_Pronouns',
    name: 'Top 60 pron.',
    description: 'with highest frequency',
    category: '中国考试',
    tags: ['其他'],
    url: 'Top60Pronouns.json',
    length: 59,
    translateLanguage: 'en',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'top_50_Prepositions',
    name: 'Top 50 prep.',
    description: 'with highest frequency',
    category: '中国考试',
    tags: ['其他'],
    url: 'Top50Prepositions.json',
    length: 46,
    translateLanguage: 'en',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'suffix word',
    name: 'suffix word',
    description: 'common suffix',
    category: '中国考试',
    tags: ['其他'],
    url: 'suffix_word.json',
    length: 126,
    translateLanguage: 'en',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'word roots1',
    name: 'word roots1',
    description: 'common roots',
    category: '中国考试',
    tags: ['其他'],
    url: 'word_roots1.json',
    length: 369,
    translateLanguage: 'en',
    language: 'en',
    type: DictType.word
  },
  {
    id: '2024HongBao T1',
    name: '2024考研英语红宝书(上)',
    description: '2024考研英语红宝书必考词（上）',
    category: '中国考试',
    tags: ['其他'],
    url: '2024HongBao_T1.json',
    length: 997,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: '2024HongBao T2',
    name: '2024考研英语红宝书(下)',
    description: '2024考研英语红宝书必考词（下）',
    category: '中国考试',
    tags: ['其他'],
    url: '2024HongBao_T2.json',
    length: 854,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'adult self-study examination',
    name: '专升本词汇',
    description: '专升本词汇',
    category: '中国考试',
    tags: ['其他'],
    url: 'adult-self-study-examination.json',
    length: 3692,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'Oxford5000',
    name: '牛津5000词',
    description: '牛津5000词',
    category: '中国考试',
    tags: ['其他'],
    url: 'Oxford5000.json',
    length: 5836,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'Merriam_Webster_sVocabularyBuilder',
    name: '韦氏词根词典',
    description: '韦氏词根词典',
    category: '中国考试',
    tags: ['其他'],
    url: 'Merriam_Webster_sVocabularyBuilder.json',
    length: 1191,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'TOEFL_ZhangHongYan',
    name: 'ZhangHongYan的TOEFL词汇书',
    description: 'ZhangHongYan的TOEFL词汇书-词以类记',
    category: '国际考试',
    tags: ['TOEFL'],
    url: 'TOEFL_ZhangHongYan.json',
    length: 4035,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'English_II',
    name: '英语二单词书',
    description: '考研英语二单词书',
    category: '中国考试',
    tags: ['其他'],
    url: 'English_II.json',
    length: 4559,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
]

// 国际考试
const internationalExam = [
  {
    id: 'gmat',
    name: 'GMAT',
    description: 'GMAT 词库',
    category: '国际考试',
    tags: ['GMAT'],
    url: 'GMAT_3_T.json',
    length: 3047,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'gre',
    name: 'GRE',
    description: 'GRE 词库',
    category: '国际考试',
    tags: ['GRE'],
    url: 'GRE_3_T.json',
    length: 6515,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'gre3000',
    name: 'GRE3000',
    description: 'GRE3000 词库',
    category: '国际考试',
    tags: ['GRE'],
    url: 'GRE3000_3_T.json',
    length: 3041,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'IELTS_tinglichangjing',
    name: '雅思听力场景词汇',
    description: '雅思听力场景词汇',
    category: '国际考试',
    tags: ['IELTS'],
    url: 'IELTS_tinglichangjing.json',
    length: 1204,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'ielts_disorder',
    name: 'IELTS乱序完整版',
    description: 'IELTS乱序完整版',
    category: '国际考试',
    tags: ['IELTS'],
    url: 'IELTS_disorder.json',
    length: 9389,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'ielts_order',
    name: 'IELTS顺序完整版',
    description: 'IELTS顺序完整版',
    category: '国际考试',
    tags: ['IELTS'],
    url: 'IELTS_order.json',
    length: 9389,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'ielts',
    name: 'IELTS',
    description: '雅思词库',
    category: '国际考试',
    tags: ['IELTS'],
    url: 'IELTS_3_T.json',
    length: 3575,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'ieltsWang3',
    name: '雅思wang C3',
    description: '雅思听力特别名词语料库',
    category: '国际考试',
    tags: ['IELTS'],
    url: 'IELTS_WANG_3.json',
    length: 1135,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'ieltsWang4',
    name: '雅思wang C4',
    description: '雅思听力形容词副词语料库',
    category: '国际考试',
    tags: ['IELTS'],
    url: 'IELTS_WANG_4.json',
    length: 346,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'ieltsWang5',
    name: '雅思wang C5',
    description: '吞音连读混合训练语料库',
    category: '国际考试',
    tags: ['IELTS'],
    url: 'IELTS_WANG_5.json',
    length: 1569,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'ieltsWang11',
    name: '雅思wang C11',
    description: '综合测试',
    category: '国际考试',
    tags: ['IELTS'],
    url: 'IELTS_WANG_11.json',
    length: 1738,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'DuckCircle_IELTS',
    name: '鸭圈雅思核心词',
    description: '鸭圈雅思核心词',
    category: '国际考试',
    tags: ['IELTS'],
    url: 'DuckCircle_IELTS.json',
    length: 2644,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'IELTSVocabularyBible',
    name: '雅思词汇真经',
    description: '雅思词汇真经',
    category: '国际考试',
    tags: ['IELTS'],
    url: 'IELTSVocabularyBible.json',
    length: 3672,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'sat',
    name: 'SAT',
    description: '美国 SAT 考试词库',
    category: '国际考试',
    tags: ['SAT'],
    url: 'SAT_3_T.json',
    length: 4464,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'SATen',
    name: 'SAT en-en',
    description: 'SAT英英',
    category: '国际考试',
    tags: ['SAT'],
    url: 'SATen.json',
    length: 2681,
    translateLanguage: 'en',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'toefl',
    name: 'TOEFL',
    description: '托福考试常见词',
    category: '国际考试',
    tags: ['TOEFL'],
    url: 'TOEFL_3_T.json',
    length: 4264,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'bec2',
    name: '商务英语',
    description: '商务英语常见词',
    category: '国际考试',
    tags: ['BEC'],
    url: 'BEC_2_T.json',
    length: 2753,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'bec3',
    name: 'BEC',
    description: 'BEC考试常见词',
    category: '国际考试',
    tags: ['BEC'],
    url: 'BEC_3_T.json',
    length: 2825,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'PTE_junior',
    name: 'PTE 基础词汇',
    description: '',
    category: '国际考试',
    tags: ['PTE'],
    url: 'PTE_junior.json',
    length: 2651,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'PTE_senior',
    name: 'PTE 高阶词汇',
    description: '',
    category: '国际考试',
    tags: ['PTE'],
    url: 'PTE_senior.json',
    length: 3170,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'PTE_FIB_R_junior',
    name: '阅读 FIB 基础机经词汇',
    description: '',
    category: '国际考试',
    tags: ['PTE'],
    url: 'PTE_FIB_R_junior.json',
    length: 941,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'PTE_FIB_R_senior',
    name: '阅读 FIB 高阶机经词汇',
    description: '',
    category: '国际考试',
    tags: ['PTE'],
    url: 'PTE_FIB_R_senior.json',
    length: 1272,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'PTE_WFD',
    name: 'WFD 机经词汇',
    description: '',
    category: '国际考试',
    tags: ['PTE'],
    url: 'PTE_WFD.json',
    length: 1212,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'PTE_FIB_L',
    name: '听力 FIB 机经词汇',
    description: '',
    category: '国际考试',
    tags: ['PTE'],
    url: 'PTE_FIB_L.json',
    length: 646,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'PTE_Basic_apeuni',
    name: 'PTE 基础词汇 xingji',
    description: '',
    category: '国际考试',
    tags: ['PTE'],
    url: 'PTE_Basic_apeuni.json',
    length: 2652,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'PTE_Advanced_apeuni.json',
    name: 'PTE 高阶词汇 xingji',
    description: '',
    category: '国际考试',
    tags: ['PTE'],
    url: 'PTE_Advanced_apeuni.json',
    length: 3169,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'PTE_Read_apeuni.json',
    name: 'PTE 阅读FIB机经词汇 xingji',
    description: '',
    category: '国际考试',
    tags: ['PTE'],
    url: 'PTE_Read_apeuni.json',
    length: 630,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'PTE_Listening_apeuni.json',
    name: 'PTE 听力FIB机经词汇 xingji',
    description: '',
    category: '国际考试',
    tags: ['PTE'],
    url: 'PTE_Listening_apeuni.json',
    length: 674,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'TOEIC',
    name: 'TOEIC 词汇',
    description: '',
    category: '国际考试',
    tags: ['TOEIC'],
    url: 'TOEIC.json',
    length: 1694,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'Oxford3000',
    name: '牛津3000词',
    description: '牛津3000词',
    category: '国际考试',
    tags: ['牛津版'],
    url: 'Oxford3000.json',
    length: 1342,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'Oxford5000',
    name: '牛津5000词',
    description: '牛津5000词',
    category: '国际考试',
    tags: ['牛津版'],
    url: 'Oxford5000.json',
    length: 5836,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
]

// 青少儿英语
const childrenEnglish = [
  {
    id: 'gaokao3500',
    name: '高考 3500 词',
    description: '高考常见词 3500',
    category: '青少年英语',
    tags: ['通用'],
    url: 'GaoKao_3500.json',
    length: 3893,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'gaokaozhentihexin',
    name: '高考历年真题核心高频',
    description: '高考历年真题核心高频',
    category: '青少年英语',
    tags: ['通用'],
    url: 'GaoKaoZhenTiHeXinGaoPin.json',
    length: 799,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'zhongkaohexin',
    name: '中考核心词',
    description: '中考核心词',
    category: '青少年英语',
    tags: ['通用'],
    url: 'ZhongKaoHeXin.json',
    length: 2140,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'nce-new-1',
    name: '新概念英语(新版)-1',
    description: '新概念英语新版第一册',
    category: '青少年英语',
    tags: ['新概念英语'],
    url: 'nce-new-1.json',
    length: 908,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'nce-new-2',
    name: '新概念英语(新版)-2',
    description: '新概念英语新版第二册',
    category: '青少年英语',
    tags: ['新概念英语'],
    url: 'nce-new-2.json',
    length: 862,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'nce-new-3',
    name: '新概念英语(新版)-3',
    description: '新概念英语新版第三册',
    category: '青少年英语',
    tags: ['新概念英语'],
    url: 'nce-new-3.json',
    length: 1062,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'nce-new-4',
    name: '新概念英语(新版)-4',
    description: '新概念英语新版第四册',
    category: '青少年英语',
    tags: ['新概念英语'],
    url: 'nce-new-4.json',
    length: 793,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'SHjuniormiddleOxford',
    name: '上海初中牛津词汇',
    description: '上海初中牛津词汇',
    category: '青少年英语',
    tags: ['牛津版'],
    url: 'OxfordVocabulary_juniorMiddleSH.json',
    length: 1270,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'san1',
    name: '三年级上',
    description: '人教版三年级上册',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPXiaoXue3_1_T.json',
    length: 64,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'san2',
    name: '三年级下',
    description: '人教版三年级下册',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPXiaoXue3_2_T.json',
    length: 72,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'si1',
    name: '四年级上',
    description: '人教版四年级上册',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPXiaoXue4_1_T.json',
    length: 84,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'si2',
    name: '四年级下',
    description: '人教版四年级下册',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPXiaoXue4_2_T.json',
    length: 104,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'wu1',
    name: '五年级上',
    description: '人教版五年级上册',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPXiaoXue5_1_T.json',
    length: 131,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'wu2',
    name: '五年级下',
    description: '人教版五年级下册',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPXiaoXue5_2_T.json',
    length: 156,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'liu1',
    name: '六年级上',
    description: '人教版六年级上册',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPXiaoXue6_1_T.json',
    length: 130,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'liu2',
    name: '六年级下',
    description: '人教版六年级下册',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPXiaoXue6_2_T.json',
    length: 108,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'qi1',
    name: '七年级上',
    description: '人教版七年级上册',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPChuZhong7_1_T.json',
    length: 392,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'qi2',
    name: '七年级下',
    description: '人教版七年级下册',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPChuZhong7_2_T.json',
    length: 492,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'ba1',
    name: '八年级上',
    description: '人教版八年级上册',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPChuZhong8_1_T.json',
    length: 419,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'ba2',
    name: '八年级下',
    description: '人教版八年级下册',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPChuZhong8_2_T.json',
    length: 466,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'jiu',
    name: '九年级',
    description: '人教版九年级全册',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPChuZhong9_1_T.json',
    length: 551,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'renjiaogaozhong1',
    name: '高中必修1',
    description: '人教版高中必修1',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPGaoZhong_1_T.json',
    length: 311,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'renjiaogaozhong2',
    name: '高中必修2',
    description: '人教版高中必修2',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPGaoZhong_2_T.json',
    length: 319,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'renjiaogaozhong3',
    name: '高中必修3',
    description: '人教版高中必修3',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPGaoZhong_3_T.json',
    length: 366,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'renjiaogaozhong4',
    name: '高中必修4',
    description: '人教版高中必修4',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPGaoZhong_4_T.json',
    length: 307,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'renjiaogaozhong5',
    name: '高中必修5',
    description: '人教版高中必修5',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPGaoZhong_5_T.json',
    length: 357,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'renjiaogaozhong6',
    name: '高中选修6',
    description: '人教版高中选修6',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPGaoZhong_6_T.json',
    length: 391,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'renjiaogaozhong7',
    name: '高中选修7',
    description: '人教版高中选修7',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPGaoZhong_7_T.json',
    length: 384,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'renjiaogaozhong8',
    name: '高中选修8',
    description: '人教版高中选修8',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPGaoZhong_8_T.json',
    length: 420,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'renjiaogaozhong9',
    name: '高中选修9',
    description: '人教版高中选修9',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPGaoZhong_9_T.json',
    length: 352,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'renjiaogaozhong10',
    name: '高中选修10',
    description: '人教版高中选修10',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPGaoZhong_10_T.json',
    length: 361,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'renjiaogaozhong11',
    name: '高中选修11',
    description: '人教版高中选修11',
    category: '青少年英语',
    tags: ['人教版'],
    url: 'PEPGaoZhong_11_T.json',
    length: 309,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },

  {
    id: 'waiyan1',
    name: '外研七年级上册',
    description: '外研版七年级上册',
    category: '青少年英语',
    tags: ['外研版'],
    url: 'WaiYanSheChuZhong_1_T.json',
    length: 629,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'waiyan2',
    name: '外研七年级下册',
    description: '外研版七年级下册',
    category: '青少年英语',
    tags: ['外研版'],
    url: 'WaiYanSheChuZhong_2_T.json',
    length: 438,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'waiyan3',
    name: '外研八年级上册',
    description: '外研版八年级上册',
    category: '青少年英语',
    tags: ['外研版'],
    url: 'WaiYanSheChuZhong_3_T.json',
    length: 320,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'waiyan4',
    name: '外研八年级下册',
    description: '外研版八年级下册',
    category: '青少年英语',
    tags: ['外研版'],
    url: 'WaiYanSheChuZhong_4_T.json',
    length: 266,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'waiyan5',
    name: '外研九年级上册',
    description: '外研版九年级上册',
    category: '青少年英语',
    tags: ['外研版'],
    url: 'WaiYanSheChuZhong_5_T.json',
    length: 381,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'waiyan6',
    name: '外研九年级下册',
    description: '外研版九年级下册',
    category: '青少年英语',
    tags: ['外研版'],
    url: 'WaiYanSheChuZhong_6_T.json',
    length: 128,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'waiyan7',
    name: '外研高中必修1',
    description: '外研高中必修1',
    category: '青少年英语',
    tags: ['外研版'],
    url: 'WaiYanSheGaoZhong_1_T.json',
    length: 411,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'waiyan8',
    name: '外研高中必修2',
    description: '外研高中必修2',
    category: '青少年英语',
    tags: ['外研版'],
    url: 'WaiYanSheGaoZhong_2_T.json',
    length: 272,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'Yilin1',
    name: '高中必修1',
    description: '译林版高中必修1',
    category: '青少年英语',
    tags: ['译林版'],
    url: '.YiLin_1.json',
    length: 276,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'Yilin2',
    name: '高中必修2',
    description: '译林版高中必修2',
    category: '青少年英语',
    tags: ['译林版'],
    url: '.YiLin_2.json',
    length: 297,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'Yilin3',
    name: '高中必修3',
    description: '译林版高中必修3',
    category: '青少年英语',
    tags: ['译林版'],
    url: '.YiLin_3.json',
    length: 295,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'beishi1',
    name: '高中必修1',
    description: '北师大版高中必修1',
    category: '青少年英语',
    tags: ['北师大'],
    url: 'BeiShiGaoZhong_1_T.json',
    length: 226,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'beishi2',
    name: '高中必修2',
    description: '北师大版高中必修2',
    category: '青少年英语',
    tags: ['北师大'],
    url: 'BeiShiGaoZhong_2_T.json',
    length: 244,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'beishi3',
    name: '高中必修3',
    description: '北师大版高中必修3',
    category: '青少年英语',
    tags: ['北师大'],
    url: 'BeiShiGaoZhong_3_T.json',
    length: 295,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'beishi4',
    name: '高中必修4',
    description: '北师大版高中必修4',
    category: '青少年英语',
    tags: ['北师大'],
    url: 'BeiShiGaoZhong_4_T.json',
    length: 336,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'beishi5',
    name: '高中必修5',
    description: '北师大版高中必修5',
    category: '青少年英语',
    tags: ['北师大'],
    url: 'BeiShiGaoZhong_5_T.json',
    length: 327,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'beishi6',
    name: '高中选修6',
    description: '北师大版高中选修6',
    category: '青少年英语',
    tags: ['北师大'],
    url: 'BeiShiGaoZhong_6_T.json',
    length: 271,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'beishi7',
    name: '高中选修7',
    description: '北师大版高中选修7',
    category: '青少年英语',
    tags: ['北师大'],
    url: 'BeiShiGaoZhong_7_T.json',
    length: 334,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'beishi8',
    name: '高中选修8',
    description: '北师大版高中选修8',
    category: '青少年英语',
    tags: ['北师大'],
    url: 'BeiShiGaoZhong_8_T.json',
    length: 364,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'beishi9',
    name: '高中选修9',
    description: '北师大版高中选修9',
    category: '青少年英语',
    tags: ['北师大'],
    url: 'BeiShiGaoZhong_9_T.json',
    length: 299,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'beishi10',
    name: '高中选修10',
    description: '北师大版高中选修10',
    category: '青少年英语',
    tags: ['北师大'],
    url: 'BeiShiGaoZhong_10_T.json',
    length: 267,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'beishi11',
    name: '高中选修11',
    description: '北师大版高中选修11',
    category: '青少年英语',
    tags: ['北师大'],
    url: 'BeiShiGaoZhong_11_T.json',
    length: 330,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'eflevel1',
    name: 'EF-LEVEL-1',
    description: 'EF等级1',
    category: '青少年英语',
    tags: ['EF'],
    url: 'EF_LEVEL_1.json',
    length: 297,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'eflevel2',
    name: 'EF-LEVEL-2',
    description: 'EF等级2',
    category: '青少年英语',
    tags: ['EF'],
    url: 'EF_LEVEL_2.json',
    length: 353,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'eflevel3',
    name: 'EF-LEVEL-3',
    description: 'EF等级3',
    category: '青少年英语',
    tags: ['EF'],
    url: 'EF_LEVEL_3.json',
    length: 172,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'eflevel4',
    name: 'EF-LEVEL-4',
    description: 'EF等级4',
    category: '青少年英语',
    tags: ['EF'],
    url: 'EF_LEVEL_4.json',
    length: 178,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'eflevel5',
    name: 'EF-LEVEL-5',
    description: 'EF等级5',
    category: '青少年英语',
    tags: ['EF'],
    url: 'EF_LEVEL_5.json',
    length: 172,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'eflevel6',
    name: 'EF-LEVEL-6',
    description: 'EF等级6',
    category: '青少年英语',
    tags: ['EF'],
    url: 'EF_LEVEL_6.json',
    length: 172,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'eflevel7',
    name: 'EF-LEVEL-7',
    description: 'EF等级7',
    category: '青少年英语',
    tags: ['EF'],
    url: 'EF_LEVEL_7.json',
    length: 171,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'eflevel8',
    name: 'EF-LEVEL-8',
    description: 'EF等级8',
    category: '青少年英语',
    tags: ['EF'],
    url: 'EF_LEVEL_8.json',
    length: 172,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'eflevel9',
    name: 'EF-LEVEL-9',
    description: 'EF等级9',
    category: '青少年英语',
    tags: ['EF'],
    url: 'EF_LEVEL_9.json',
    length: 165,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'eflevel10',
    name: 'EF-LEVEL-10',
    description: 'EF等级10',
    category: '青少年英语',
    tags: ['EF'],
    url: 'EF_LEVEL_10.json',
    length: 174,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'eflevel11',
    name: 'EF-LEVEL-11',
    description: 'EF等级11',
    category: '青少年英语',
    tags: ['EF'],
    url: 'EF_LEVEL_11.json',
    length: 176,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'eflevel12',
    name: 'EF-LEVEL-12',
    description: 'EF等级12',
    category: '青少年英语',
    tags: ['EF'],
    url: 'EF_LEVEL_12.json',
    length: 170,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'eflevel13',
    name: 'EF-LEVEL-13',
    description: 'EF等级13',
    category: '青少年英语',
    tags: ['EF'],
    url: 'EF_LEVEL_13.json',
    length: 172,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'eflevel14',
    name: 'EF-LEVEL-14',
    description: 'EF等级14',
    category: '青少年英语',
    tags: ['EF'],
    url: 'EF_LEVEL_14.json',
    length: 171,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'eflevel15',
    name: 'EF-LEVEL-15',
    description: 'EF等级15',
    category: '青少年英语',
    tags: ['EF'],
    url: 'EF_LEVEL_15.json',
    length: 168,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'eflevel16',
    name: 'EF-LEVEL-16',
    description: 'EF等级16',
    category: '青少年英语',
    tags: ['EF'],
    url: 'EF_LEVEL_16.json',
    length: 170,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  //Reading_Explorer系列
  {
    id: 'ReadingExplorer3',
    name: 'Reading Explorer 3',
    description: '词汇表来自Reading Explorer 3, Third Edition',
    category: '青少年英语',
    tags: ['青少年英语'],
    url: 'ReadingExplorer3.json',
    length: 239,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
  {
    id: 'Macmillan7000',
    name: '麦克米伦7000',
    description: '麦克米伦7000',
    category: '中国考试',
    tags: ['其他'],
    url: 'Macmillan7000.json',
    length: 6268,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.word
  },
]

// 编程字典
const programming = [
  {
    id: 'coder',
    name: 'Coder Dict',
    description: '程序员常见单词词库',
    category: '代码练习',
    tags: ['通用'],
    url: 'it-words.json',
    length: 1700,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'childCode',
    name: '少儿 Python',
    description: '少儿 Python 常见词',
    category: '代码练习',
    tags: ['少儿编程', 'Python'],
    url: 'Child_python_code.json',
    length: 19,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'childCode002',
    name: '少儿 Python Turtle',
    description: '少儿 Python Turtle 常见词',
    category: '代码练习',
    tags: ['少儿编程', 'Python'],
    url: 'Child_python_turtle_code.json',
    length: 27,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'childCode003',
    name: '少儿 C++',
    description: '少儿 C++ 常见词',
    category: '代码练习',
    tags: ['少儿编程', 'C++'],
    url: 'Child_cpp.json',
    length: 39,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },

  {
    id: 'jsArray',
    name: 'JS: Array',
    description: 'JavaScript API 词典',
    category: '代码练习',
    tags: ['JavaScript'],
    url: 'js-array.json',
    length: 36,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'jsDate',
    name: 'JS: Date',
    description: 'JavaScript API 词典',
    category: '代码练习',
    tags: ['JavaScript'],
    url: 'js-date.json',
    length: 34,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'jsGlobal',
    name: 'JS: Global',
    description: 'JavaScript API 词典',
    category: '代码练习',
    tags: ['JavaScript'],
    url: 'js-global.json',
    length: 9,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'jsMapSet',
    name: 'JS: Map & Set',
    description: 'JavaScript API 词典',
    category: '代码练习',
    tags: ['JavaScript'],
    url: 'js-map-set.json',
    length: 16,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'jsMath',
    name: 'JS: Math',
    description: 'JavaScript API 词典',
    category: '代码练习',
    tags: ['JavaScript'],
    url: 'js-math.json',
    length: 38,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'jsNumber',
    name: 'JS: Number',
    description: 'JavaScript API 词典',
    category: '代码练习',
    tags: ['JavaScript'],
    url: 'js-number.json',
    length: 22,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'jsObject',
    name: 'JS: Object',
    description: 'JavaScript API 词典',
    category: '代码练习',
    tags: ['JavaScript'],
    url: 'js-object.json',
    length: 37,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'jsPromise',
    name: 'JS: Promise',
    description: 'JavaScript API 词典',
    category: '代码练习',
    tags: ['JavaScript'],
    url: 'js-promise.json',
    length: 9,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'jsString',
    name: 'JS: String',
    description: 'JavaScript API 词典',
    category: '代码练习',
    tags: ['JavaScript'],
    url: 'js-string.json',
    length: 32,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'python-builtin',
    name: 'Python: Built-in',
    description: 'Python Built-in API',
    category: '代码练习',
    tags: ['Python'],
    url: 'python-builtin.json',
    length: 65,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'python-array',
    name: 'Python: array',
    description: 'Python array API ',
    category: '代码练习',
    tags: ['Python'],
    url: 'python-array.json',
    length: 11,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'python-date',
    name: 'Python: date',
    description: 'Python date API ',
    category: '代码练习',
    tags: ['Python'],
    url: 'python-date.json',
    length: 39,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'python-file',
    name: 'Python: file',
    description: 'Python file API ',
    category: '代码练习',
    tags: ['Python'],
    url: 'python-file.json',
    length: 21,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'python-class',
    name: 'Python: class',
    description: 'Python class API ',
    category: '代码练习',
    tags: ['Python'],
    url: 'python-class.json',
    length: 13,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'python-set',
    name: 'Python: set',
    description: 'Python set API ',
    category: '代码练习',
    tags: ['Python'],
    url: 'python-set.json',
    length: 29,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'python-math',
    name: 'Python: math',
    description: 'Python math API ',
    category: '代码练习',
    tags: ['Python'],
    url: 'python-math.json',
    length: 37,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'python-string',
    name: 'Python: string',
    description: 'Python string API ',
    category: '代码练习',
    tags: ['Python'],
    url: 'python-string.json',
    length: 40,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'python-system',
    name: 'Python: system',
    description: 'Python system API ',
    category: '代码练习',
    tags: ['Python'],
    url: 'python-sys.json',
    length: 24,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'javeArrayList',
    name: 'Java: ArrayList',
    description: 'JavaScript API 词典',
    category: '代码练习',
    tags: ['Java'],
    url: 'java-arraylist.json',
    length: 25,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'javaCharacter',
    name: 'Java: Character',
    description: 'JavaScript API 词典',
    category: '代码练习',
    tags: ['Java'],
    url: 'java-character.json',
    length: 8,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'javaHashmap',
    name: 'Java: Hashmap',
    description: 'JavaScript API 词典',
    category: '代码练习',
    tags: ['Java'],
    url: 'java-hashmap.json',
    length: 22,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'javaLinkedList',
    name: 'Java: LinkedList',
    description: 'JavaScript API 词典',
    category: '代码练习',
    tags: ['Java'],
    url: 'java-linkedlist.json',
    length: 25,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'javaString',
    name: 'Java: String',
    description: 'JavaScript API 词典',
    category: '代码练习',
    tags: ['Java'],
    url: 'java-string.json',
    length: 48,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'javaStringBuffer',
    name: 'Java: StringBuffer',
    description: 'JavaScript API 词典',
    category: '代码练习',
    tags: ['Java'],
    url: 'java-stringBuffer.json',
    length: 20,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'linuxCommand',
    name: 'Linux',
    description: 'Linux Command',
    category: '代码练习',
    tags: ['Linux'],
    url: 'linux-command.json',
    length: 575,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'csharpList',
    name: 'C#: List API',
    description: 'C# List API',
    category: '代码练习',
    tags: ['C#'],
    url: 'csharp-list.json',
    length: 36,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'sql-lower-case',
    name: 'SQL: 常用语句 lower case',
    description: 'SQL 常用语句 小写',
    category: '代码练习',
    tags: ['SQL'],
    url: 'SQL_statement_lower-case.json',
    length: 12,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'sql-upper-case',
    name: 'SQL: 常用语句 upper case',
    description: 'SQL 常用语句 大写',
    category: '代码练习',
    tags: ['SQL'],
    url: 'SQL_statement_upper-case.json',
    length: 12,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'ai-machine-learning',
    name: '人工智能: 机器学习',
    description: 'AI机器学习 常用英语词汇',
    category: '代码练习',
    tags: ['AI'],
    url: 'ai_machine_learning.json',
    length: 726,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'ai-ai-for-science',
    name: '人工智能: AI for Science',
    description: 'AI for Science 常用英语词汇',
    category: '代码练习',
    tags: ['AI'],
    url: 'ai_for_science.json',
    length: 491,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'go_keyword',
    name: 'golang-keyword',
    description: 'go语言关键字,',
    category: '代码练习',
    tags: ['golang'],
    url: 'go_keyword.json',
    length: 25,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
  {
    id: 'go_builtin',
    name: 'golang-builtin',
    description: 'go语言内建函数和类型',
    category: '代码练习',
    tags: ['golang'],
    url: 'go_builtin.json',
    length: 46,
    translateLanguage: 'zh-CN',
    language: 'code',
    type: DictType.word
  },
]

// 日语词典
const japaneseExam = [
  {
    id: 'japanese001',
    name: '日语常见词',
    description: '日语常用单词',
    category: '日语学习',
    tags: ['基础'],
    url: 'Japanesebasicword.json',
    length: 100,
    translateLanguage: 'en',
    language: 'ja',
    type: DictType.word
  },
  {
    id: 'japanese002',
    name: 'N5',
    description: '日语N5',
    category: '日语学习',
    tags: ['基础'],
    url: 'JapVocabList.N5.json',
    length: 670,
    translateLanguage: 'en',
    language: 'ja',
    type: DictType.word
  },
  {
    id: 'japanese003',
    name: 'N4',
    description: '日语N4',
    category: '日语学习',
    tags: ['基础'],
    url: 'JapVocabList.N4.json',
    length: 635,
    translateLanguage: 'en',
    language: 'ja',
    type: DictType.word
  },
  {
    id: 'japanese004',
    name: 'N3',
    description: '日语N3',
    category: '日语学习',
    tags: ['基础'],
    url: 'JapVocabList.N3.json',
    length: 1830,
    translateLanguage: 'en',
    language: 'ja',
    type: DictType.word
  },
  {
    id: 'japanese005',
    name: 'N2',
    description: '日语N2',
    category: '日语学习',
    tags: ['基础'],
    url: 'JapVocabList.N2.json',
    length: 1836,
    translateLanguage: 'en',
    language: 'ja',
    type: DictType.word
  },
  {
    id: 'japanese006',
    name: 'N1',
    description: '日语N1',
    category: '日语学习',
    tags: ['基础'],
    url: 'JapVocabList.N1.json',
    length: 3477,
    translateLanguage: 'en',
    language: 'ja',
    type: DictType.word
  },
  {
    id: 'japanese007',
    name: '高频单词_N1',
    description: '高频单词_日语N1',
    category: '日语学习',
    tags: ['基础'],
    url: 'Jap_High-Frequency_N1.json',
    length: 3000,
    translateLanguage: 'zh-CN',
    language: 'ja',
    type: DictType.word
  },
  {
    id: 'japanese008',
    name: '高频单词_N2',
    description: '高频单词_日语N2',
    category: '日语学习',
    tags: ['基础'],
    url: 'Jap_High-Frequency_N2.json',
    length: 2500,
    translateLanguage: 'zh-CN',
    language: 'ja',
    type: DictType.word
  },
  {
    id: 'japanese009',
    name: '高频单词_N3',
    description: '高频单词_日语N3',
    category: '日语学习',
    tags: ['基础'],
    url: 'Jap_High-Frequency_N3.json',
    length: 1999,
    translateLanguage: 'zh-CN',
    language: 'ja',
    type: DictType.word
  },
  {
    id: 'japanese0010',
    name: '高频单词_N4N5',
    description: '高频单词_日语N4N5',
    category: '日语学习',
    tags: ['基础'],
    url: 'Jap_High-Frequency_N4N5.json',
    length: 2000,
    translateLanguage: 'zh-CN',
    language: 'ja',
    type: DictType.word
  },
]

// 德语词典
const germanExam = [
  {
    id: 'german2en',
    name: '德语 英译',
    description: '德语词汇, 英语翻译',
    category: '德语学习',
    tags: ['基础'],
    url: 'german2en.json',
    length: 5892,
    translateLanguage: 'en',
    language: 'de',
    type: DictType.word
  },
  {
    id: 'en2german',
    name: '英语 德译',
    description: '英语词汇，德语翻译',
    category: '德语学习',
    tags: ['基础'],
    url: 'en2german.json',
    length: 5025,
    translateLanguage: 'de',
    language: 'en',
    type: DictType.word
  },
]

// 英语文章
const enArticle = [
  {
    id: 'article_nce2',
    name: "新概念英语2-课文",
    description: '新概念英语2-课文',
    category: '文章学习',
    tags: ['新概念英语'],
    url: 'NCE_2.json',
    length: 96,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.article
  },
  {
    id: 'article_nce3',
    name: "新概念英语3-课文",
    description: '新概念英语3-课文',
    category: '文章学习',
    tags: ['新概念英语'],
    url: 'NCE_3.json',
    length: 3,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.article
  },
  {
    id: 'article_nce4',
    name: "新概念英语4-课文",
    description: '新概念英语4-课文',
    category: '文章学习',
    tags: ['新概念英语'],
    url: 'NCE_4.json',
    length: 3,
    translateLanguage: 'common',
    language: 'en',
    type: DictType.article
  }
]

const json = [
  ...chinaExam,
  ...internationalExam,
  ...childrenEnglish,
  // ...programming,
  // ...japaneseExam,
  // ...germanExam,
  // ...enArticle,
]

async function sleep(val) {
  return new Promise(resolve => {
    setTimeout(resolve, val)
  })
}

async function c(dict) {
  // dict = newDicts[0]
  let url = `../public/dicts/${dict.language}/${dict.type}/${dict.translateLanguage}/${dict.url}`;
  return new Promise((resolve, reject) => {
    try {
      let str = fs.readFileSync(url, "utf8");
      let list = JSON.parse(str)
      dict.words = list.map(v => v.word)
      dict.tags = dict.tags.filter(v => {
        return v !== '所有'
      })
      console.log('  ')
      console.log('----------------------')
      console.log('名字', dict.name, dict.url, dict.length, dict.tags)
      axios({
        url: 'http://localhost/index.php/v1/support/addDict', method: 'post', data: dict
      }).then(r => {
        if (r.data.success) {
          console.log(r.data.msg, r.data.data)
          fs.writeFileSync('./failDict.txt', JSON.stringify(r.data.data, null, 2));
          fs.writeFileSync(`./uploadDict/${dict.url}`, JSON.stringify(dict, null, 2));
          resolve(true)

          fs.unlink(url, (err) => {
            resolve(true)
            if (err) throw err;
            console.log(dict.name, '已删除');
            console.log('----------------------')
          });
        } else {
          resolve(true)
          console.log('失败1', r.data.msg)
        }
      }).catch(r => {
        resolve(true)
        console.log('失败2', r)
      })
    } catch (e) {
      resolve(true)
      console.log('读取文件失败', dict.name, e)
    }
  })
}

async function s() {
  for (let i = 0; i < json.length; i++) {
    let v = json[i]
    console.log('进度', (i / json.length).toFixed(2))
    await c(v)
    // await sleep(5000)
  }
}

// console.log(json[0])
// c(json[0])
s()

