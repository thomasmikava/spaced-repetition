import { ReviewBlock } from '../api/controllers/history/history.schema';
import type { TranslationObjDTO } from '../api/controllers/words/words.schema';
import type { StandardCardVariant } from '../database/types';
import { uniquelize } from '../utils/array';
import { generateHash8 } from '../utils/hash';
import type { StandardTestableCard } from './reviews';

export abstract class ReviewBlockManager<Block extends ReviewBlock = ReviewBlock> {
  protected readonly block: Block;
  constructor(block: Block) {
    if (block === ReviewBlock.standard || block === ReviewBlock.AI) {
      this.block = block;
    } else {
      throw new Error('Invalid block type ' + block);
    }
  }

  getBlock(): Block {
    return this.block;
  }

  abstract isGroupViewDisabled(): boolean;

  abstract isIndividualViewDisabled(): boolean;

  abstract getTestKey(options: {
    variant: StandardCardVariant;
    isInverted: boolean;
    translation?: TranslationItem;
  }): string;

  protected getHashedTranslationKey(translation: TranslationItem): string {
    return translation.lang + '-' + generateHash8(normalizeText(translation.text));
  }

  abstract regenerateTestableCards(options: {
    testableCard: Omit<StandardTestableCard, 'testKey'>;
    translations: TranslationObjDTO[];
    includeReverseCards: boolean;
    getInvertedTestableCard: GetInvertedTestableCard;
  }): StandardTestableCard[];

  abstract getKeysWithinBlock(options: GetBlockKeysOptions): {
    block: Block;
    testKey: string;
  }[];
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[\s.,:;!?()/\\&@#$%^*_+-]/g, '');
}

class StandardBlockManager extends ReviewBlockManager<ReviewBlock.standard> {
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

  regenerateTestableCards({
    testableCard,
    includeReverseCards,
    translations,
    getInvertedTestableCard,
  }: {
    testableCard: Omit<StandardTestableCard, 'testKey'>;
    includeReverseCards: boolean;
    translations: TranslationObjDTO[];
    getInvertedTestableCard: GetInvertedTestableCard;
  }): StandardTestableCard[] {
    const newTestableCard: StandardTestableCard = {
      ...testableCard,
      testKey: this.getTestKey({ variant: testableCard.variant, isInverted: false }),
    };
    const newConnectedTestKeys = getTransBlockKeys({
      includeReverseKeys: includeReverseCards,
      variant: newTestableCard.variant,
      translations,
      isInitial: newTestableCard.initial,
    });
    newTestableCard.connectedTestKeys = newConnectedTestKeys.map(blockKeyToTestMey);

    if (!includeReverseCards) return [newTestableCard];

    const invertedTestableCard = getInvertedTestableCard(
      newTestableCard,
      this.getTestKey({
        isInverted: true,
        variant: newTestableCard.variant,
      }),
    );
    return [newTestableCard, invertedTestableCard];
  }

  getKeysWithinBlock({ includeReverseKeys, variant }: GetBlockKeysOptions): StandardTestItem[] {
    const block = this.block;
    const myItem: StandardTestItem = {
      block,
      testKey: this.getTestKey({ variant, isInverted: false }),
      isInverted: false,
    };
    if (!includeReverseKeys) return [myItem];
    const revertedItem: StandardTestItem = {
      block,
      testKey: this.getTestKey({ variant, isInverted: true }),
      isInverted: true,
    };
    return [myItem, revertedItem];
  }
}

interface StandardTestItem {
  block: ReviewBlock.standard;
  testKey: string;
  isInverted: boolean;
}

type TranslationItem = {
  lang: string;
  text: string;
};

interface AITestItem {
  block: ReviewBlock.AI;
  testKey: string;
  translation: TranslationItem;
  isInverted: boolean;
}

type TestItem = StandardTestItem | AITestItem;

class AIBlockManager extends ReviewBlockManager<ReviewBlock.AI> {
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
    translation?: TranslationItem;
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

  private getTranslations(isInitial: boolean, translations: TranslationObjDTO[]): TranslationItem[] {
    if (!isInitial) {
      const mainTranslation = getMainTranslation(translations);
      if (!mainTranslation) return [];
      return [mainTranslation];
    }
    return translations
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
  }

