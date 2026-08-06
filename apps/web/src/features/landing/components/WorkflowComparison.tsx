import styles from './WorkflowComparison.module.css';

const ROWS = [
  { feature: 'İlk tasarım yönü', manual: 'Manuel olarak hazırlanır', floriven: 'İlk taslak otomatik oluşturulur' },
  { feature: 'Çok ekranlı akış', manual: 'Her ekran ayrı ayrı tasarlanır', floriven: 'Ekran akışları birlikte üretilir' },
  { feature: 'Tasarım sistemi', manual: 'Ayrı çalışma gerektirir', floriven: 'Otomatik oluşturulur ve uygulanır' },
  { feature: 'Varyasyon üretimi', manual: 'Zaman alıcı, tekrarlayan iş', floriven: 'Farklı yönler tek seferde hazır' },
  { feature: 'Ekranı yeniden tasarlama', manual: 'Sıfırdan başlamayı gerektirir', floriven: 'Mevcut içerik ve akış korunur' },
  { feature: 'Figma aktarımı', manual: 'Manuel export veya ek araç gerektirir', floriven: 'Düzenlenebilir katmanlarla aktarılır' },
];

export function WorkflowComparison() {
  return (
    <section className={styles.section} aria-labelledby="comparison-heading">
      <div className={styles.head}>
        <div className={styles.label}>KARŞILAŞTIRMA</div>
        <h2 id="comparison-heading">
          Manuel başlangıç sürecini kısalt,<br />
          <em>tasarım kararlarını kendin ver.</em>
        </h2>
      </div>

      <div className={styles.tableWrap} role="region" aria-label="İş akışı karşılaştırması" tabIndex={0}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col" className={styles.thFeature}>Özellik</th>
              <th scope="col" className={styles.thManual}>Geleneksel Süreç</th>
              <th scope="col" className={styles.thFloriven}>Floriven Studio</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={i} className={styles.row}>
                <td className={styles.tdFeature}>{row.feature}</td>
                <td className={styles.tdManual}>
                  <span className={styles.manualIcon} aria-hidden="true">○</span>
                  {row.manual}
                </td>
                <td className={styles.tdFloriven}>
                  <span className={styles.florivenIcon} aria-hidden="true">✓</span>
                  {row.floriven}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
