import styles from './TrustBar.module.css';

const ITEMS = [
  { icon: '🧑‍💻', text: 'Kurucular' },
  { icon: '🎨', text: 'Tasarımcılar' },
  { icon: '📱', text: 'Mobil Geliştiriciler' },
  { icon: '🏢', text: 'Ajanslar' },
];

export function TrustBar() {
  return (
    <div className={styles.bar}>
      <div className="wrap">
        <div className={styles.inner}>
          <span className={styles.label}>Birlikte geliştiriliyor:</span>
          <div className={styles.items}>
            {ITEMS.map(item => (
              <div key={item.text} className={styles.item}>
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
          <span className={styles.status}>
            <span className={styles.dot} aria-hidden="true" />
            Beta · Erken Erişim
          </span>
        </div>
      </div>
    </div>
  );
}
