import { Button } from '../../../components/ui';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.eyebrow}>
          <span className={styles.pulse} />
          Yapay zeka destekli UI üretici
        </div>
        <h1>Uygulamayı <em>anlat.</em><br />Ekranları al.</h1>
        <p className={styles.sub}>
          Floriven Studio, sade bir brief'i saniyeler içinde eksiksiz mobil
          ekranlara dönüştürür — düzenle, paylaş ya da Figma'ya aktar.
        </p>
        <div className={styles.ctas}>
          <Button href="#" variant="accent" className={styles.ctaLg}>Erken erişim al →</Button>
          <Button href="#nasil" variant="ghost" className={styles.ctaLg}>Nasıl çalışır</Button>
        </div>
      </div>

      <div className={styles.mockup}>
        <div className={styles.mockupBar}>
          <span className={styles.dot} style={{ background: '#FF5F57' }} />
          <span className={styles.dot} style={{ background: '#FFBD2E' }} />
          <span className={styles.dot} style={{ background: '#28CA41' }} />
          <span className={styles.mockupTitle}>Yeni proje — floriven.studio</span>
        </div>
        <div className={styles.prompt}>
          <div className={styles.promptLabel}>Brief</div>
          <div className={styles.promptText}>
            Takım üyelerinin görev oluşturup birbirine atadığı, ilerlemeyi kanban
            panosuyla takip ettiği bir proje yönetim uygulaması.<span className={styles.cursor} />
          </div>
        </div>
        <div className={styles.phones}>
          <div className={styles.phone}>
            <div className={styles.bar} />
            <div className={`${styles.bar} ${styles.barAccent}`} />
            <div className={styles.card} />
            <div className={styles.row} />
            <div className={`${styles.row} ${styles.rowMd}`} />
            <div className={`${styles.row} ${styles.rowSm}`} />
          </div>
          <div className={styles.phone} style={{ animationDelay: '0.1s' }}>
            <div className={styles.bar} />
            <div className={styles.bar} />
            <div className={styles.row} />
            <div className={`${styles.row} ${styles.rowSm} ${styles.dim}`} />
            <div className={`${styles.row} ${styles.rowMd}`} />
            <div className={`${styles.row} ${styles.rowSm} ${styles.dim}`} />
            <div className={styles.row} />
            <div className={`${styles.row} ${styles.rowSm} ${styles.dim}`} />
            <div className={`${styles.row} ${styles.rowMd}`} />
          </div>
          <div className={styles.phone} style={{ animationDelay: '0.2s' }}>
            <div className={styles.bar} />
            <div className={`${styles.bar} ${styles.barAccent}`} />
            <div className={`${styles.row} ${styles.rowSm} ${styles.dim}`} />
            <div className={styles.input} />
            <div className={`${styles.row} ${styles.rowSm} ${styles.dim}`} />
            <div className={styles.input} />
            <div className={`${styles.row} ${styles.rowSm} ${styles.dim}`} />
            <div className={styles.input} style={{ height: 36 }} />
            <div className={styles.submitBtn} />
          </div>
        </div>
        <div className={styles.status}>
          <span className={styles.statusDot} />
          4 ekran üretildi · 1.8 sn
        </div>
      </div>
    </section>
  );
}
