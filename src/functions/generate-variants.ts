import type { AnyCard } from '../database/types';
import { NounGender, AdjectiveInflection, PronounFunction } from '../database/types';
import { AdjectiveDegree, CardType, Case, NounNumber, VerbMood, VerbTense } from '../database/types';
import type {
  AdjectiveTestableCard,
  AnyTestableCard,
  ArticleTestableCard,
  NounTestableCard,
  PronounTestableCard,
  VerbTestableCard,
} from './reviews';

function isVerbTenseDisabled(tense: VerbTense, mood: VerbMood): boolean {
  return mood !== VerbMood.Indikativ || (mood !== null && tense !== VerbTense.Präsens && tense !== VerbTense.Perfekt);
}

const VERB_MAX_TENSES = 2;

function isNounVariantDisabled(number: NounNumber, case_: Case): boolean {
  if (number === NounNumber.singular) return case_ !== Case.Genitiv;
  return case_ !== Case.Nominativ && case_ !== Case.Dativ;
}

function isArticleVariantDisabled(number: NounNumber, gender: NounGender, case_: Case): boolean {
  return number !== undefined && gender !== undefined && case_ === Case.Nominativ;
}

function isAdjectiveVariantDisabled(degree: AdjectiveDegree, inflection: AdjectiveInflection): boolean {
  return degree !== AdjectiveDegree.Positiv || inflection !== AdjectiveInflection.Strong;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
function _generateTestableCards(card: AnyCard): AnyTestableCard[] {
  const value = card.uniqueValue ?? card.value;
  const valueKey = `#${value}`;
  if (card.type === CardType.VERB) {
    const allVariants: VerbTestableCard[] = [
      {
        type: CardType.VERB,
        card,
        initial: true,
        testKey: valueKey,
        groupViewKey: null,
        hasGroupViewMode: false,
        hasIndividualViewMode: true,
      },
    ];
    const tenseVariants = card.variants
      .flatMap((mood) => mood.tenses.map((tense) => ({ mood: mood.mood, tense })))
      .sort((a, b) => {
        if (typeof a.tense.priority === 'number' && typeof b.tense.priority === 'number') {
          return a.tense.priority - b.tense.priority;
        }
        if (typeof a.tense.priority === 'number') return -1;
        if (typeof b.tense.priority === 'number') return 1;
        // TODO: build object of default priorities
        return 0;
      })
      .slice(0, VERB_MAX_TENSES);
    for (const { mood, tense } of tenseVariants) {
      for (const conjugation of tense.conjugations) {
        allVariants.push({
          type: CardType.VERB,
          card,
          initial: false,
          variant: {
            mood,
            tense: tense.tense,
            conjugation,
          },
          testKey: `${valueKey}#${mood}.${tense.tense}.${conjugation.pronoun}.${conjugation.value}`,
          groupViewKey: `${valueKey}#${mood}.${tense.tense}`,
          hasGroupViewMode: true,
          hasIndividualViewMode: false,
        });
      }
    }
    return allVariants;
  } else if (card.type === CardType.NOUN) {
    const allVariants: NounTestableCard[] = [
      {
        type: CardType.NOUN,
        card,
        initial: true,
        testKey: valueKey,
        groupViewKey: null,
        hasGroupViewMode: false,
        hasIndividualViewMode: true,
      },
    ];
    for (const variant of card.variants) {
      if (isNounVariantDisabled(variant.number, variant.case)) continue;
      allVariants.push({
        type: CardType.NOUN,
        card,
        initial: false,
        variant,
        testKey: `${valueKey}#${variant.number}.${variant.case}.${variant.value}`,
        groupViewKey: `${valueKey}#${variant.number}`,
        hasGroupViewMode: true,
        hasIndividualViewMode: false,
      });
    }
    return allVariants;
  } else if (card.type === CardType.ARTICLE) {
    const allVariants: ArticleTestableCard[] = [
      {
        type: CardType.ARTICLE,
        card,
        initial: true,
        testKey: valueKey,
        groupViewKey: null,
        hasGroupViewMode: false,
        hasIndividualViewMode: true,
      },
    ];
    for (const variant of card.variants) {
      if (isArticleVariantDisabled(card.number, card.gender, variant.case)) continue;
      allVariants.push({
        type: CardType.ARTICLE,
        card,
        initial: false,
        variant,
        testKey: `${valueKey}#${card.number}.${card.gender}.${variant.case}.${variant.value}`,
        groupViewKey: `${valueKey}#${card.number}.${card.gender}`,
        hasGroupViewMode: true,
        hasIndividualViewMode: false,
      });
    }
    return allVariants;
  } else if (card.type === CardType.ADJECTIVE) {
    const allVariants: AdjectiveTestableCard[] = [
      {
        type: CardType.ADJECTIVE,
        card,
        initial: true,
        isInitialTrio: true,
        degree: AdjectiveDegree.Positiv,
        testKey: `${valueKey}#${AdjectiveDegree.Positiv}`,
        value: card.value,
        groupViewKey: null,
        hasGroupViewMode: false,
        hasIndividualViewMode: true,
      },
    ];
    if (card.komparativ) {
      allVariants.push({
        ...allVariants[0],
        initial: false,
        degree: AdjectiveDegree.Komparativ,
        testKey: `${valueKey}#${AdjectiveDegree.Komparativ}`,
        groupViewKey: `${valueKey}#${AdjectiveDegree.Komparativ}`,
        value: card.komparativ,
      } as never);
    }
    if (card.superlativ) {
      allVariants.push({
        ...allVariants[0],
        initial: false,
        degree: AdjectiveDegree.Superlativ,
        testKey: `${valueKey}#${AdjectiveDegree.Superlativ}`,
        groupViewKey: `${valueKey}#${AdjectiveDegree.Superlativ}`,
        value: card.superlativ,
      } as never);
    }
    const genders = [NounGender.Maskulinum, NounGender.Femininum, NounGender.Neutrum, NounGender.Plural];
    for (const variant of card.variants) {
      if (isAdjectiveVariantDisabled(variant.degree, variant.inflection)) continue;
      for (const [case_, ...rest] of variant.values) {
        rest.forEach((value, index) => {
          const gender = genders[index];
          allVariants.push({
            type: CardType.ADJECTIVE,
            card,
            initial: false,
            isInitialTrio: false,
            testKey: `${valueKey}#${variant.degree}.${variant.inflection}.${gender}.${case_}.${value}`,
            groupViewKey: `${valueKey}#${variant.degree}.${variant.inflection}.${gender}`,
            hasGroupViewMode: true,
            hasIndividualViewMode: false,
            variant: {
              case: case_,
              degree: variant.degree,
              gender,
              inflection: variant.inflection,
              number: index > 2 ? NounNumber.plural : NounNumber.singular,
              value,
            },
          });
        });
      }
    }
    return allVariants;
  } else if (card.type === CardType.PHRASE) {
    return [
      {
        type: null,
        typeTag: 'Phrase',
        initial: true,
        card: { value: card.value, type: CardType.PHRASE, translation: card.translation, caseSensitive: false },
        testKey: valueKey,
        groupViewKey: null,
        hasGroupViewMode: false,
        hasIndividualViewMode: true,
      },
    ];
  } else if (card.type === CardType.CONJUNCTION) {
    return [
      {
        type: null,
        typeTag: 'Konjunktion',
        initial: true,
        card: { value: card.value, type: CardType.CONJUNCTION, translation: card.translation, caseSensitive: false },
        testKey: valueKey,
        groupViewKey: null,
        hasGroupViewMode: false,
        hasIndividualViewMode: true,
      },
    ];
  } else if (card.type === CardType.PREPOSITION) {
    return [
      {
        type: CardType.PREPOSITION,
        card,
        initial: true,
        testKey: valueKey,
        groupViewKey: null,
        hasGroupViewMode: false,
        hasIndividualViewMode: true,
      },
    ];
  } else if (card.type === CardType.PRONOUN) {
    const allVariants: PronounTestableCard[] = [];
    const genders = [NounGender.Maskulinum, NounGender.Femininum, NounGender.Neutrum, NounGender.Plural];
    for (const variant of card.variants) {
      for (const [case_, ...rest] of variant.values) {
        rest.forEach((value, index, arr) => {
          if (value === null) return;
          const gender = variant.function === PronounFunction.Declanation ? null : genders[index];
          const pluralIndex = arr.length - 1;
          const number = index >= pluralIndex ? NounNumber.plural : NounNumber.singular;
          allVariants.push({
            type: CardType.PRONOUN,
            card,
            initial: false,
            testKey: `${valueKey}#${variant.function}.${number}.${gender}.${case_}.${value}`,
            groupViewKey: `${valueKey}#${variant.function}.${number}.${gender}.${case_}`,
            hasGroupViewMode: true,
            hasIndividualViewMode: false,
            function: variant.function,
            variant: {
              case: case_,
              gender,
              function: variant.function,
              number,
              value,
            },
          });
        });
      }
    }
    return allVariants;
  }
  throw new Error('Unsupported card type ' + (card as Record<string, unknown>).type);
}

function addPreviousGroups(allVariants: AnyTestableCard[]): AnyTestableCard[] {
  let lastGroupKey: string | null = null;
  let currentGroupKey: string | null = null;
  let groupLevel = 0;
  return allVariants.map((variant): AnyTestableCard => {
    if (variant.groupViewKey !== lastGroupKey) {
      if (variant.groupViewKey !== currentGroupKey) {
        lastGroupKey = currentGroupKey;
        groupLevel++;
      }
      currentGroupKey = variant.groupViewKey;
      return { ...variant, previousGroupViewKey: lastGroupKey, groupLevel };
    }
    currentGroupKey = variant.groupViewKey;
    return variant;
  });
}

export function generateTestableCards(card: AnyCard): AnyTestableCard[] {
  return addPreviousGroups(_generateTestableCards(card));
}
