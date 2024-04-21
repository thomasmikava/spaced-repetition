import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useAuthLogin, useAuthRegistration } from '../../api/controllers/auth/auth.queries';
import { mapErrorObjectCode, useCommonErrorMessage } from '../../errors';
import { HttpStatus } from '../../api/http-status';
import type { FormProps } from '../../forms/types';
import { Link } from 'react-router-dom';
import { paths } from '../../routes/paths';
import cssModule from '../../App.module.css';

interface RegistrationData {
  email: string;
  password: string;
  fullName: string;
}

const RegistrationPage: FC = () => {
  const { isPending, mutate, error } = useAuthRegistration();
  const { mutate: logIn } = useAuthLogin();
  const [generalErrorMessage, setGeneralErrorMessage] = useState<string>();

  const handleSubmit = (data: RegistrationData) => {
    mutate(
      { ...data, nickName: data.fullName.replace(/s/g, '').toLocaleLowerCase() },
      {
        onSuccess: () => {
          logIn({ email: data.email, password: data.password });
        },
      },
    );
  };

  const clearGeneralError = () => {
    setGeneralErrorMessage(undefined);
  };

  const fieldErrors = useMemo(() => {
    return mapErrorObjectCode(error, {
      email: {
        'auth:email_taken': 'Email is already taken',
        'validation:invalid_data.field.email': 'Incorrect email',
      },
      password: {
        'auth:invalid_password': 'Weak password. It should contain at least 5 characters.',
        'validation:invalid_data.field.password': 'Incorrect password',
      },
      fullName: {
        'validation:invalid_data.field.fullName': 'Incorrect full name',
      },
    });
  }, [error]);

  console.log('fieldErrors', fieldErrors);

  const message = useCommonErrorMessage(!fieldErrors && error, {
    [HttpStatus.UNAUTHORIZED]: 'auth:SIGN_IN.HTTP_ERRORS.401',
  });

  useEffect(() => {
    setGeneralErrorMessage(message);
  }, [error, message]);

  return (
    <div className='body'>
      <RegistrationUI
        onSubmit={handleSubmit}
        isLoading={isPending}
        errors={fieldErrors}
        generalErrorMessage={generalErrorMessage}
        onErrorClear={clearGeneralError}
      />
      <br />
      <Link to={paths.loginPage()} className={cssModule.authLink}>
        Back to login
      </Link>
    </div>
  );
};

type UIProps = FormProps<RegistrationData>;

const RegistrationUI: FC<UIProps> = ({
  onSubmit,
  isLoading,
  generalErrorMessage,
  errors: parentErrors,
  onErrorClear: clearGeneralError,
}) => {
  const isGeneralError = generalErrorMessage && !parentErrors;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSave = (data: RegistrationData) => {
    onSubmit(data);
  };
  const onFieldChange = (field: keyof RegistrationData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    clearGeneralError?.();
    if (field === 'email') {
      setEmail(e.target.value);
    } else if (field === 'password') {
      setPassword(e.target.value);
    } else {
      setFullName(e.target.value);
    }
  };

  const handleSubmit =
    (onSubmit: (data: RegistrationData) => void): React.FormEventHandler<HTMLFormElement> =>
    (e) => {
      if (isLoading) return;
      e.preventDefault();
      if (email && password && fullName) {
        onSubmit({ email, password, fullName });
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
        placeholder='Full name'
        readOnly={isLoading}
        value={fullName}
        onChange={onFieldChange('fullName')}
      />
      {parentErrors && parentErrors.fullName && <div style={{ color: 'red' }}>{parentErrors.fullName}</div>}
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
        Register
      </button>
    </form>
  );
};

export default RegistrationPage;
