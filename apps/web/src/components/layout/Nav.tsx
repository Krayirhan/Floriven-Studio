import styles from "./Nav.module.css";

export function Nav() {
  return (
    <nav className={styles.nav} role="navigation" aria-label="Ana navigasyon">
      <div className="wrap">
        <div className={styles.inner}>
          <a
            href="/"
            className={styles.logo}
            aria-label="Floriven Studio anasayfa"
          >
            <img src="/logo/logo-color.png" alt="Floriven Studio" className={styles.logoImage} />
            <span className={styles.studio}>Studio</span>
          </a>

          <ul className={styles.links} role="list">
            <li>
              <a href="#urun">Ürün</a>
            </li>
            <li>
              <a href="#ornekler">Örnekler</a>
            </li>
            <li>
              <a href="#nasil">Nasıl çalışır?</a>
            </li>
            <li>
              <a href="#fiyat">Fiyatlandırma</a>
            </li>
            <li>
              <a href="#sss">SSS</a>
            </li>
          </ul>

          <div className={styles.actions}>
            <a href="/giris" className={styles.login}>
              Giriş yap
            </a>
            <a href="/studio" className={styles.cta}>
              İlk ekranını oluştur
            </a>
          </div>

          <button
            className={styles.menuBtn}
            aria-label="Menüyü aç"
            aria-expanded="false"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </nav>
  );
}
