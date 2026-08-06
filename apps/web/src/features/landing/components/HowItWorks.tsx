import styles from './HowItWorks.module.css';

export function HowItWorks() {
  return (
    <section className={styles.section} id="nasil" aria-labelledby="how-heading">
      <div className={styles.head}>
        <div className={styles.label}>NASIL ÇALIŞIR?</div>
        <h2 id="how-heading">Üç adımda<br /><em>fikirden arayüze.</em></h2>
      </div>
      <div className={styles.steps}>

        {/* Step 1 */}
        <div className={styles.step}>
          <div className={styles.connector} aria-hidden="true" />
          <div className={styles.num} aria-hidden="true">01</div>
          <h3>Tanımla veya yükle</h3>
          <p>Fikrini yaz, ürün gereksinimlerini ekle veya mevcut uygulamanın ekran görüntülerini yükle.</p>
          <div className={styles.visual}>
            <div className={styles.briefBox}>
              <div className={styles.briefLabel}>Ürün Brief'i</div>
              <div className={styles.briefLines}>
                {[90, 76, 83, 55].map((w, i) => (
                  <div key={i} className={styles.briefLine} style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
            <div className={styles.orDivider}>— veya —</div>
            <div className={styles.uploadBtn}>
              <span aria-hidden="true">📎</span>
              Ekran görüntüsü yükle
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className={styles.step}>
          <div className={styles.connector} aria-hidden="true" />
          <div className={styles.num} aria-hidden="true">02</div>
          <h3>Tasarım yönünü seç</h3>
          <p>Floriven Studio farklı görsel yönler, ekran akışları ve tasarım sistemleri oluşturur.</p>
          <div className={styles.visual}>
            {[
              { name: 'Editorial Minimal', color: 'var(--color-primary)', active: false },
              { name: 'Soft Futurizm', color: '#3ECFAA', active: true },
              { name: 'Warm Premium', color: 'var(--color-warning)', active: false },
            ].map(v => (
              <div key={v.name}
                className={`${styles.dirCard} ${v.active ? styles.dirActive : ''}`}
                style={v.active ? { borderColor: v.color } : {}}>
                <span className={styles.dirDot} style={{ background: v.color }} />
                <span className={styles.dirName}>{v.name}</span>
                {v.active && <span className={styles.dirCheck} style={{ color: v.color }}>✓</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Step 3 */}
        <div className={styles.step}>
          <div className={styles.num} aria-hidden="true">03</div>
          <h3>Düzenle ve dışa aktar</h3>
          <p>Metinleri, renkleri, bileşenleri düzenle. Tasarımını Figma'ya veya desteklenen formatlara aktar.</p>
          <div className={styles.visual}>
            <div className={styles.exportGrid}>
              {[
                { short: 'Fg', label: 'Figma' },
                { short: 'PNG', label: 'PNG' },
                { short: '{}', label: 'Design Tokens' },
                { short: '⚛', label: 'React' },
              ].map(e => (
                <div key={e.label} className={styles.exportItem}>
                  <div className={styles.exportIcon}>{e.short}</div>
                  <span>{e.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
