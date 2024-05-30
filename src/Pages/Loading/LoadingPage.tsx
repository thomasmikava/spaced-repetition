import styles from './styles.module.css';

const BASE = import.meta.env.BASE_URL ?? '';

const LoadingPage = () => {
  return (
    <div className='body'>
      <div className={styles.loadingCard}>
        <img src={BASE + 'logo-small.svg'} alt='loading logo' />
      </div>
    </div>
  );
};

export default LoadingPage;
