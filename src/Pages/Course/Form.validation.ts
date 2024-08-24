import { array, boolean, string } from 'zod';
import { useValidators } from '../../utils/useValidators';

export const useValidation = () => {
  const { createObjectResolver, validators } = useValidators();

  return {
    resolver: createObjectResolver({
      title: validators.trim(string().min(1)),
      description: validators.trim(string()),
      langToLearn: string().length(2),
      translationLangs: array(string().length(2)).min(1),
      isOfficial: boolean(),
      isPublic: boolean(),
    }),
  };
};
