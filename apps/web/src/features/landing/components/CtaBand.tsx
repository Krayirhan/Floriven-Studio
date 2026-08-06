import styles from "./CtaBand.module.css";

export function CtaBand() {
  return (
    <section
      className={styles.section}
      id="baslat"
      aria-labelledby="cta-heading"
    >
      <div className={styles.inner}>
        <div className={styles.glow} aria-hidden="true" />
        <h2 className={styles.title} id="cta-heading">
          İlk mobil arayüzünü
          <br />
          <em>Floriven Studio ile oluştur.</em>
        </h2>
        <p className={styles.sub}>
          Fikrini yaz veya mevcut ekranını yükle. İlk tasarım yönünü birkaç
          adımda gör.
        </p>
        <div className={styles.actions}>
          <a href="/studio" className={styles.primary}>
            İlk tasarımını oluştur
          </a>
          <a href="#ornekler" className={styles.secondary}>
            Örnek projeleri incele
          </a>
        </div>
        <p className={styles.note}>Kredi kartı gerekmez</p>
      </div>
    </section>
  );
}
