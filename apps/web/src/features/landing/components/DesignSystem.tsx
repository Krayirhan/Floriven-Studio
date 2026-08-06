import styles from './DesignSystem.module.css';

const TOKENS = {
  Renkler: [
    { name: 'Primary', value: 'var(--color-primary)', light: false },
    { name: 'Secondary', value: '#3ECFAA', light: false },
    { name: 'Surface', value: '#1A1828', light: false },
    { name: 'Background', value: 'var(--color-surface-sunken)', light: false },
    { name: 'Text', value: 'var(--color-text)', light: false },
  ],
  Tipografi: ['Display', 'Heading', 'Body', 'Label'],
  Spacing: ['4', '8', '12', '16', '24', '32'],
  Radius: ['8', '12', '16', '24'],
  Bileşenler: ['Button', 'Input', 'Card', 'Tab', 'Navigation', 'List Item'],
};

export function DesignSystem() {
  return (
    <section className={styles.section} id="urun" aria-labelledby="ds-heading">
      <div className={styles.layout}>
        {/* Left: copy */}
        <div className={styles.left}>
          <div className={styles.label}>TASARIM SİSTEMİ</div>
          <h2 id="ds-heading">
            Sadece mockup değil,<br />
            <em>gerçek bir tasarım sistemi.</em>
          </h2>
          <p className={styles.sub}>
            Floriven Studio bağımsız görseller üretmek yerine, aynı tasarım dilini
            tüm ekranlarda koruyan düzenlenebilir bir ürün sistemi oluşturur.
          </p>

          <div className={styles.tokenGroups}>
            {Object.entries(TOKENS).map(([group, items]) => (
              <div key={group} className={styles.tokenGroup}>
                <div className={styles.groupLabel}>{group}</div>
                <div className={styles.groupItems}>
                  {group === 'Renkler'
                    ? (items as typeof TOKENS.Renkler).map(t => (
                        <div key={t.name} className={styles.colorChip}>
                          <span className={styles.swatch} style={{ background: t.value }} aria-hidden="true" />
                          <span>{t.name}</span>
                        </div>
                      ))
                    : (items as string[]).map(item => (
                        <span key={item} className={styles.chip}>{item}</span>
                      ))
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: visual proof */}
        <div className={styles.right} aria-label="Tutarlı tasarım sistemi önizlemesi">
          <div className={styles.previewLabel}>Tüm ekranlar aynı sistem üzerinde</div>
          <div className={styles.phones3}>
            {(['Ana Sayfa', 'İşlemler', 'Profil'] as const).map((name, i) => (
              <div key={name} className={styles.previewPhone}>
                <div className={styles.previewBar}>
                  <span style={{ fontSize: '6px', color: 'rgba(255,255,255,0.4)' }}>9:41</span>
                </div>
                <div className={styles.previewBody}>
                  <div className={styles.previewHeader}>
                    <div className={styles.previewLine} style={{ width: '60%', background: 'rgba(124,111,247,0.8)', height: '5px' }} />
                    <div className={styles.previewLine} style={{ width: '40%', background: 'rgba(124,111,247,0.4)', height: '4px', marginTop: '3px' }} />
                  </div>
                  <div className={styles.previewCard}>
                    <div style={{ height: '28px', background: 'rgba(124,111,247,0.15)', borderRadius: '6px', marginBottom: '5px' }} />
                    {[80, 60, 70].map((w, j) => (
                      <div key={j} style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', width: `${w}%`, marginBottom: '3px' }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                    {['Aksiyon', 'İptal'].map((btn, j) => (
                      <div key={btn} style={{
                        flex: 1, height: '16px', borderRadius: '5px',
                        background: j === 0 ? 'rgba(124,111,247,0.7)' : 'rgba(255,255,255,0.06)',
                        border: j === 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                      }} />
                    ))}
                  </div>
                </div>
                <div className={styles.previewName}>{name}</div>
              </div>
            ))}
          </div>
          <div className={styles.consistency}>
            <span className={styles.consistencyDot} aria-hidden="true" />
            Aynı tasarım dili tüm ekranlarda korunuyor
          </div>
        </div>
      </div>
    </section>
  );
}
