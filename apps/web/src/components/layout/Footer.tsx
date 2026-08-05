import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.logo}>Floriven Studio</span>
      <ul className={styles.links}>
        <li><a href="#">Gizlilik</a></li>
        <li><a href="#">Kullanım şartları</a></li>
        <li><a href="https://github.com/Krayirhan/Floriven-Studio">GitHub</a></li>
      </ul>
      <span className={styles.copy}>© 2026 Floriven Studio</span>
    </footer>
  );
}
