import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useAuthLogin } from '../../api/controllers/auth.queries';
import { mapErrorObjectCode, useCommonErrorMessage } from '../../errors';
import { HttpStatus } from '../../api/http-status';
import type { FormProps } from '../../forms/types';

interface LoginData {
  email: string;
  password: string;
}

const LoginPage: FC = () => {
  const { isPending, mutate, error } = useAuthLogin();
  const [generalErrorMessage, setGeneralErrorMessage] = useState<string>();

  const handleSubmit = (data: LoginData) => {
    mutate(data);
  };

  const clearGeneralError = () => {
    setGeneralErrorMessage(undefined);
  };

  const fieldErrors = useMemo(() => {
    return mapErrorObjectCode(error, {
      email: {
        'auth:invalid_email': 'auth:SIGN_IN.ERRORS.INCORRECT_EMAIL',
        'validation:invalid_data.field.email': 'auth:SIGN_IN.ERRORS.EMAIL_FORMAT',
      },
      password: {
        'auth:invalid_password': 'auth:SIGN_IN.ERRORS.INCORRECT_PASSWORD',
        'validation:invalid_data.field.password': 'auth:SIGN_IN.ERRORS.PASSWORD_FORMAT',
      },
    });
  }, [error]);

  const message = useCommonErrorMessage(!fieldErrors && error, {
    [HttpStatus.UNAUTHORIZED]: 'auth:SIGN_IN.HTTP_ERRORS.401',
  });

  useEffect(() => {
    setGeneralErrorMessage(message);
  }, [error, message]);

  return (
    <LoginUI
      onSubmit={handleSubmit}
      isLoading={isPending}
      errors={fieldErrors}
      generalErrorMessage={generalErrorMessage}
      onErrorClear={clearGeneralError}
    />
  );
};

type UIProps = FormProps<LoginData>;

const LoginUI: FC<UIProps> = ({
  onSubmit,
  isLoading,
  generalErrorMessage,
  errors: parentErrors,
  onErrorClear: clearGeneralError,
}) => {
  const isGeneralError = generalErrorMessage && !parentErrors;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSave = (data: LoginData) => {
    onSubmit(data);
  };
  const onFieldChange = (field: keyof LoginData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    clearGeneralError?.();
    if (field === 'email') {
      setEmail(e.target.value);
    } else {
      setPassword(e.target.value);
    }
  };

  const handleSubmit =
    (onSubmit: (data: LoginData) => void): React.FormEventHandler<HTMLFormElement> =>
    (e) => {
      if (isLoading) return;
      e.preventDefault();
      if (email && password) {
        onSubmit({ email, password });
      }
    };

  return (
    <div className='body'>
      <form style={{ padding: 2, justifyContent: 'center' }} onSubmit={handleSubmit(handleSave)}>
        <input
          type='email'
          placeholder='email'
          required
          readOnly={isLoading}
          value={email}
          onChange={onFieldChange('email')}
        />
        <br />
        <input
          type='password'
          placeholder='password'
          readOnly={isLoading}
          value={password}
          onChange={onFieldChange('password')}
        />
        {isGeneralError && <div style={{ color: 'red' }}>{generalErrorMessage}</div>}
        <br />
        <button type='submit' disabled={isLoading}>
          Log in
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
