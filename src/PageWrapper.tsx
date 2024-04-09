import { useEffect, type FC, type ReactElement } from 'react';
import { useLocation } from 'react-router-dom';

const PageWrapper: FC<{ children: ReactElement }> = ({ children }) => {
  return (
    <>
      <ScrollToTop></ScrollToTop>
      {children}
    </>
  );
};

export default PageWrapper;

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
