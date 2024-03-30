import type { AnyCard } from '../database/types';
import { NounGender, AdjectiveInflection } from '../database/types';
import { AdjectiveDegree, CardType, Case, NounNumber, VerbMood, VerbTense } from '../database/types';
import type {
  AdjectiveTestableCard,
  AnyTestableCard,
  ArticleTestableCard,
  NounTestableCard,
  VerbTestableCard,
} from './reviews';

function isVerbMoodDisabled(mood: VerbMood): boolean {
  return mood !== VerbMood.Indikativ;
}
function isVerbTenseDisabled(tense: VerbTense, mood: VerbMood): boolean {
  return mood !== null && tense !== VerbTense.Präsens && tense !== VerbTense.Perfekt;
}

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
    for (const variant of card.variants) {
      if (isVerbMoodDisabled(variant.mood)) continue;
      for (const tense of variant.tenses) {
        if (isVerbTenseDisabled(tense.tense, variant.mood)) continue;
        for (const conjugation of tense.conjugations) {
          allVariants.push({
            type: CardType.VERB,
            card,
            initial: false,
            variant: {
              mood: variant.mood,
              tense: tense.tense,
              conjugation,
            },
            testKey: `${valueKey}#${variant.mood}.${tense.tense}.${conjugation.pronoun}.${conjugation.value}`,
            groupViewKey: `${valueKey}#${variant.mood}.${tense.tense}`,
            hasGroupViewMode: true,
            hasIndividualViewMode: false,
          });
        }
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
        value: card.komparativ,
      } as never);
    }
    if (card.superlativ) {
      allVariants.push({
        ...allVariants[0],
        initial: false,
        degree: AdjectiveDegree.Superlativ,
        testKey: `${valueKey}#${AdjectiveDegree.Superlativ}`,
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
        card: { value: card.value, translation: card.translation, caseSensitive: false },
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
        card: { value: card.value, translation: card.translation, caseSensitive: false },
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
        testKey: valueKey,
        groupViewKey: null,
        hasGroupViewMode: false,
        hasIndividualViewMode: true,
      },
    ];
  }
  throw new Error('Unsupported card type ' + (card as Record<string, unknown>).type);
}

function addPreviousGroups(allVariants: AnyTestableCard[]): AnyTestableCard[] {
  let lastGroupKey: string | null = null;
  let currentGroupKey: string | null = null;
  return allVariants.map((variant): AnyTestableCard => {
    if (variant.groupViewKey !== lastGroupKey) {
      if (variant.groupViewKey !== currentGroupKey) lastGroupKey = currentGroupKey;
      currentGroupKey = variant.groupViewKey;
      return { ...variant, previousGroupViewKey: lastGroupKey };
    }
    currentGroupKey = variant.groupViewKey;
    return variant;
  });
}

export function generateTestableCards(card: AnyCard): AnyTestableCard[] {
  return addPreviousGroups(_generateTestableCards(card));
}
