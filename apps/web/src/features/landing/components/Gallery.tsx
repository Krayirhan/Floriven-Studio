import styles from './Gallery.module.css';

const EXAMPLES = [
  {
    id: 'finans',
    category: 'Finans',
    style: 'Koyu · Editorial',
    theme: 'dark' as const,
    prompt: 'Koyu temalı kişisel finans uygulaması. Bakiye, işlem geçmişi ve bütçe ekranları.',
    screens: ['Ana Sayfa', 'İşlemler', 'Bütçe'],
    accent: '#d17a59',
    bg: '#111410',
    surface: '#20251f',
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
    accent: '#dfb65f',
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
    surface: '#1a1714',
  },
];

type Category = 'finans' | 'saglik' | 'egitim' | 'eticaret';

function ScreenContent({ category, idx, accent, surface, isDark }: {
  category: Category; idx: number; accent: string; surface: string; isDark: boolean;
}) {
  const muted = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.2)';
  const faint = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';

  if (category === 'finans') {
    if (idx === 0) return (
      <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ background: `${accent}1a`, borderRadius: '8px', padding: '8px', border: `1px solid ${accent}30` }}>
          <div style={{ background: muted, borderRadius: '2px', height: '3px', width: '38%', marginBottom: '5px', opacity: 0.6 }} />
          <div style={{ background: accent, borderRadius: '2px', height: '7px', width: '62%', marginBottom: '6px', opacity: 0.9 }} />
          <svg viewBox="0 0 80 18" style={{ width: '100%', height: '18px', display: 'block' }}>
            <polyline points="0,14 14,10 28,12 42,6 56,8 80,2" stroke={accent} strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <polyline points="0,14 14,10 28,12 42,6 56,8 80,2 80,18 0,18" fill={`${accent}22`} stroke="none" />
          </svg>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 0', borderBottom: `1px solid ${faint}` }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '5px', background: `${accent}25`, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ background: muted, borderRadius: '1px', height: '3px', width: '58%', marginBottom: '2px' }} />
              <div style={{ background: muted, borderRadius: '1px', height: '2px', width: '38%', opacity: 0.5 }} />
            </div>
            <div style={{ background: i === 3 ? accent : muted, borderRadius: '1px', height: '3px', width: '18px', opacity: i === 3 ? 0.85 : 0.35 }} />
          </div>
        ))}
      </div>
    );
    if (idx === 1) return (
      <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
          <div style={{ background: muted, borderRadius: '1px', height: '4px', width: '28%' }} />
          <div style={{ background: `${accent}35`, borderRadius: '4px', height: '9px', width: '22%' }} />
        </div>
        <div style={{ background: faint, border: `1px solid ${accent}25`, borderRadius: '5px', height: '11px', marginBottom: '3px' }} />
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 0', borderBottom: `1px solid ${faint}` }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '5px', background: `${accent}20`, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ background: muted, borderRadius: '1px', height: '3px', width: '52%', marginBottom: '2px' }} />
              <div style={{ background: muted, borderRadius: '1px', height: '2px', width: '33%', opacity: 0.5 }} />
            </div>
            <div style={{ background: i % 3 === 0 ? accent : muted, borderRadius: '1px', height: '3px', width: '16px', opacity: i % 3 === 0 ? 0.9 : 0.3 }} />
          </div>
        ))}
      </div>
    );
    return (
      <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ background: `${accent}15`, borderRadius: '8px', padding: '8px', border: `1px solid ${accent}22` }}>
          <div style={{ background: muted, borderRadius: '1px', height: '3px', width: '48%', marginBottom: '4px', opacity: 0.6 }} />
          <div style={{ background: accent, borderRadius: '2px', height: '6px', width: '52%', marginBottom: '6px', opacity: 0.85 }} />
          <div style={{ background: `${accent}20`, borderRadius: '3px', height: '4px', overflow: 'hidden' }}>
            <div style={{ background: accent, borderRadius: '3px', height: '100%', width: '65%' }} />
          </div>
        </div>
        {[[70, 0.8], [45, 0.6], [90, 1], [30, 0.4]].map(([w, op], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ background: muted, borderRadius: '1px', height: '3px', width: '24%', opacity: 0.5 }} />
            <div style={{ flex: 1, background: `${accent}15`, borderRadius: '2px', height: '4px', overflow: 'hidden' }}>
              <div style={{ background: op >= 0.9 ? '#ef4444' : accent, borderRadius: '2px', height: '100%', width: `${w}%`, opacity: Number(op) }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (category === 'saglik') {
    if (idx === 0) return (
      <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ background: muted, borderRadius: '1px', height: '4px', width: '48%', marginBottom: '2px', opacity: 0.6 }} />
        <div style={{ background: `${accent}18`, borderRadius: '10px', padding: '10px 8px', border: `1px solid ${accent}28`, textAlign: 'center' }}>
          <div style={{ background: `${accent}35`, borderRadius: '50%', width: '24px', height: '24px', margin: '0 auto 5px' }} />
          <div style={{ background: accent, borderRadius: '2px', height: '4px', width: '55%', margin: '0 auto 3px', opacity: 0.8 }} />
          <div style={{ background: muted, borderRadius: '1px', height: '3px', width: '38%', margin: '0 auto', opacity: 0.45 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
          {[1, 2].map(i => (
            <div key={i} style={{ background: surface, border: `1px solid ${accent}22`, borderRadius: '7px', padding: '6px' }}>
              <div style={{ background: `${accent}25`, borderRadius: '4px', height: '14px', marginBottom: '4px' }} />
              <div style={{ background: muted, borderRadius: '1px', height: '3px', width: '70%', opacity: 0.45 }} />
            </div>
          ))}
        </div>
      </div>
    );
    if (idx === 1) return (
      <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
        <div style={{ background: muted, borderRadius: '1px', height: '4px', width: '40%', alignSelf: 'flex-start', marginBottom: '2px', opacity: 0.6 }} />
        <svg viewBox="0 0 64 64" style={{ width: '64px', height: '64px' }}>
          <circle cx="32" cy="32" r="26" fill="none" stroke={`${accent}22`} strokeWidth="6" />
          <circle cx="32" cy="32" r="26" fill="none" stroke={accent} strokeWidth="6"
            strokeDasharray={`${163.4 * 0.72} ${163.4}`}
            strokeLinecap="round" transform="rotate(-90 32 32)" />
          <text x="32" y="37" textAnchor="middle" fill={accent} fontSize="11" fontWeight="700" fontFamily="system-ui">72%</text>
        </svg>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', width: '100%' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: `${accent}14`, borderRadius: '7px', padding: '5px', textAlign: 'center' }}>
              <div style={{ background: accent, borderRadius: '1px', height: '4px', width: '55%', margin: '0 auto 2px', opacity: 0.7 }} />
              <div style={{ background: muted, borderRadius: '1px', height: '2px', width: '78%', margin: '0 auto', opacity: 0.35 }} />
            </div>
          ))}
        </div>
      </div>
    );
    return (
      <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ background: muted, borderRadius: '1px', height: '4px', width: '42%', marginBottom: '2px', opacity: 0.6 }} />
        <div style={{ background: `${accent}12`, borderRadius: '8px', padding: '6px', border: `1px solid ${accent}18` }}>
          <svg viewBox="0 0 80 28" style={{ width: '100%', height: '28px', display: 'block' }}>
            <polyline points="0,22 12,16 24,18 36,10 48,14 60,8 80,6" stroke={accent} strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <polyline points="0,22 12,16 24,18 36,10 48,14 60,8 80,6 80,28 0,28" fill={`${accent}20`} stroke="none" />
          </svg>
        </div>
        <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '30px' }}>
          {[0.4, 0.7, 0.55, 0.9, 0.65, 0.8, 0.5].map((h, i) => (
            <div key={i} style={{ flex: 1, background: i === 3 ? accent : `${accent}32`, borderRadius: '2px 2px 0 0', height: `${h * 100}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (category === 'egitim') {
    if (idx === 0) return (
      <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ background: `${accent}22`, borderRadius: '8px', padding: '7px', display: 'flex', alignItems: 'center', gap: '5px', border: `1px solid ${accent}35` }}>
          <div style={{ background: accent, borderRadius: '50%', width: '14px', height: '14px', flexShrink: 0, opacity: 0.9 }} />
          <div>
            <div style={{ background: accent, borderRadius: '1px', height: '4px', width: '42px', marginBottom: '2px', opacity: 0.85 }} />
            <div style={{ background: muted, borderRadius: '1px', height: '2px', width: '28px', opacity: 0.5 }} />
          </div>
        </div>
        {[0.9, 0.6, 0.25].map((prog, i) => (
          <div key={i} style={{ background: surface, border: `1px solid ${accent}20`, borderRadius: '7px', padding: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ background: muted, borderRadius: '1px', height: '3px', width: '48%', opacity: 0.7 }} />
              <div style={{ background: i === 0 ? accent : muted, borderRadius: '1px', height: '3px', width: '14%', opacity: i === 0 ? 0.9 : 0.35 }} />
            </div>
            <div style={{ background: `${accent}18`, borderRadius: '2px', height: '3px', overflow: 'hidden' }}>
              <div style={{ background: accent, height: '100%', width: `${prog * 100}%`, borderRadius: '2px' }} />
            </div>
          </div>
        ))}
      </div>
    );
    if (idx === 1) return (
      <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ background: muted, borderRadius: '1px', height: '3px', width: '32%', marginBottom: '3px', opacity: 0.6 }} />
        <div style={{ background: `${accent}14`, borderRadius: '8px', padding: '9px', border: `1px solid ${accent}28` }}>
          <div style={{ background: muted, borderRadius: '1px', height: '3px', width: '80%', marginBottom: '3px', opacity: 0.7 }} />
          <div style={{ background: muted, borderRadius: '1px', height: '3px', width: '58%', opacity: 0.45 }} />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            background: i === 1 ? `${accent}28` : surface,
            border: `1px solid ${i === 1 ? accent : `${accent}20`}`,
            borderRadius: '6px', padding: '6px 7px',
          }}>
            <div style={{ background: i === 1 ? accent : muted, borderRadius: '1px', height: '3px', width: `${[55, 40, 65][i - 1]}%`, opacity: i === 1 ? 0.88 : 0.4 }} />
          </div>
        ))}
      </div>
    );
    return (
      <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: `${accent}35`, flexShrink: 0 }} />
          <div>
            <div style={{ background: muted, borderRadius: '1px', height: '4px', width: '42px', marginBottom: '2px', opacity: 0.8 }} />
            <div style={{ background: muted, borderRadius: '1px', height: '2px', width: '28px', opacity: 0.4 }} />
          </div>
        </div>
        <div style={{ background: `${accent}18`, borderRadius: '3px', height: '5px', overflow: 'hidden' }}>
          <div style={{ background: accent, height: '100%', width: '73%', borderRadius: '3px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
          {[0.9, 0.7, 0.55, 0.35].map((op, i) => (
            <div key={i} style={{ background: `${accent}18`, borderRadius: '7px', height: '20px', border: `1px solid ${accent}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: accent, opacity: op }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: `${accent}12`, borderRadius: '6px', padding: '5px', textAlign: 'center' }}>
              <div style={{ background: accent, borderRadius: '1px', height: '4px', width: '50%', margin: '0 auto 2px', opacity: 0.7 }} />
              <div style={{ background: muted, borderRadius: '1px', height: '2px', width: '70%', margin: '0 auto', opacity: 0.35 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (category === 'eticaret') {
    if (idx === 0) return (
      <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '3px' }}>
          {[true, false, false].map((active, i) => (
            <div key={i} style={{
              background: active ? accent : 'transparent',
              border: `1px solid ${active ? accent : `${accent}35`}`,
              borderRadius: '12px', height: '9px',
              width: active ? '24px' : '18px',
              opacity: active ? 1 : 0.5,
            }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ background: surface, border: `1px solid ${accent}20`, borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ background: `${accent}18`, height: '34px' }} />
              <div style={{ padding: '4px 5px 5px' }}>
                <div style={{ background: muted, borderRadius: '1px', height: '3px', width: '72%', marginBottom: '2px', opacity: 0.6 }} />
                <div style={{ background: accent, borderRadius: '1px', height: '3px', width: '42%', opacity: 0.75 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
    if (idx === 1) return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: `${accent}20`, height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '30px', height: '40px', background: `${accent}40`, borderRadius: '5px' }} />
        </div>
        <div style={{ padding: '7px 7px 6px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ background: muted, borderRadius: '1px', height: '4px', width: '65%', opacity: 0.75 }} />
          <div style={{ background: accent, borderRadius: '1px', height: '4px', width: '30%', opacity: 0.9 }} />
          <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ width: '14px', height: '14px', borderRadius: '50%', background: i === 2 ? accent : `${accent}30`, border: `1px solid ${accent}50` }} />
            ))}
          </div>
          <div style={{ background: accent, borderRadius: '6px', height: '13px', width: '100%', opacity: 0.88 }} />
        </div>
      </div>
    );
    return (
      <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ background: muted, borderRadius: '1px', height: '4px', width: '28%', marginBottom: '2px', opacity: 0.6 }} />
        {[1, 2].map(i => (
          <div key={i} style={{ display: 'flex', gap: '5px', padding: '5px', background: surface, borderRadius: '8px', border: `1px solid ${accent}18` }}>
            <div style={{ width: '24px', height: '28px', background: `${accent}22`, borderRadius: '5px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ background: muted, borderRadius: '1px', height: '3px', width: '58%', marginBottom: '3px', opacity: 0.65 }} />
              <div style={{ background: accent, borderRadius: '1px', height: '3px', width: '34%', opacity: 0.75 }} />
            </div>
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${accent}22`, paddingTop: '5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ background: muted, borderRadius: '1px', height: '3px', width: '28%', opacity: 0.45 }} />
            <div style={{ background: accent, borderRadius: '1px', height: '3px', width: '24%', opacity: 0.85 }} />
          </div>
          <div style={{ background: accent, borderRadius: '6px', height: '13px', width: '100%', opacity: 0.88 }} />
        </div>
      </div>
    );
  }

  return null;
}

function MiniPhone({ accent, bg, surface, screens, idx, category, isDark }: {
  accent: string; bg: string; surface: string; screens: string[];
  idx: number; category: Category; isDark: boolean;
}) {
  const barBg = isDark ? `${accent}14` : `${accent}10`;
  const timeColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)';

  return (
    <div className={styles.miniPhone} style={{ background: bg, borderColor: `${accent}28` }}>
      <div className={styles.miniBar} style={{ background: barBg }}>
        <span style={{ color: timeColor, fontSize: '6px', fontWeight: 600, fontFamily: 'system-ui' }}>9:41</span>
        <span style={{ color: `${accent}88`, fontSize: '5px' }}>●●●</span>
      </div>
      <div className={styles.miniBody}>
        <ScreenContent category={category} idx={idx} accent={accent} surface={surface} isDark={isDark} />
      </div>
      <div className={styles.miniScreenLabel} style={{ color: accent, borderTopColor: `${accent}18`, opacity: 0.9 }}>
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
            <article
              key={ex.id}
              className={styles.card}
              style={{ '--card-accent': ex.accent } as React.CSSProperties}
            >
              <div className={styles.cardAccent} style={{ background: ex.accent }} />

              <div className={styles.cardHead}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className={styles.cardDot} style={{ background: ex.accent }} />
                  <div>
                    <div className={styles.cardCategory}>{ex.category}</div>
                    <div className={styles.cardStyle}>{ex.style}</div>
                  </div>
                </div>
                <span
                  className={styles.themeTag}
                  style={{ background: `${ex.accent}18`, color: ex.accent, border: `1px solid ${ex.accent}30` }}
                >
                  {ex.theme === 'dark' ? 'Koyu' : 'Açık'}
                </span>
              </div>

              <p className={styles.cardPrompt}>"{ex.prompt}"</p>

              <div className={styles.screenRow} aria-label={`${ex.category} için üretilen ekranlar`}>
                {([0, 1, 2] as const).map(i => (
                  <MiniPhone
                    key={i} idx={i}
                    accent={ex.accent} bg={ex.bg} surface={ex.surface}
                    screens={ex.screens} category={ex.id as Category}
                    isDark={ex.theme === 'dark'}
                  />
                ))}
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.screenDots}>
                  {ex.screens.map((s, i) => (
                    <span key={s} className={styles.screenDot} title={s} style={{ background: ex.accent, opacity: i === 0 ? 1 : 0.4 }} />
                  ))}
                  <span className={styles.screenCountLabel}>{ex.screens.length} ekran</span>
                </div>
                <a
                  href="#baslat"
                  className={styles.cardAction}
                  style={{ background: `${ex.accent}18`, color: ex.accent, borderColor: `${ex.accent}35` }}
                >
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
