import type { UserPreferencesDTO } from '../api/controllers/users/users.schema';

export interface Preferences {
  autoSubmitCorrectAnswers: boolean;
  testTypingTranslation: boolean;
}

const defaultPreferences: Preferences = {
  autoSubmitCorrectAnswers: false,
  testTypingTranslation: true,
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
  };
};
