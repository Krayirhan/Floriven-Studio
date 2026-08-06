import styles from './Features.module.css';

export function Features() {
  return (
    <section className={styles.section} id="ozellikler">
      <div className={styles.head}>
        <div className={styles.label}>Özellikler</div>
        <h2>Sadece mockup değil,<br /><em>gerçek bir tasarım sistemi.</em></h2>
      </div>
      <div className={styles.bento}>
        {/* Large tile: DesignSpec */}
        <div className={`${styles.tile} ${styles.tileDesignSpec}`}>
          <div className={styles.tileTag}>DesignSpec v1</div>
          <h3>Kara kutu yok — her karar denetlenebilir</h3>
          <p>AI ile editör arasında standart, açık bir JSON sözleşmesi. Her node şeffaf.</p>
          <div className={styles.jsonPreview}>
            <div className={styles.jLine}><span className={styles.jk}>"screen"</span><span className={styles.jc}>: </span><span className={styles.js}>"Dashboard"</span></div>
            <div className={styles.jLine}><span className={styles.jk}>"tokens"</span><span className={styles.jc}>: </span><span className={styles.jc}>{"{ \"primary\": \"var(--color-primary)\" }"}</span></div>
          </div>
        </div>

        <div className={styles.card}>
          <span className={styles.kicker}>02 — DESIGN SYSTEM</span>
          <h3>Token tabanlı tasarım dili</h3>
          <p>Renkler, tipografi, aralıklar ve durumlar DesignSpec token yapısında.</p>
          <div className={styles.swatches}>
            {['var(--color-primary)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-danger)'].map(c => <div key={c} className={styles.tokenSwatch} style={{ background: c }} />)}
          </div>
        </div>

        {/* Small tile: Multi-screen */}
        <div className={`${styles.tile} ${styles.tileMulti}`}>
          <div className={styles.tileTag}>Çok ekranlı</div>
          <h3>Navigasyon, modal, geçiş — otomatik</h3>
          <p>Tüm akış bir bütün olarak üretilir.</p>
          <div className={styles.flowMini}>
            {['Dashboard', 'Liste', 'Form'].map((s, i) => (
              <div key={s} className={styles.flowItem}>
                <div className={styles.flowBox} />
                <span>{s}</span>
                {i < 2 && <span className={styles.flowArr}>→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Small tile: Token */}
        <div className={`${styles.tile} ${styles.tileToken}`}>
          <div className={styles.tileTag}>Token sistemi</div>
          <h3>Tek yerden değiştir, her yere yansısın</h3>
          <p>Renk, tipografi, boşluk — hepsi bağlı.</p>
          <div className={styles.tokenRow}>
            {['var(--color-primary)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-danger)'].map(c => (
              <div key={c} className={styles.tokenSwatch} style={{ background: c }} />
            ))}
          </div>
        </div>

        {/* Large tile: Export */}
        <div className={`${styles.tile} ${styles.tileExport}`}>
          <div className={styles.tileTag}>Export</div>
          <h3>Figma, React Native, SwiftUI — tek tık</h3>
          <p>Üretime hazır kod çıktısı. Tasarım ile geliştirme arasındaki köprü.</p>
          <div className={styles.exportGrid}>
            {[
              { icon: '🎨', label: 'Figma Plugin' },
              { icon: '⚛️', label: 'React Native' },
              { icon: '🍎', label: 'SwiftUI' },
              { icon: '🤖', label: 'Jetpack Compose' },
            ].map(({ icon, label }) => (
              <div key={label} className={styles.exportItem}>
                <span>{icon}</span><span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
