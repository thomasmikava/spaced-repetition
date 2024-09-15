import type { UserGlobalPreferencesDTO, UserPreferencesDTO } from '../api/controllers/users/users.schema';

export type Preferences = Required<UserGlobalPreferencesDTO>;

export const defaultPreferences: Preferences = {
  autoSubmitCorrectAnswers: false,
  testTypingTranslation: false,
  askNonStandardVariants: true,
};

export const calculatePreferences = (preferences: UserPreferencesDTO | null, lang: string): Preferences => {
  if (!preferences) {
    return defaultPreferences;
  }

  const langPref = preferences.perLang[lang];
  const globalPref = preferences.global;

  return {
    autoSubmitCorrectAnswers:
      langPref?.autoSubmitCorrectAnswers ??
      globalPref.autoSubmitCorrectAnswers ??
      defaultPreferences.autoSubmitCorrectAnswers,
    testTypingTranslation:
      langPref?.testTypingTranslation ?? globalPref.testTypingTranslation ?? defaultPreferences.testTypingTranslation,
    askNonStandardVariants:
      langPref?.askNonStandardVariants ??
      globalPref.askNonStandardVariants ??
      defaultPreferences.askNonStandardVariants,
  };
};
