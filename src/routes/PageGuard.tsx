import type { FC, ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import type { Xor } from '../utils/types';
import { paths } from './paths';
import { useAuth } from '../contexts/Auth';

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

  if (onlyPublic) {
    if (!isSignedIn) return children;
    return <Navigate to={paths.app.main()} replace />;
  }

  if (onlyAuth) {
    if (isSignedIn) return children;
    return <Navigate to={paths.loginPage()} replace />;
  }

  if (authPage) {
    if (isSignedIn) return authPage;
    return publicPage;
  }

  return children;
};
