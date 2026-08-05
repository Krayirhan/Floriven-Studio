import styles from './Features.module.css';

const FEATURES = [
  {
    title: 'DesignSpec v1 sözleşmesi',
    desc: 'AI ile editör arasında standart, denetlenebilir bir JSON formatı. Her node, layout ve etkileşim şeffaf — kara kutu yok.',
    icon: (
      <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="7" y="4" width="22" height="28" rx="3" />
        <line x1="12" y1="13" x2="24" y2="13" />
        <line x1="12" y1="18" x2="20" y2="18" />
        <line x1="12" y1="23" x2="22" y2="23" />
      </svg>
    ),
  },
  {
    title: 'Çok ekranlı akışlar',
    desc: 'Tek ekran değil; navigasyon, modal\'lar ve koşullu geçişler dahil eksiksiz bir uygulama deneyimi üretir.',
    icon: (
      <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="4" y="7" width="12" height="20" rx="3" />
        <rect x="20" y="7" width="12" height="20" rx="3" />
        <path d="M16 17 L20 17" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    title: 'Token-driven tasarım',
    desc: 'Renkler, tipografi ve boşluklar bir token sistemine bağlı. Tek yerden değiştir, tüm ekranlara yansısın.',
    icon: (
      <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="18" cy="12" r="5" />
        <circle cx="10" cy="25" r="4" />
        <circle cx="26" cy="25" r="4" />
        <line x1="18" y1="17" x2="10" y2="21" />
        <line x1="18" y1="17" x2="26" y2="21" />
      </svg>
    ),
  },
  {
    title: 'Figma & kod export',
    desc: 'Figma plugin veya React Native, SwiftUI, Jetpack Compose çıktısı. Tasarım ile geliştirme arasındaki köprü.',
    icon: (
      <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M7 29 L18 7 L29 29" />
        <line x1="11" y1="22" x2="25" y2="22" />
        <circle cx="18" cy="7" r="2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export function Features() {
  return (
    <section className={styles.section} id="ozellikler">
      <div className={styles.label}>Özellikler</div>
      <div className={styles.title}>Sadece mockup değil, gerçek bir tasarım sistemi</div>
      <div className={styles.grid}>
        {FEATURES.map((f) => (
          <div key={f.title} className={styles.feat}>
            <span className={styles.icon}>{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
