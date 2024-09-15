import { useMemo } from 'react';
import { useReplaceUserPreferences, useUserPreferences } from '../../api/controllers/users/users.query';
import LoadingPage from '../Loading/LoadingPage';
import type { CardTypeSettingsDTO, LangPreference } from './UserPreferencesForm';
import { UserPreferencesForm, type UserPreferencesFormData } from './UserPreferencesForm';
import type {
  ReplaceUserPreferencesReqDTO,
  UserCardTypeSettingsDTO,
  UserLangPreferencesDTO,
} from '../../api/controllers/users/users.schema';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../routes/paths';
import { objectMap, removeNullableValues } from '../../utils/object';

const UserPreferencesPage = () => {
  const { data, isLoading } = useUserPreferences();
  const { mutate, isPending } = useReplaceUserPreferences();

  const preferences = data?.result ?? null;

  const defaultData = useMemo((): UserPreferencesFormData => {
    return {
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
    };
  }, [preferences]);

  const navigate = useNavigate();
  const goToMainPage = () => {
    navigate(paths.app.main());
  };

  const handleSave = (data: UserPreferencesFormData) => {
    console.log(data);
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
    const requestData: ReplaceUserPreferencesReqDTO = {
      global: removeNullableValues({
        autoSubmitCorrectAnswers: data.global.autoSubmitCorrectAnswers,
        testTypingTranslation: data.global.testTypingTranslation,
        askNonStandardVariants: data.global.askNonStandardVariants,
        translationAtBottom: data.global.translationAtBottom,
        hideRegularTranslationIfAdvanced: data.global.hideRegularTranslationIfAdvanced,
      }),
      perLang,
    };
    mutate(requestData, {
      onSuccess: goToMainPage,
    });
  };

  if (isLoading) return <LoadingPage />;

  if (!data) return <div>Error</div>;

  return (
    <div className='body'>
      <UserPreferencesForm defaultData={defaultData} onSave={handleSave} isSubmitting={isPending} />
    </div>
  );
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

export default UserPreferencesPage;
