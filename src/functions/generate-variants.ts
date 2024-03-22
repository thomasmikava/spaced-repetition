import { AnyCard, CardType, Case, NounGender, NounNumber, VerbMood, VerbTense } from '../database/types';
import { AnyTestableCard, ArticleTestableCard, NounTestableCard, VerbTestableCard } from './reviews';

function isVerbMoodDisabled(mood: VerbMood): boolean {
  return mood !== VerbMood.Indikativ;
}
function isVerbTenseDisabled(tense: VerbTense, mood: VerbMood): boolean {
  return tense !== VerbTense.Präsens && tense !== VerbTense.Perfekt;
}

function isNounVariantDisabled(number: NounNumber, case_: Case): boolean {
  if (number === NounNumber.singular) return case_ !== Case.Genitiv;
  return case_ !== Case.Nominativ && case_ !== Case.Dativ;
}

function isArticleVariantDisabled(number: NounNumber, gender: NounGender, case_: Case): boolean {
  return case_ === Case.Nominativ;
}

export function generateTestableCards(card: AnyCard): AnyTestableCard[] {
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
  }
  if (1 < 2) return [];
  throw new Error('Unsupported card type ' + (card as any).type);
}
