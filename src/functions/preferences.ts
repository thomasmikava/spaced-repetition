import type {
  UserGlobalPreferencesDTO,
  UserLangPreferencesDTO,
  UserPreferencesDTO,
} from '../api/controllers/users/users.schema';

export type Preferences = Required<UserGlobalPreferencesDTO> & {
  cardTypeSettings: UserLangPreferencesDTO['cardTypeSettings'];
};

export const defaultPreferences: Preferences = {
  autoSubmitCorrectAnswers: false,
  testTypingTranslation: false,
  askNonStandardVariants: true,
  translationAtBottom: false,
  hideRegularTranslationIfAdvanced: false,
  cardTypeSettings: undefined,
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
    translationAtBottom:
      langPref?.translationAtBottom ?? globalPref.translationAtBottom ?? defaultPreferences.translationAtBottom,
    hideRegularTranslationIfAdvanced:
      langPref?.hideRegularTranslationIfAdvanced ??
      globalPref.hideRegularTranslationIfAdvanced ??
      defaultPreferences.hideRegularTranslationIfAdvanced,
    cardTypeSettings: langPref?.cardTypeSettings, // TODO: fill with default values
  };
};
