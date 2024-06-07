import i18next from 'i18next';
export const dateToString = date => {
  const mm = date.getMonth() + 1; // getMonth() is zero-based
  const dd = date.getDate();

  return [
    date.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd,
  ].join('-');
};

export const filterUniqueData = array => [...new Set(array)];

export const getEventKey = e =>
  e.event_key ||
  `${e.event_type}/pregnancy-${e.pregnancy_id}/weeks-${e.weeks_pregnant}/${e.date}`;

export const languages = {
  English: {key: 'en-US', value: i18next.t('language_dropdown_english_text')},
  Arabic: {key: 'ar', value: i18next.t('language_dropdown_arabic_text')},
  Turkish: {key: 'tr', value: i18next.t('language_dropdown_turkish_text')},
  Dari: {key: 'prs', value: i18next.t('language_dropdown_dari_text')},
  Pashto: {key: 'pus', value: i18next.t('language_dropdown_pashto_text')},
};
