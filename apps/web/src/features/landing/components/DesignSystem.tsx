import styles from './DesignSystem.module.css';

const TOKENS = {
  Renkler: [
    { name: 'Primary', value: 'var(--color-primary)', light: false },
    { name: 'Success', value: 'var(--color-success)', light: false },
    { name: 'Surface', value: 'var(--color-surface)', light: false },
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
    <section className={styles.section} aria-labelledby="ds-heading">
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
            {/* Phone 0 — Ana Sayfa */}
            <div className={styles.previewPhone}>
              <div className={styles.previewBar}>
                <span style={{ fontSize: '6px', color: 'rgba(255,255,255,0.4)' }}>9:41</span>
              </div>
              <div className={styles.previewBody}>
                <div style={{ background: 'rgba(209,122,89,0.12)', borderRadius: '7px', padding: '7px', marginBottom: '6px' }}>
                  <div style={{ height: '4px', width: '45%', background: 'rgba(209,122,89,0.5)', borderRadius: '2px', marginBottom: '4px' }} />
                  <div style={{ height: '8px', width: '65%', background: 'rgba(209,122,89,0.85)', borderRadius: '3px', marginBottom: '5px' }} />
                  <div style={{ height: '18px', background: 'linear-gradient(180deg,rgba(209,122,89,0.25) 0%,transparent 100%)', borderRadius: '3px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '3px', marginBottom: '6px' }}>
                  {[0,1,2,3].map(i => <div key={i} style={{ height: '18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '5px' }} />)}
                </div>
                {[75,60,80].map((w, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '3px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === 1 ? 'var(--color-success)' : 'rgba(255,90,90,0.6)', flexShrink: 0 }} />
                    <div style={{ height: '4px', width: `${w}%`, background: 'rgba(255,255,255,0.12)', borderRadius: '2px' }} />
                  </div>
                ))}
              </div>
              <div className={styles.previewName}>Ana Sayfa</div>
            </div>

            {/* Phone 1 — İşlemler */}
            <div className={styles.previewPhone}>
              <div className={styles.previewBar}>
                <span style={{ fontSize: '6px', color: 'rgba(255,255,255,0.4)' }}>9:41</span>
              </div>
              <div className={styles.previewBody}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <div style={{ height: '5px', width: '35%', background: 'rgba(209,122,89,0.7)', borderRadius: '2px' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(209,122,89,0.5)' }} />
                </div>
                <div style={{ height: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '5px', marginBottom: '5px' }} />
                <div style={{ display: 'flex', gap: '3px', marginBottom: '6px' }}>
                  {['Tümü','Gelir','Gider'].map((t, j) => (
                    <div key={t} style={{ height: '11px', flex: j === 0 ? '0 0 28px' : '0 0 22px', background: j === 0 ? 'rgba(209,122,89,0.7)' : 'rgba(255,255,255,0.05)', border: j !== 0 ? '1px solid rgba(255,255,255,0.08)' : 'none', borderRadius: '10px' }} />
                  ))}
                </div>
                {[70,55,80,60,72].map((w, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '3px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === 2 ? 'var(--color-success)' : 'rgba(255,90,90,0.55)', flexShrink: 0 }} />
                    <div style={{ height: '4px', width: `${w}%`, background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
                  </div>
                ))}
              </div>
              <div className={styles.previewName}>İşlemler</div>
            </div>

            {/* Phone 2 — Profil */}
            <div className={styles.previewPhone}>
              <div className={styles.previewBar}>
                <span style={{ fontSize: '6px', color: 'rgba(255,255,255,0.4)' }}>9:41</span>
              </div>
              <div className={styles.previewBody}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '7px', gap: '3px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(209,122,89,0.65)', border: '2px solid rgba(209,122,89,0.3)' }} />
                  <div style={{ height: '5px', width: '55%', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />
                  <div style={{ height: '3px', width: '35%', background: 'rgba(255,255,255,0.12)', borderRadius: '2px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '3px', marginBottom: '7px' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '5px', padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ height: '6px', background: 'rgba(209,122,89,0.6)', borderRadius: '2px' }} />
                      <div style={{ height: '3px', width: '70%', background: 'rgba(255,255,255,0.1)', borderRadius: '1px' }} />
                    </div>
                  ))}
                </div>
                {[0,1,2].map(i => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '3px' }}>
                    <div style={{ height: '4px', width: '50%', background: 'rgba(255,255,255,0.15)', borderRadius: '2px' }} />
                    <div style={{ height: '4px', width: '5px', background: 'rgba(255,255,255,0.2)', borderRadius: '1px' }} />
                  </div>
                ))}
              </div>
              <div className={styles.previewName}>Profil</div>
            </div>
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
