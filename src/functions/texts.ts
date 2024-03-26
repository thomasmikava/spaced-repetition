import { articles } from '../database/articles';
import {
  VerbPronoun,
  VerbMood,
  VerbTense,
  NounGender,
  CardType,
  NounNumber,
  Case,
  AdjectiveDegree,
  AdjectiveInflection,
} from '../database/types';

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
export function getGenderColor(gender: NounGender) {
  return {
    [NounGender.Maskulinum]: Colors.blue,
    [NounGender.Femininum]: Colors.pink,
    [NounGender.Neutrum]: Colors.violet,
    [NounGender.Plural]: Colors.green,
  }[gender];
}
export function getArticleTypeDisplayName(isDefinite: boolean) {
  return isDefinite ? 'Bestimmter' : 'Unbestimmter';
}
export function getArticleTypeColor(isDefinite: boolean) {
  return isDefinite ? Colors.lightBlue : Colors.green;
}

export function getCaseDisplayName(caseId: Case) {
  return {
    [Case.Nominativ]: 'Nominativ',
    [Case.Akkusativ]: 'Akkusativ',
    [Case.Genitiv]: 'Genitiv',
    [Case.Dativ]: 'Dativ',
  }[caseId];
}
export function getCaseColor(caseId: Case) {
  return {
    [Case.Nominativ]: Colors.lightBlue,
    [Case.Akkusativ]: Colors.orange,
    [Case.Genitiv]: Colors.pink,
    [Case.Dativ]: Colors.green,
  }[caseId];
}

export function getNumberDisplayName(number: NounNumber) {
  return {
    [NounNumber.singular]: 'Singular',
    [NounNumber.plural]: 'Plural',
  }[number];
}
export function getNumberColor(number: NounNumber) {
  return {
    [NounNumber.singular]: Colors.lightBlue,
    [NounNumber.plural]: Colors.green,
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

// eslint-disable-next-line sonarjs/cognitive-complexity
export function getVerbMeta(mood: VerbMood, tense: VerbTense) {
  let moodName = {
    [VerbMood.Indikativ]: 'Indikativ',
    [VerbMood.Konjunktiv]: 'Konjunktiv',
    [VerbMood.Imperativ]: 'Imperativ',
  }[mood];
  const tenseName = {
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

const Colors = {
  lightBlue: '#1798b6',
  green: '#5ca810',
  orange: '#b65717',
  pink: '#b617af',
  violet: '#6517b6',
  blue: '#173eb6',
};

export const getTenseColor = (tense: VerbTense) => {
  return {
    [VerbTense.Präsens]: Colors.lightBlue,
    [VerbTense.Präteritum]: Colors.orange,
    [VerbTense.Perfekt]: Colors.green,
    [VerbTense.Plusquamperfekt]: 'orange',
    [VerbTense.Futur1]: 'red',
    [VerbTense.Futur2]: 'red',
    [VerbTense.Futur2_1]: 'red',
    [VerbTense.Futur2_2]: 'red',
  }[tense];
};

export const getMoodColor = (mood: VerbMood) => {
  return mood ? Colors.lightBlue : '';
};

export const getPartOfSentenceNames = (
  cardType: CardType.NOUN | CardType.VERB | CardType.ARTICLE | CardType.ADJECTIVE,
) => {
  return {
    [CardType.VERB]: 'Verb',
    [CardType.NOUN]: 'Nomen',
    [CardType.ARTICLE]: 'Artikel',
    [CardType.ADJECTIVE]: 'Adj. Adv.',
  }[cardType];
};

export function getDegreeDisplayName(degree: AdjectiveDegree) {
  return {
    [AdjectiveDegree.Positiv]: 'Positiv',
    [AdjectiveDegree.Komparativ]: 'Komparativ',
    [AdjectiveDegree.Superlativ]: 'Superlativ',
  }[degree];
}
export function getDegreeColor(degree: AdjectiveDegree) {
  return {
    [AdjectiveDegree.Positiv]: Colors.lightBlue,
    [AdjectiveDegree.Komparativ]: Colors.orange,
    [AdjectiveDegree.Superlativ]: Colors.green,
  }[degree];
}

export function getInflationDisplayName(inflation: AdjectiveInflection) {
  return {
    [AdjectiveInflection.Strong]: 'Stark',
    [AdjectiveInflection.Weak]: 'Schwach',
    [AdjectiveInflection.Mixed]: 'Gemischt',
  }[inflation];
}
export function getInflationColor(inflation: AdjectiveInflection) {
  return {
    [AdjectiveInflection.Strong]: Colors.lightBlue,
    [AdjectiveInflection.Weak]: Colors.orange,
    [AdjectiveInflection.Mixed]: Colors.violet,
  }[inflation];
}
