import { array, boolean, object, string } from 'zod';
import { useValidators } from '../../utils/useValidators';

export const useValidation = () => {
  const { createObjectResolver } = useValidators();

  const singlePreference = object({
    autoSubmitCorrectAnswers: boolean().optional(),
    testTypingTranslation: boolean().optional(),
  });

  return {
    resolver: createObjectResolver({
      global: singlePreference,
      languages: array(
        object({
          lang: string().nullable(),
          preferences: singlePreference,
        }),
      ),
    }),
  };
};
