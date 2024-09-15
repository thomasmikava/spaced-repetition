import { array, boolean, object, record, string } from 'zod';
import { useValidators } from '../../utils/useValidators';

export const useValidation = () => {
  const { createObjectResolver } = useValidators();

  const singlePreference = object({
    autoSubmitCorrectAnswers: boolean().nullish(),
    testTypingTranslation: boolean().nullish(),
    askNonStandardVariants: boolean().nullish(),
    translationAtBottom: boolean().nullish(),
    hideRegularTranslationIfAdvanced: boolean().nullish(),
  });

  const UserLangCardGroupSettings = object({
    hideGroup: boolean().nullish(),
    askNonStandardVariants: boolean().nullish(),
  });

  const cardTypePreference = object({
    hideGroups: boolean().nullish(),
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
