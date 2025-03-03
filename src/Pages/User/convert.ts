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
    transPos: preferences?.global.transPos ?? undefined,
    hideForms: preferences?.global.hideForms ?? undefined,
    learningSpeedMultiplier: preferences?.global.learningSpeedMultiplier ?? undefined,
  },
  languages: Object.entries(preferences?.perLang ?? {}).map(
    ([lang, preferences]): UserPreferencesFormData['languages'][number] => ({
      lang,
      preferences: {
        autoSubmitCorrectAnswers: preferences?.autoSubmitCorrectAnswers ?? undefined,
        testTypingTranslation: preferences?.testTypingTranslation ?? undefined,
        askNonStandardVariants: preferences?.askNonStandardVariants ?? undefined,
        hideRegularTranslationIfAdvanced: preferences?.hideRegularTranslationIfAdvanced ?? undefined,
        transPos: preferences?.transPos ?? undefined,
        hideForms: preferences?.hideForms ?? undefined,
        learningSpeedMultiplier: preferences?.learningSpeedMultiplier ?? undefined,
        cardTypeSettings: preferences?.cardTypeSettings
          ? objectMap(
              preferences.cardTypeSettings,
              (v): CardTypeSettingsDTO => ({
                hideForms: v?.hideForms ?? undefined,
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
              transPos: preferences.transPos,
              hideRegularTranslationIfAdvanced: preferences.hideRegularTranslationIfAdvanced,
              cardTypeSettings: convertCardTypeSettings(preferences.cardTypeSettings),
              hideForms: preferences.hideForms,
              learningSpeedMultiplier: preferences.learningSpeedMultiplier,
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
      transPos: data.global.transPos,
      hideRegularTranslationIfAdvanced: data.global.hideRegularTranslationIfAdvanced,
      hideForms: data.global.hideForms,
      learningSpeedMultiplier: data.global.learningSpeedMultiplier,
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
              hideForms: preferences?.hideForms,
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
