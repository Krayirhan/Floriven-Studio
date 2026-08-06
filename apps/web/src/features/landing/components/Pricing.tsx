import { useState } from 'react';
import styles from './Pricing.module.css';

const PLANS = [
  {
    id: 'explore',
    name: 'Explore',
    for: 'Ürünü denemek isteyenler',
    price: 'Ücretsiz',
    priceSub: 'Beta süresince',
    cta: 'Hemen başla',
    featured: false,
    features: [
      'Aylık sınırlı kredi',
      'Tek ekranlı üretim',
      'PNG dışa aktarım',
      'Kişisel projeler',
      'Topluluk desteği',
    ],
  },
  {
    id: 'creator',
    name: 'Creator',
    for: 'Kurucular, tasarımcılar ve geliştiriciler',
    price: 'Yakında',
    priceSub: 'Fiyatlandırma belirleniyor',
    cta: 'Liste başına eklen',
    featured: true,
    features: [
      'Daha fazla aylık kredi',
      'Çok ekranlı üretim',
      'Ekran görüntüsünden yeniden tasarım',
      'Birden fazla tasarım yönü',
      'Figma dışa aktarım',
      'Ticari kullanım',
      'Versiyon geçmişi',
    ],
  },
  {
    id: 'studio-plan',
    name: 'Studio',
    for: 'Ajanslar ve ürün ekipleri',
    price: 'Yakında',
    priceSub: 'Ekip fiyatlandırması',
    cta: 'İletişime geç',
    featured: false,
    features: [
      'Ekip çalışma alanı',
      'Paylaşımlı marka kiti',
      'Yüksek kredi kotası',
      'Öncelikli üretim',
      'Onay akışı',
      'Paylaşımlı bileşen kütüphanesi',
      'Gelişmiş dışa aktarım',
      'Öncelikli destek',
    ],
  },
];

function WaitlistForm({ planId }: { planId: string }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className={styles.waitlistDone} role="status">
        ✓ Listeye eklendin — launch'ta haber vereceğiz.
      </div>
    );
  }

  return (
    <form
      className={styles.waitlist}
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) setSubmitted(true);
      }}
      aria-label={`${planId} bekleme listesi`}
    >
      <input
        className={styles.waitlistInput}
        type="email"
        placeholder="email@adresin.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        aria-label="E-posta adresi"
      />
      <button type="submit" className={styles.waitlistBtn}>
        Listeye eklen
      </button>
    </form>
  );
}

export function Pricing() {
  return (
    <section className={styles.section} id="fiyat" aria-labelledby="pricing-heading">
      <div className="wrap">
        <div className={styles.head}>
          <div className={styles.label}>FİYATLANDIRMA</div>
          <h2 id="pricing-heading">
            İhtiyacın kadar üret,<br />
            <em>kullandığın kadar büyü.</em>
          </h2>
          <p className={styles.sub}>
            Her plan kredi bazlıdır. Bir kredi, tek ekranlık üretimi kapsar.
          </p>
        </div>
        <div className={styles.grid}>
          {PLANS.map(plan => (
            <div key={plan.id}
              className={`${styles.card} ${plan.featured ? styles.featured : ''}`}>
              {plan.featured && <div className={styles.badge}>Önerilen Plan</div>}
              <div className={styles.planName}>{plan.name}</div>
              <div className={styles.planFor}>{plan.for}</div>
              <div className={styles.priceBlock}>
                <div className={styles.price}>{plan.price}</div>
                <div className={styles.priceSub}>{plan.priceSub}</div>
              </div>

              {plan.id === 'explore' && (
                <a href="/studio" className={styles.cta}>
                  {plan.cta}
                </a>
              )}
              {plan.id === 'creator' && (
                <WaitlistForm planId="creator" />
              )}
              {plan.id === 'studio-plan' && (
                <a href="mailto:hello@floriven.com" className={styles.cta}>
                  {plan.cta}
                </a>
              )}

              <ul className={styles.features}>
                {plan.features.map(f => (
                  <li key={f} className={styles.feature}>
                    <span className={styles.check} aria-hidden="true">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className={styles.creditNote}>
          <strong>Kredi nasıl çalışır?</strong>{' '}
          Her üretim, seçilen ekran sayısına göre kredi harcar. Dışa aktarımlar ek kredi tüketmez.
          Kullanılmayan krediler bir sonraki aya aktarılmaz.
        </p>
      </div>
    </section>
  );
}

