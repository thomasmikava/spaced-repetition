import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useAuthLogin } from '../../api/controllers/auth/auth.queries';
import { mapErrorObjectCode, useCommonErrorMessage } from '../../errors';
import { HttpStatus } from '../../api/http-status';
import type { FormProps } from '../../forms/types';
import { Link } from 'react-router-dom';
import { paths } from '../../routes/paths';
import cssModule from '../../App.module.css';

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
        'auth:invalid_email': 'Incorrect email',
        'validation:invalid_data.field.email': 'Check email format',
      },
      password: {
        'auth:invalid_password': 'Incorrect password',
        'validation:invalid_data.field.password': 'Check password format',
      },
    });
  }, [error]);

  const message = useCommonErrorMessage(!fieldErrors && error, {
    [HttpStatus.UNAUTHORIZED]: 'auth:SIGN_IN.HTTP_ERRORS.401',
  });
  console.log('fieldErrors', fieldErrors, 'message', message, '0', !fieldErrors && error);

  useEffect(() => {
    setGeneralErrorMessage(message);
  }, [error, message]);

  return (
    <div className='body'>
      <LoginUI
        onSubmit={handleSubmit}
        isLoading={isPending}
        errors={fieldErrors}
        generalErrorMessage={generalErrorMessage}
        onErrorClear={clearGeneralError}
      />
      <br />
      <Link to={paths.registration()} className={cssModule.authLink}>
        go to Registration
      </Link>
    </div>
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
    <form style={{ padding: 2, justifyContent: 'center' }} onSubmit={handleSubmit(handleSave)}>
      <input
        className={cssModule.authInput}
        type='email'
        placeholder='E-mail'
        required
        readOnly={isLoading}
        value={email}
        onChange={onFieldChange('email')}
      />
      {parentErrors && parentErrors.email && <div style={{ color: 'red' }}>{parentErrors.email}</div>}
      <br />
      <input
        className={cssModule.authInput}
        type='password'
        placeholder='password'
        readOnly={isLoading}
        value={password}
        onChange={onFieldChange('password')}
      />
      {parentErrors && parentErrors.password && <div style={{ color: 'red' }}>{parentErrors.password}</div>}
      {isGeneralError && <div style={{ color: 'red' }}>{generalErrorMessage}</div>}
      <br />
      <button type='submit' disabled={isLoading} className={cssModule.authButton}>
        Log in
      </button>
    </form>
  );
};

export default LoginPage;
