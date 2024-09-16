import { array, boolean, object, record, string, enum as zodEnum } from 'zod';
import { useValidators } from '../../utils/useValidators';
import { TranslationPosition } from '../../api/controllers/users/users.schema';

export const useValidation = () => {
  const { createObjectResolver } = useValidators();

  const singlePreference = object({
    autoSubmitCorrectAnswers: boolean().nullish(),
    testTypingTranslation: boolean().nullish(),
    askNonStandardVariants: boolean().nullish(),
    transPos: zodEnum([TranslationPosition.top, TranslationPosition.bottom, TranslationPosition.split]).nullish(),
    hideRegularTranslationIfAdvanced: boolean().nullish(),
    hideForms: boolean().nullish(),
  });

  const UserLangCardGroupSettings = object({
    hideGroup: boolean().nullish(),
    askNonStandardVariants: boolean().nullish(),
  });

  const cardTypePreference = object({
    hideForms: boolean().nullish(),
    askNonStandardVariants: boolean().nullish(),
    groupOrder: array(string()).optional(),
    groupSettings: array(
      object({
        group: string(),
        preferences: UserLangCardGroupSettings,
      }),
    ).optional(),
  });

  const langPreference = singlePreference.extend({
    cardTypeSettings: record(cardTypePreference.optional()).optional(),
  });

  return {
    resolver: createObjectResolver({
      global: singlePreference,
      languages: array(
        object({
          lang: string(),
          preferences: langPreference,
        }),
      ),
    }),
  };
};
