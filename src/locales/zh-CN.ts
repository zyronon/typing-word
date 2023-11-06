import i18nData from './i18n.json';

const ZH = Object.entries(i18nData).reduce((result, current) => {
  const [key, value] = current;
  if (value.zh) {
    result[key] = value.zh;
  }
  return result;
}, {} as any);

export default ZH;
