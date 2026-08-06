import styles from './BeforeAfter.module.css';

const BEFORE = [
  { icon: '⏱', text: "Figma'da 3–5 gün manuel tasarım" },
  { icon: '🔁', text: 'Her ekran sıfırdan, birbirinden kopuk' },
  { icon: '👤', text: 'Tasarımcı olmadan ilerleme yok' },
  { icon: '🔗', text: "Figma → geliştirici köprüsü yok" },
  { icon: '🎨', text: 'Token sistemi kurmak ayrı bir iş' },
];

const AFTER = [
  { icon: '⚡', text: '18 saniyede brief → 4 eksiksiz ekran' },
  { icon: '🔄', text: 'Navigasyon, modal ve akışlar otomatik' },
  { icon: '🤖', text: 'Brief yazabiliyorsan tasarım yapabilirsin' },
  { icon: '🚀', text: 'DesignSpec v1 ile geliştirici çıktısı hazır' },
  { icon: '🎯', text: 'Token sistemi AI tarafından kurulur' },
];

export function BeforeAfter() {
  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <div className={styles.label}>Karşılaştırma</div>
        <h2>Eskiden nasıldı,<br /><em>şimdi nasıl?</em></h2>
      </div>
      <div className={styles.grid}>
        <div className={`${styles.col} ${styles.before}`}>
          <div className={styles.colHead}>
            <span className={styles.colIcon}>✕</span>
            Floriven olmadan
          </div>
          {BEFORE.map(({ icon, text }) => (
            <div key={text} className={styles.row}>
              <span className={styles.rowIcon}>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
        <div className={`${styles.col} ${styles.after}`}>
          <div className={styles.colHead}>
            <span className={styles.colIcon}>✓</span>
            Floriven ile
          </div>
          {AFTER.map(({ icon, text }) => (
            <div key={text} className={styles.row}>
              <span className={styles.rowIcon}>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
