import styles from './Ticker.module.css';

const ITEMS = ['iOS', 'Android', 'Cross-platform', 'DesignSpec v1', 'Figma export', 'React Native', 'SwiftUI'];

export function Ticker() {
  return (
    <>
      <hr className="sep" />
      <div className="wrap">
        <div className={styles.ticker}>
          {ITEMS.map((item, i) => (
            <span key={item} className={styles.row}>
              <span className={styles.item}>{item}</span>
              {i < ITEMS.length - 1 && <span className={styles.dot} />}
            </span>
          ))}
        </div>
      </div>
      <hr className="sep" />
    </>
  );
}
