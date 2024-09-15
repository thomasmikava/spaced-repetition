import { useMemo } from 'react';
import { useReplaceUserPreferences, useUserPreferences } from '../../api/controllers/users/users.query';
import LoadingPage from '../Loading/LoadingPage';
import { UserPreferencesForm, type UserPreferencesFormData } from './UserPreferencesForm';
import type { ReplaceUserPreferencesReqDTO } from '../../api/controllers/users/users.schema';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../routes/paths';
import { removeNullableValues } from '../../utils/object';

const UserPreferencesPage = () => {
  const { data, isLoading } = useUserPreferences();
  const { mutate, isPending } = useReplaceUserPreferences();

  const preferences = data?.result ?? null;

  const defaultData = useMemo((): UserPreferencesFormData => {
    return {
      global: {
        autoSubmitCorrectAnswers: preferences?.global.autoSubmitCorrectAnswers ?? undefined,
        testTypingTranslation: preferences?.global.testTypingTranslation ?? undefined,
      },
      languages: Object.entries(preferences?.perLang ?? {}).map(([lang, preferences]) => ({
        lang,
        preferences: {
          autoSubmitCorrectAnswers: preferences?.autoSubmitCorrectAnswers ?? undefined,
          testTypingTranslation: preferences?.testTypingTranslation ?? undefined,
        },
      })),
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

export default UserPreferencesPage;
