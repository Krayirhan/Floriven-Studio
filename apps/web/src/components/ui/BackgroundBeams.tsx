import styles from './BackgroundBeams.module.css';

export function BackgroundBeams() {
  return (
    <div className={styles.root} aria-hidden="true">
      <svg
        className={styles.svg}
        viewBox="0 0 800 600"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="bg-glow" cx="50%" cy="0%" r="60%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="beam-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="beam-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="beam-3" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
          <filter id="blur">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* Background glow ellipse */}
        <ellipse cx="400" cy="0" rx="340" ry="200" fill="url(#bg-glow)" filter="url(#blur)" />

        {/* Beam lines */}
        <line className={`${styles.beam} ${styles.b1}`} x1="400" y1="0" x2="50" y2="600" stroke="url(#beam-1)" strokeWidth="1.5" />
        <line className={`${styles.beam} ${styles.b2}`} x1="400" y1="0" x2="750" y2="600" stroke="url(#beam-2)" strokeWidth="1.5" />
        <line className={`${styles.beam} ${styles.b3}`} x1="400" y1="0" x2="200" y2="600" stroke="url(#beam-1)" strokeWidth="0.8" />
        <line className={`${styles.beam} ${styles.b4}`} x1="400" y1="0" x2="600" y2="600" stroke="url(#beam-2)" strokeWidth="0.8" />
        <line className={`${styles.beam} ${styles.b5}`} x1="400" y1="0" x2="400" y2="600" stroke="url(#beam-3)" strokeWidth="1" />
        <line className={`${styles.beam} ${styles.b6}`} x1="400" y1="0" x2="100" y2="500" stroke="url(#beam-1)" strokeWidth="0.5" />
        <line className={`${styles.beam} ${styles.b7}`} x1="400" y1="0" x2="700" y2="500" stroke="url(#beam-2)" strokeWidth="0.5" />
      </svg>
    </div>
  );
}
