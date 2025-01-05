import { ReviewBlock } from '../api/controllers/history/history.schema';
import type { TranslationObjDTO } from '../api/controllers/words/words.schema';
import type { StandardCardVariant } from '../database/types';
import { uniquelize } from '../utils/array';
import { generateHash8 } from '../utils/hash';
import type { StandardTestableCard } from './reviews';

export abstract class ReviewBlockManager {
  protected readonly block: ReviewBlock;
  constructor(block: number) {
    if (block === ReviewBlock.standard || block === ReviewBlock.AI) {
      this.block = block;
    } else {
      throw new Error('Invalid block type ' + block);
    }
  }

  getBlock(): ReviewBlock {
    return this.block;
  }

  abstract isGroupViewDisabled(): boolean;

  abstract isIndividualViewDisabled(): boolean;

  abstract getTestKey(options: {
    variant: StandardCardVariant;
    isInverted: boolean;
    translation?: { lang: string; text: string };
  }): string;

  protected getHashedTranslationKey(translation: { lang: string; text: string }): string {
    return translation.lang + '-' + generateHash8(normalizeText(translation.text));
  }

  abstract regenerateTestableCards(options: {
    testableCard: StandardTestableCard;
    translations: TranslationObjDTO[];
  }): StandardTestableCard[];
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[\s.,:;!?()/\\&@#$%^*_+-]/g, '');
}

class StandardBlockManager extends ReviewBlockManager {
  constructor() {
    super(ReviewBlock.standard);
  }

  isGroupViewDisabled(): boolean {
    return false;
  }

  isIndividualViewDisabled(): boolean {
    return false;
  }

  getTestKey({ variant, isInverted }: { variant: StandardCardVariant; isInverted: boolean }): string {
    if (!isInverted) return 'ind-' + variant.id;
    return 'ind-t-' + variant.id;
  }

  regenerateTestableCards({ testableCard }: { testableCard: StandardTestableCard }): StandardTestableCard[] {
    return [testableCard];
  }
}

class AIBlockManager extends ReviewBlockManager {
  constructor() {
    super(ReviewBlock.AI);
  }

  isGroupViewDisabled(): boolean {
    return true;
  }

  isIndividualViewDisabled(): boolean {
    return true;
  }

  getTestKey({
    variant,
    isInverted,
    translation,
  }: {
    variant: StandardCardVariant;
    isInverted: boolean;
    translation?: { lang: string; text: string };
  }): string {
    if (!isInverted) {
      if (variant.category !== 1 || !translation) return 'ind-' + variant.id;
      const translationKey = this.getHashedTranslationKey(translation);
      return 'indH-' + variant.id + '-' + translationKey;
    }
    if (variant.category !== 1 || !translation) return 'ind-t-' + variant.id;
    const translationKey = this.getHashedTranslationKey(translation);
    return 'ind-tH-' + variant.id + '-' + translationKey;
  }

  regenerateTestableCards({
    testableCard,
    translations,
  }: {
    testableCard: StandardTestableCard;
    translations: TranslationObjDTO[];
  }): StandardTestableCard[] {
    if (!testableCard.initial) {
      const mainTranslation = getMainTranslation(translations);
      if (!mainTranslation) return [];
      return [{ ...testableCard, specificTranslation: mainTranslation }];
    }
    const extraInfo = translations
      .map((translation) => {
        if (translation.advancedTranslation) {
          return translation.advancedTranslation.map((adv) => ({
            lang: translation.lang,
            text: adv.translation,
          }));
        }
        return {
          lang: translation.lang,
          text: translation.translation,
        };
      })
      .flat();

    const mapped = uniquelize(
      extraInfo.map((translation) => ({
        testKey: this.getTestKey({
          variant: testableCard.variant,
          isInverted: false,
          translation,
        }),
        translation,
      })),
      (e) => e.testKey,
    );
    const connectedTestKeys = mapped.length > 1 ? mapped.map((e) => e.testKey) : undefined;
    return mapped.map(({ testKey, translation }): StandardTestableCard => {
      return {
        ...testableCard,
        testKey,
        specificTranslation: translation,
        connectedTestKeys,
      };
    });
  }
}

function getMainTranslation(translations: TranslationObjDTO[]): { lang: string; text: string } | undefined {
  for (const translation of translations) {
    if (translation.advancedTranslation) {
      const text = translation.advancedTranslation.map((adv) => adv.translation).join('; ');
      if (text) {
        return { lang: translation.lang, text };
      }
    }
    if (translation.translation) {
      return { lang: translation.lang, text: translation.translation };
    }
  }
}

export function getReviewBlockManager(block: number): ReviewBlockManager {
  if (block === ReviewBlock.standard) return new StandardBlockManager();
  if (block === ReviewBlock.AI) return new AIBlockManager();
  throw new Error('Unknown block type');
}
