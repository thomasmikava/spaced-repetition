import Layout from 'antd/es/layout';
import styles from './styles.module.css';
import Dropdown from 'antd/es/dropdown';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { paths } from '../../routes/paths';
import { useAuth } from '../../contexts/Auth';

const BASE = import.meta.env.BASE_URL ?? '';

const Header = () => {
  const { signOut, isSignedIn, userData } = useAuth();
  const isAdmin = userData?.adminLangs && userData.adminLangs.length > 0;
  const navigate = useNavigate();

  const gotoScriptsPage = () => {
    navigate(paths.admin.scripts());
  };
  const gotoPreferencesPage = () => {
    navigate(paths.user.preferences());
  };

  return (
    <Layout.Header className={styles.header + ' ' + (!isSignedIn ? styles.inCenter : '')}>
      <Link className={styles.logoContainer} to={paths.app.main()}>
        <img src={BASE + 'logo.svg'} className={styles.logo} />
      </Link>

      {isSignedIn && (
        <>
          <div className={styles.middle}></div>
          <Dropdown
            className={styles.avatarDropdown}
            menu={{
              items: [
                isAdmin ? { key: 's', label: 'Scripts', onClick: gotoScriptsPage } : null,
                { key: 'pref', label: 'Preferences', onClick: gotoPreferencesPage },
                { key: 'l', label: 'Log out', onClick: signOut },
              ],
            }}
            trigger={['click']}
            placement='bottomLeft'
          >
            <div onClick={(e) => e.preventDefault()}>
              <Avatar size='large' icon={<UserOutlined />} />
            </div>
          </Dropdown>
        </>
      )}
    </Layout.Header>
  );
};

export default Header;
