import { Suspense, type FC, type ReactElement } from 'react';
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
  onlyAdmins?: true;
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

export const PageGuard: FC<Props> = ({ children, onlyAuth, onlyAdmins, onlyPublic, authPage, publicPage }) => {
  const { isSignedIn, userData } = useAuth();

  const wrap = (element: ReactElement) => (
    <PageWrapper>
      <Suspense fallback={<div>Loading...</div>}>{element}</Suspense>
    </PageWrapper>
  );

  if (onlyPublic) {
    if (!isSignedIn) return wrap(children);
    return <Navigate to={paths.app.main()} replace />;
  }

  if (onlyAuth) {
    const canAccess = isSignedIn && (!onlyAdmins || (userData?.adminLangs && userData.adminLangs.length > 0));
    if (canAccess) return wrap(children);
    return <Navigate to={paths.loginPage()} replace />;
  }

  if (authPage) {
    if (isSignedIn) return wrap(authPage);
    return wrap(publicPage);
  }

  return wrap(children);
};
