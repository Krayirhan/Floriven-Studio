import styles from './HowItWorks.module.css';

const STEPS = [
  {
    n: 1,
    title: 'Brief yaz',
    desc: 'Uygulamanı sade bir dille anlat. Detay seviyesi tamamen sana kalmış.',
    code: (
      <>
        <span className={styles.k}>"</span>Kullanıcıların görev oluşturup ekip arkadaşlarına
        atadığı bir proje yönetim uygulaması<span className={styles.k}>"</span>
      </>
    ),
  },
  {
    n: 2,
    title: 'AI ekranları üretir',
    desc: 'ScreenGraph ve DesignSpec v1 ile ekranlar, akışlar ve tokenlar saniyeler içinde hazır.',
    code: (
      <>
        <span className={styles.g}>→</span> Dashboard<br />
        <span className={styles.g}>→</span> Görev listesi<br />
        <span className={styles.g}>→</span> Yeni görev formu<br />
        <span className={styles.g}>→</span> Profil
      </>
    ),
  },
  {
    n: 3,
    title: 'Düzenle & export et',
    desc: 'Görsel editörde değiştir, Figma\'ya veya üretime hazır koda aktar.',
    code: (
      <>
        <span className={styles.k}>↓</span> Figma plugin<br />
        <span className={styles.k}>↓</span> React Native<br />
        <span className={styles.k}>↓</span> SwiftUI<br />
        <span className={styles.k}>↓</span> Jetpack Compose
      </>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className={styles.section} id="nasil">
      <div className={styles.label}>Nasıl çalışır</div>
      <div className={styles.title}>Üç adımda ekranlarına kavuş</div>
      <div className={styles.steps}>
        {STEPS.map((step) => (
          <div key={step.n} className={styles.step}>
            <div className={styles.num}>{step.n}</div>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
            <div className={styles.code}>{step.code}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
