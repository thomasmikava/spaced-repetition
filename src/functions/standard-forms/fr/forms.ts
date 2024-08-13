import { NounNumber } from '../../../database/types';
import { AdjectiveDegree, NounGender } from '../../../database/types';
import { mergeSplitted, slashSplit } from '../../../utils/split';

export const generateNounPluralStandardVariant = (singularForm: string): string | null => {
  if (singularForm.endsWith('al')) {
    return singularForm.slice(0, -2) + 'aux';
  }
  if (singularForm.endsWith('au') || singularForm.endsWith('eu')) {
    return singularForm + 'x';
  }
  const lastLetter = singularForm[singularForm.length - 1];
  if (lastLetter === 's' || lastLetter === 'x' || lastLetter === 'z') {
    return singularForm;
  }
  return singularForm + 's';
};

export const getAdjectiveTrioStandardForm = (
  adjective: string,
  degree: AdjectiveDegree.Komparativ | AdjectiveDegree.Superlativ,
): string | null => {
  if (degree === AdjectiveDegree.Komparativ) {
    return `plus ${adjective} que`;
  }

  return `le ${adjective} grand`;
};

export const getAdjectiveStandardForm = (
  singularMasculine: string,
  singularFeminine: string | null,
  gender: NounGender,
  number: NounNumber,
  // eslint-disable-next-line sonarjs/cognitive-complexity
): string | null => {
  if (!singularMasculine) return null;
  if (gender === NounGender.Maskulinum && singularMasculine && singularMasculine.includes('/')) {
    return mergeSplitted(
      slashSplit(singularMasculine).map((v) => getAdjectiveStandardForm(v, singularFeminine, gender, number)),
    );
  }
  if (gender === NounGender.Femininum && singularFeminine && singularFeminine.includes('/')) {
    return mergeSplitted(
      slashSplit(singularFeminine).map((v) => getAdjectiveStandardForm(singularMasculine, v, gender, number)),
    );
  }

  if (number === NounNumber.singular && gender === NounGender.Maskulinum) {
    return null;
  }
  if (number === NounNumber.plural && gender === NounGender.Maskulinum) {
    const singularForm = singularMasculine;
    const lastLetter = singularForm[singularForm.length - 1];
    if (lastLetter === 's' || lastLetter === 'x' || lastLetter === 'z') {
      return singularForm;
    }
    if (singularForm.endsWith('eau') || singularForm.endsWith('eu')) {
      return singularForm + 'x';
    }
    if (singularForm.endsWith('al')) {
      return singularForm.slice(0, -2) + 'aux';
    }
    return singularForm + 's';
  }
  if (number === NounNumber.singular && gender === NounGender.Femininum) {
    const lastLetter = singularMasculine[singularMasculine.length - 1];
    if (lastLetter === 'e') {
      return singularMasculine;
    }
    if (lastLetter === 'f') {
      return singularMasculine.slice(0, -1) + 've';
    }
    if (singularMasculine.endsWith('er')) {
      return singularMasculine.slice(0, -2) + 'ère';
    }
    if (lastLetter === 's' || lastLetter === 'x') {
      return singularMasculine.slice(0, -1) + 'se';
    }
    return singularMasculine + 'e';
  }
  if (number === NounNumber.plural && gender === NounGender.Femininum) {
    const singularForm = singularFeminine;
    if (!singularForm) return null;
    const lastLetter = singularForm[singularForm.length - 1];
    if (lastLetter === 's') {
      return singularForm;
    }
    return singularForm + 's';
  }
  return null;
};
