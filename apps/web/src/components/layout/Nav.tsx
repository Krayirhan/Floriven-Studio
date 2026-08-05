import { Button } from '../ui';
import styles from './Nav.module.css';

export function Nav() {
  return (
    <nav className={styles.nav}>
      <div className="wrap">
        <div className={styles.inner}>
          <a href="/" className={styles.logo}>Floriven Studio</a>
          <ul className={styles.links}>
            <li><a href="#nasil">Nasıl çalışır</a></li>
            <li><a href="#ozellikler">Özellikler</a></li>
            <li><a href="https://github.com/Krayirhan/Floriven-Studio">GitHub</a></li>
          </ul>
          <Button href="#" variant="accent" className={styles.cta}>
            Erken erişim →
          </Button>
        </div>
      </div>
    </nav>
  );
}
