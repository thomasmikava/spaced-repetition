import { AttributeMapper } from '../../database/attributes';
import { VerbPronoun, type AttributeRecord } from '../../database/types';

type AttributeTransformerFn = (value: AttributeRecord, lang: string) => string;

export const getAttributeTransformer = (transformerName: string, lang: string): AttributeTransformerFn | undefined => {
  if (lang === 'fr') {
    return getFrenchAttributeTransformer(transformerName);
  }
  return undefined;
};

const getFrenchAttributeTransformer = (transformerName: string): AttributeTransformerFn | undefined => {
  if (transformerName === 'subjunctivePronoun') return frenchSubjunctivePronounTransformer;
};

const frenchSubjunctivePronounTransformer: AttributeTransformerFn = (value) => {
  switch (value.id) {
    case AttributeMapper.PRONOUN.records[VerbPronoun.ich]:
      return 'que je';
    case AttributeMapper.PRONOUN.records[VerbPronoun.du]:
      return 'que tu';
    case AttributeMapper.PRONOUN.records[VerbPronoun.er_sie_es]:
      return "qu'il/elle";
    case AttributeMapper.PRONOUN.records[VerbPronoun.wir]:
      return 'que nous';
    case AttributeMapper.PRONOUN.records[VerbPronoun.ihr]:
      return 'que vous';
    case AttributeMapper.PRONOUN.records[VerbPronoun.sie_Sie]:
      return "qu'ils/elles";
    default:
      return value.name;
  }
};
