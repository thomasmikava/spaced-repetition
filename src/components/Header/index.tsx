import Layout from 'antd/es/layout';
import styles from './styles.module.css';
import Dropdown from 'antd/es/dropdown';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../routes/paths';
import { useAuth } from '../../contexts/Auth';

const BASE = import.meta.env.BASE_URL ?? '';

const Header = () => {
  const { signOut, isSignedIn } = useAuth();
  const navigate = useNavigate();

  const gotoMainPage = () => {
    navigate(paths.app.main());
  };

  return (
    <Layout.Header className={styles.header + ' ' + (!isSignedIn ? styles.inCenter : '')}>
      <div className={styles.logoContainer} onClick={gotoMainPage}>
        <img src={BASE + 'logo.svg'} className={styles.logo} />
      </div>

      {isSignedIn && (
        <>
          <div className={styles.middle}></div>
          <Dropdown
            className={styles.avatarDropdown}
            menu={{
              items: [{ key: 'l', label: 'Log out', onClick: signOut }],
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
