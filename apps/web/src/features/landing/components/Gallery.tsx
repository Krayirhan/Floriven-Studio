import styles from './Gallery.module.css';

const EXAMPLES = [
  {
    id: 'finans',
    category: 'Finans',
    style: 'Koyu · Editorial',
    theme: 'dark' as const,
    prompt: 'Koyu temalı kişisel finans uygulaması. Bakiye, işlem geçmişi ve bütçe ekranları.',
    screens: ['Ana Sayfa', 'İşlemler', 'Bütçe'],
    accent: 'var(--color-primary)',
    bg: 'var(--color-surface-sunken)',
    surface: '#1A1828',
  },
  {
    id: 'saglik',
    category: 'Sağlık & Wellness',
    style: 'Açık · Organik',
    theme: 'light' as const,
    prompt: 'Sakin, nefes alma egzersizleri ve meditasyon takibi için wellness uygulaması.',
    screens: ['Keşfet', 'Egzersiz', 'İstatistik'],
    accent: '#0D9488',
    bg: '#F0FDF9',
    surface: '#FFFFFF',
  },
  {
    id: 'egitim',
    category: 'Eğitim',
    style: 'Renkli · Oyunlaştırılmış',
    theme: 'light' as const,
    prompt: 'Dil öğrenme uygulaması. Günlük ders takibi, rozet sistemi ve ilerleme grafikleri.',
    screens: ['Dersler', 'Pratik', 'Profil'],
    accent: 'var(--color-warning)',
    bg: '#FFFBEB',
    surface: '#FFFFFF',
  },
  {
    id: 'eticaret',
    category: 'E-Ticaret',
    style: 'Premium · Minimal',
    theme: 'dark' as const,
    prompt: 'Lüks moda markası için alışveriş uygulaması. Ürün galerisi, detay ve sepet.',
    screens: ['Koleksiyon', 'Ürün', 'Sepet'],
    accent: '#D4B896',
    bg: '#0C0A09',
    surface: '#161412',
  },
];

function MiniPhone({ accent, bg, surface, screens, idx }: {
  accent: string; bg: string; surface: string; screens: string[]; idx: number;
}) {
  return (
    <div className={styles.miniPhone} style={{ background: bg, borderColor: `${accent}30` }}>
      <div className={styles.miniBar} style={{ background: surface }}>
        <span style={{ color: `${accent}99` }}>9:41</span>
        <span style={{ color: `${accent}50`, fontSize: '5px' }}>●●●</span>
      </div>
      <div className={styles.miniBody}>
        <div className={styles.miniHeader} style={{ background: `${accent}15`, borderColor: `${accent}20` }}>
          <div className={styles.miniLine} style={{ background: accent, width: '60%', height: '5px', borderRadius: '2px', opacity: 0.8 }} />
          <div className={styles.miniLine} style={{ background: accent, width: '40%', height: '4px', borderRadius: '2px', opacity: 0.4, marginTop: '3px' }} />
        </div>
        <div className={styles.miniCards}>
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.miniCard} style={{ background: surface, borderColor: `${accent}20` }}>
              <div style={{ background: `${accent}20`, borderRadius: '3px', height: '20px', marginBottom: '4px' }} />
              <div style={{ background: `${accent}15`, borderRadius: '2px', height: '4px', width: '70%' }} />
              <div style={{ background: `${accent}10`, borderRadius: '2px', height: '3px', width: '50%', marginTop: '2px' }} />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.miniScreenLabel} style={{ color: accent, opacity: 0.7 }}>
        {screens[idx] || screens[0]}
      </div>
    </div>
  );
}

export function Gallery() {
  return (
    <section className={styles.section} id="ornekler" aria-labelledby="gallery-heading">
      <div className="wrap">
        <div className={styles.head}>
          <div className={styles.label}>ÖRNEK ÇIKTILAR</div>
          <h2 id="gallery-heading">
            Bir fikirden<br />
            <em>ne çıkabileceğini gör.</em>
          </h2>
          <p className={styles.sub}>
            Farklı ürün kategorileri için oluşturulmuş gerçek mobil arayüz yönlerini incele.
          </p>
        </div>

        <div className={styles.grid}>
          {EXAMPLES.map(ex => (
            <article key={ex.id} className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <div className={styles.cardCategory}>{ex.category}</div>
                  <div className={styles.cardStyle}>{ex.style}</div>
                </div>
                <span
                  className={styles.themeTag}
                  style={{ background: `${ex.accent}18`, color: ex.accent }}
                >
                  {ex.theme === 'dark' ? 'Koyu' : 'Açık'}
                </span>
              </div>

              <p className={styles.cardPrompt}>"{ex.prompt}"</p>

              <div className={styles.screenRow} aria-label={`${ex.category} için üretilen ekranlar`}>
                {[0, 1, 2].map(i => (
                  <MiniPhone key={i} idx={i}
                    accent={ex.accent} bg={ex.bg} surface={ex.surface} screens={ex.screens} />
                ))}
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.screenCount}>{ex.screens.length} ekran</span>
                <a href="#baslat" className={styles.cardAction}
                  style={{ color: ex.accent, borderColor: `${ex.accent}40` }}>
                  Bu stili kullan →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
