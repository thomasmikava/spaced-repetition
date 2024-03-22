import { articles } from '../database/articles';
import { VerbPronoun, VerbMood, VerbTense, NounGender, CardType, NounNumber, Case } from '../database/types';

export function getPronounDisplayName(pronoun: VerbPronoun) {
  return {
    [VerbPronoun.ich]: 'ich',
    [VerbPronoun.du]: 'du',
    [VerbPronoun.er_sie_es]: 'er/sie/es',
    [VerbPronoun.wir]: 'wir',
    [VerbPronoun.ihr]: 'ihr',
    [VerbPronoun.sie_Sie]: 'sie/Sie',
  }[pronoun];
}

export function getGenderDisplayName(gender: NounGender) {
  return {
    [NounGender.Maskulinum]: 'Maskulinum',
    [NounGender.Femininum]: 'Femininum',
    [NounGender.Neutrum]: 'Neutrum',
    [NounGender.Plural]: 'Plural',
  }[gender];
}
export function getCaseDisplayName(caseId: Case) {
  return {
    [Case.Nominativ]: 'Nominativ',
    [Case.Akkusativ]: 'Akkusativ',
    [Case.Genitiv]: 'Genitiv',
    [Case.Dativ]: 'Dativ',
  }[caseId];
}

export function getNumberDisplayName(number: NounNumber) {
  return {
    [NounNumber.singular]: 'Singular',
    [NounNumber.plural]: 'Plural',
  }[number];
}

export function getWithArticle(word: string, gender: NounGender) {
  const prefix = {
    [NounGender.Maskulinum]: 'der ',
    [NounGender.Femininum]: 'die ',
    [NounGender.Neutrum]: 'das ',
    [NounGender.Plural]: '',
  }[gender];
  return prefix + word;
}
export function getArticle(number: NounNumber, gender: NounGender, isDefinite = true, caseId: Case = Case.Nominativ) {
  return articles
    .find(
      (a) =>
        a.number === number && a.isDefinite === isDefinite && (number !== NounNumber.singular || a.gender === gender),
    )
    ?.variants.find((v) => v.case === caseId)?.value;
}

export function getWithSymbolArticle(word: string, gender: NounGender) {
  const prefix = {
    [NounGender.Maskulinum]: '♂ ',
    [NounGender.Femininum]: '♀ ',
    [NounGender.Neutrum]: '⚥ ',
    [NounGender.Plural]: '',
  }[gender];
  return prefix + word;
}

export function getVerbMeta(mood: VerbMood, tense: VerbTense) {
  let moodName = {
    [VerbMood.Indikativ]: 'Indikativ',
    [VerbMood.Konjunktiv]: 'Konjunktiv',
    [VerbMood.Imperativ]: 'Imperativ',
  }[mood];
  let tenseName = {
    [VerbTense.Präsens]: 'Präsens',
    [VerbTense.Präteritum]: 'Präteritum',
    [VerbTense.Perfekt]: 'Perfekt',
    [VerbTense.Plusquamperfekt]: 'Plusquamperfekt',
    [VerbTense.Futur1]: 'Futur I',
    [VerbTense.Futur2]: 'Futur II',
    [VerbTense.Futur2_1]: 'Futur I',
    [VerbTense.Futur2_2]: 'Futur II',
  }[tense];
  if (mood === VerbMood.Konjunktiv) {
    if (tense === VerbTense.Präsens) moodName = 'Konjunktiv I';
    if (tense === VerbTense.Perfekt) moodName = 'Konjunktiv I';
    if (tense === VerbTense.Präteritum) moodName = 'Konjunktiv II';
    if (tense === VerbTense.Plusquamperfekt) moodName = 'Konjunktiv II';
    if (tense === VerbTense.Futur1) moodName = 'Konjunktiv I';
    if (tense === VerbTense.Futur2) moodName = 'Konjunktiv I';
    if (tense === VerbTense.Futur2_1) moodName = 'Konjunktiv II';
    if (tense === VerbTense.Futur2_2) moodName = 'Konjunktiv II';
  }
  return {
    mood: moodName,
    tense: tenseName,
  };
}

export const getPartOfSentenceNames = (cardType: CardType.NOUN | CardType.VERB | CardType.ARTICLE) => {
  return {
    [CardType.VERB]: 'Verb',
    [CardType.NOUN]: 'Nomen',
    [CardType.ARTICLE]: 'Artikel',
  }[cardType];
};
