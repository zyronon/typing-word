import i18nData from './i18n.json';

const JA = Object.entries(i18nData).reduce((result, current) => {
  const [key, value] = current;
  if (value.ja) {
    result[key] = value.ja;
  }
  return result;
}, {} as any);

export default JA;
