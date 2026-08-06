import styles from './Ticker.module.css';

const ITEMS = [
  'iOS', 'Android', 'Cross-platform',
  'DesignSpec v1', 'Figma export',
  'React Native', 'SwiftUI', 'Jetpack Compose',
];

export function Ticker() {
  return (
    <div className={styles.ticker}>
      <div className={styles.track}>
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span key={i} className={styles.item}>{item}</span>
        ))}
      </div>
    </div>
  );
}
