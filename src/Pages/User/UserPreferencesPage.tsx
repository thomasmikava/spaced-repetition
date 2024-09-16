import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReplaceUserPreferences, useUserPreferences } from '../../api/controllers/users/users.query';
import type { ReplaceUserPreferencesReqDTO } from '../../api/controllers/users/users.schema';
import { paths } from '../../routes/paths';
import LoadingPage from '../Loading/LoadingPage';
import { convertFormDataToUserPreferences, convertUserPreferencesToFormData } from './convert';
import { UserPreferencesForm, type UserPreferencesFormData } from './UserPreferencesForm';
import { useHelper } from '../hooks/text-helpers';

const UserPreferencesPage = () => {
  const { data, isLoading } = useUserPreferences();
  const { mutate, isPending } = useReplaceUserPreferences();
  const helper = useHelper();

  const preferences = data?.result ?? null;

  const defaultData = useMemo((): UserPreferencesFormData => {
    return convertUserPreferencesToFormData(preferences);
  }, [preferences]);

  const navigate = useNavigate();
  const goToMainPage = () => {
    navigate(paths.app.main());
  };

  const handleSave = (data: UserPreferencesFormData) => {
    console.log(data);
    const requestData: ReplaceUserPreferencesReqDTO = convertFormDataToUserPreferences(data);
    mutate(requestData, {
      onSuccess: goToMainPage,
    });
  };

  if (isLoading || !helper) return <LoadingPage />;

  if (!data) return <div>Error</div>;

  return (
    <div className='body'>
      <UserPreferencesForm defaultData={defaultData} onSave={handleSave} isSubmitting={isPending} helper={helper} />
    </div>
  );
};

export default UserPreferencesPage;
