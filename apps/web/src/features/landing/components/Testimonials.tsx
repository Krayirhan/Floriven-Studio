import styles from './Testimonials.module.css';

const QUOTES = [
  {
    quote: 'Brief yazıp 20 saniye sonra üç ekran görmek inanılmazdı. Normalde bu iş bir günümü alırdı.',
    name: 'Ayşe K.',
    role: 'Mobil Geliştirici',
    avatar: 'AK',
    color: 'var(--color-primary)',
  },
  {
    quote: 'DesignSpec v1 çıktısı sayesinde tasarımcı olmadan da token sistemine sahip bir uygulama çıkarabildik.',
    name: 'Mert T.',
    role: 'Startup Kurucu',
    avatar: 'MT',
    color: 'var(--color-success)',
  },
  {
    quote: 'Figma\'ya export direkt çalıştı. Beklediğimden çok daha temiz bir bileşen yapısı geldi.',
    name: 'Selin D.',
    role: 'UI Tasarımcı',
    avatar: 'SD',
    color: 'var(--color-warning)',
  },
];

export function Testimonials() {
  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <div className={styles.label}>Beta kullanıcılarından</div>
        <h2>İlk izlenimler</h2>
      </div>
      <div className={styles.grid}>
        {QUOTES.map((q) => (
          <div key={q.name} className={styles.card}>
            <div className={styles.stars}>{'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}</div>
            <p className={styles.quote}>{q.quote}</p>
            <div className={styles.author}>
              <div className={styles.avatar} style={{ background: q.color }}>
                {q.avatar}
              </div>
              <div>
                <div className={styles.name}>{q.name}</div>
                <div className={styles.role}>{q.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
