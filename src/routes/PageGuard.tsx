import type { FC, ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import type { Xor } from '../utils/types';
import { paths } from './paths';
import { useAuth } from '../contexts/Auth';
import PageWrapper from '../PageWrapper';

type PublicPageProps = {
  children: ReactElement;
};

type OnlyProtectedPageProps = {
  children: ReactElement;
  onlyAuth: true;
};

type OnlyPublicPageProps = {
  children: ReactElement;
  onlyPublic: true;
};

type VariantPageProps = {
  authPage: ReactElement;
  publicPage: ReactElement;
};

type Props = Xor<Xor<PublicPageProps, OnlyProtectedPageProps>, Xor<OnlyPublicPageProps, VariantPageProps>>;

export const PageGuard: FC<Props> = ({ children, onlyAuth, onlyPublic, authPage, publicPage }) => {
  const { isSignedIn } = useAuth();

  const wrap = (element: ReactElement) => <PageWrapper>{element}</PageWrapper>;

  if (onlyPublic) {
    if (!isSignedIn) return wrap(children);
    return <Navigate to={paths.app.main()} replace />;
  }

  if (onlyAuth) {
    if (isSignedIn) return wrap(children);
    return <Navigate to={paths.loginPage()} replace />;
  }

  if (authPage) {
    if (isSignedIn) return wrap(authPage);
    return wrap(publicPage);
  }

  return wrap(children);
};
