import type {
  ReplaceUserPreferencesReqDTO,
  UserCardTypeSettingsDTO,
  UserLangPreferencesDTO,
  UserPreferencesDTO,
} from '../../api/controllers/users/users.schema';
import { objectMap, removeNullableValues } from '../../utils/object';
import type { UserPreferencesFormData, CardTypeSettingsDTO, LangPreference } from './UserPreferencesForm';

export const convertUserPreferencesToFormData = (
  preferences: UserPreferencesDTO | null | undefined,
): UserPreferencesFormData => ({
  global: {
    autoSubmitCorrectAnswers: preferences?.global.autoSubmitCorrectAnswers ?? undefined,
    testTypingTranslation: preferences?.global.testTypingTranslation ?? undefined,
    askNonStandardVariants: preferences?.global.askNonStandardVariants ?? undefined,
    hideRegularTranslationIfAdvanced: preferences?.global.hideRegularTranslationIfAdvanced ?? undefined,
    translationAtBottom: preferences?.global.translationAtBottom ?? undefined,
  },
  languages: Object.entries(preferences?.perLang ?? {}).map(
    ([lang, preferences]): UserPreferencesFormData['languages'][number] => ({
      lang,
      preferences: {
        autoSubmitCorrectAnswers: preferences?.autoSubmitCorrectAnswers ?? undefined,
        testTypingTranslation: preferences?.testTypingTranslation ?? undefined,
        askNonStandardVariants: preferences?.askNonStandardVariants ?? undefined,
        hideRegularTranslationIfAdvanced: preferences?.hideRegularTranslationIfAdvanced ?? undefined,
        translationAtBottom: preferences?.translationAtBottom ?? undefined,
        cardTypeSettings: preferences?.cardTypeSettings
          ? objectMap(
              preferences.cardTypeSettings,
              (v): CardTypeSettingsDTO => ({
                hideGroups: v?.hideGroups ?? undefined,
                askNonStandardVariants: v?.askNonStandardVariants ?? undefined,
                groupOrder: v?.groupOrder ?? undefined,
                groupSettings: v?.groupSettings
                  ? Object.entries(v.groupSettings).map(([key, preferences]) => ({
                      group: key,
                      preferences: {
                        hideGroup: preferences?.hideGroup ?? undefined,
                        askNonStandardVariants: preferences?.askNonStandardVariants ?? undefined,
                      },
                    }))
                  : undefined,
              }),
              (k) => `x${k}`, // add 'x' prefix
            )
          : undefined,
      },
    }),
  ),
});

export const convertFormDataToUserPreferences = (data: UserPreferencesFormData) => {
  const perLang: ReplaceUserPreferencesReqDTO['perLang'] = Object.fromEntries(
    data.languages
      .filter((e) => !!e.lang)
      .map(
        ({ lang, preferences }) =>
          [
            lang,
            removeNullableValues({
              autoSubmitCorrectAnswers: preferences.autoSubmitCorrectAnswers,
              testTypingTranslation: preferences.testTypingTranslation,
              askNonStandardVariants: preferences.askNonStandardVariants,
              translationAtBottom: preferences.translationAtBottom,
              hideRegularTranslationIfAdvanced: preferences.hideRegularTranslationIfAdvanced,
              cardTypeSettings: convertCardTypeSettings(preferences.cardTypeSettings),
            }),
          ] as const,
      )
      .filter((e) => Object.keys(e[1]).length > 0),
  );
  return {
    global: removeNullableValues({
      autoSubmitCorrectAnswers: data.global.autoSubmitCorrectAnswers,
      testTypingTranslation: data.global.testTypingTranslation,
      askNonStandardVariants: data.global.askNonStandardVariants,
      translationAtBottom: data.global.translationAtBottom,
      hideRegularTranslationIfAdvanced: data.global.hideRegularTranslationIfAdvanced,
    }),
    perLang,
  };
};

const convertGroupSettings = (
  settings: CardTypeSettingsDTO['groupSettings'],
): UserCardTypeSettingsDTO['groupSettings'] => {
  if (!settings) return undefined;
  const obj: UserCardTypeSettingsDTO['groupSettings'] = Object.fromEntries(
    settings
      .map(
        ({ group, preferences }) =>
          [
            group,
            removeNullableValues({
              hideGroup: preferences?.hideGroup,
              askNonStandardVariants: preferences?.askNonStandardVariants,
            }),
          ] as const,
      )
      .filter((e) => Object.keys(e[1]).length > 0),
  );
  return Object.keys(obj).length > 0 ? obj : undefined;
};

const convertCardTypeSettings = (
  settings: LangPreference['cardTypeSettings'],
): UserLangPreferencesDTO['cardTypeSettings'] => {
  if (!settings) return undefined;
  const obj: UserLangPreferencesDTO['cardTypeSettings'] = Object.fromEntries(
    Object.entries(settings)
      .map(
        ([cardType, preferences]) =>
          [
            cardType.slice(1), // remove 'x' prefix
            removeNullableValues({
              hideGroups: preferences?.hideGroups,
              askNonStandardVariants: preferences?.askNonStandardVariants,
              groupOrder: preferences?.groupOrder,
              groupSettings: preferences?.groupSettings ? convertGroupSettings(preferences.groupSettings) : undefined,
            }),
          ] as const,
      )
      .filter((e) => Object.keys(e[1]).length > 0),
  );
  return Object.keys(obj).length > 0 ? obj : undefined;
};