  private getTranslationsWithKeys(
    isInitial: boolean,
    isInverted: boolean,
    variant: StandardCardVariant,
    translations: TranslationObjDTO[],
  ): { testKey: string; translation: TranslationItem }[] {
    const mainTranslations = this.getTranslations(isInitial, translations);
    return uniquelize(
      mainTranslations.map((translation) => ({
        testKey: this.getTestKey({
          variant,
          isInverted,
          translation: isInitial ? translation : undefined,
        }),
        translation,
      })),
      (e) => e.testKey,
    );
  }

  regenerateTestableCards({
    testableCard,
    translations,
    includeReverseCards,
    getInvertedTestableCard,
  }: {
    testableCard: Omit<StandardTestableCard, 'testKey'>;
    translations: TranslationObjDTO[];
    includeReverseCards: boolean;
    getInvertedTestableCard: GetInvertedTestableCard;
  }): StandardTestableCard[] {
    const block = this.block;
    const allKeys = getTransBlockKeys({
      includeReverseKeys: includeReverseCards,
      variant: testableCard.variant,
      translations,
      isInitial: testableCard.initial,
    });
    const connectedTestKeys = allKeys.map(blockKeyToTestMey);
    const myBlockKeys = allKeys.filter((e) => e.block === block && !e.isInverted) as AITestItem[];
    const newTestableCards = myBlockKeys.map(({ testKey, translation }): StandardTestableCard => {
      return {
        ...testableCard,
        testKey,
        specificTranslation: translation,
        connectedTestKeys,
      };
    });
    if (!includeReverseCards) return newTestableCards;

    const invertedTestableCards = myBlockKeys.map(({ translation }, index): StandardTestableCard => {
      const invertedTestKey = this.getTestKey({
        variant: testableCard.variant,
        isInverted: true,
        translation,
      });
      return getInvertedTestableCard(newTestableCards[index], invertedTestKey);
    });
    return [...newTestableCards, ...invertedTestableCards];
  }

  getKeysWithinBlock({ includeReverseKeys, variant, translations, isInitial }: GetBlockKeysOptions): AITestItem[] {
    const block = this.block;
    const transKeys = this.getTranslationsWithKeys(isInitial, false, variant, translations);
    const myItems: AITestItem[] = transKeys.map(
      ({ testKey, translation }): AITestItem => ({
        block,
        testKey,
        translation,
        isInverted: false,
      }),
    );
    if (!includeReverseKeys) return myItems;
    const invertedTransKeys = this.getTranslationsWithKeys(isInitial, true, variant, translations);
    const revertedItem: AITestItem[] = invertedTransKeys.map(
      ({ testKey, translation }): AITestItem => ({
        block,
        testKey,
        translation,
        isInverted: true,
      }),
    );
    return myItems.concat(revertedItem);
  }
}

function getMainTranslation(translations: TranslationObjDTO[]): TranslationItem | undefined {
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

type GetInvertedTestableCard = (testableCard: StandardTestableCard, invertedTestKey: string) => StandardTestableCard;

type GetBlockKeysOptions = {
  variant: StandardCardVariant;
  isInitial: boolean;
  includeReverseKeys: boolean;
  translations: TranslationObjDTO[];
};

export function getReviewBlockManager(block: number): ReviewBlockManager {
  if (block === ReviewBlock.standard) return new StandardBlockManager();
  if (block === ReviewBlock.AI) return new AIBlockManager();
  throw new Error('Unknown block type');
}

type ConnectedKey = NonNullable<StandardTestableCard['connectedTestKeys']>[number];

const blockKeyToTestMey = (e: TestItem): ConnectedKey => ({ block: e.block, key: e.testKey });

const standardBlock = new StandardBlockManager();
const aiBlock = new AIBlockManager();
const getTransBlockKeys = ({
  variant,
  includeReverseKeys,
  translations,
  isInitial,
}: {
  variant: StandardCardVariant;
  includeReverseKeys: boolean;
  translations: TranslationObjDTO[];
  isInitial: boolean;
}): TestItem[] => {
  const options: GetBlockKeysOptions = {
    includeReverseKeys,
    variant,
    translations,
    isInitial,
  };
  return [...standardBlock.getKeysWithinBlock(options), ...aiBlock.getKeysWithinBlock(options)];
};
