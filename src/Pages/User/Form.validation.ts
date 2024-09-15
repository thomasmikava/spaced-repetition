import { array, boolean, object, string } from 'zod';
import { useValidators } from '../../utils/useValidators';

export const useValidation = () => {
  const { createObjectResolver } = useValidators();

  const singlePreference = object({
    autoSubmitCorrectAnswers: boolean().nullish(),
    testTypingTranslation: boolean().nullish(),
    askNonStandardVariants: boolean().nullish(),
  });

  return {
    resolver: createObjectResolver({
      global: singlePreference,
      languages: array(
        object({
          lang: string(),
          preferences: singlePreference,
        }),
      ),
    }),
  };
};
