import { useState } from 'react';
import styles from './FAQ.module.css';

const ITEMS = [
  {
    q: 'Floriven Studio tam olarak ne üretir?',
    a: 'Floriven Studio; brief, ürün fikri veya mevcut ekran görüntülerinden düzenlenebilir, çok ekranlı mobil arayüzler ve tutarlı tasarım sistemleri üretir. Çıktı yalnızca bir görsel değil; bileşenler, tasarım token\'ları ve ekran akışlarından oluşan bütünleşik bir tasarım sistemidir.',
  },
  {
    q: 'Mevcut uygulamamın ekran görüntüsünü yükleyebilir miyim?',
    a: 'Evet. Mevcut ekranındaki içerik yapısını ve kullanıcı eylemlerini analiz ederek farklı görsel yönler oluşturabilir, işlevleri koruyarak arayüzü yenileyebilirsin.',
  },
  {
    q: 'Üretilen ekranlar düzenlenebilir mi?',
    a: 'Evet. Üretilen ekranlar bileşen bazlı bir yapıya sahiptir. Metinleri, renkleri, bileşenleri, aralıkları ve düzeni düzenleyebilirsin. Tasarım token\'larını değiştirdiğinde değişiklikler tüm ekranlara otomatik olarak yansır.',
  },
  {
    q: 'Figma\'ya aktarabilir miyim?',
    a: 'Evet. Tasarımlarını düzenlenebilir katmanlarla Figma\'ya aktarabilirsin. Aktarılan dosya, geliştirici aktarımına uygun bir yapıya sahiptir.',
  },
  {
    q: 'Floriven Studio çalışan uygulama kodu üretir mi?',
    a: 'Hayır. Floriven Studio bir mobil arayüz tasarım platformudur; çalışan uygulama kodu üretmez. Tasarım çıktıları Figma, PNG, Design Tokens ve seçili formatlara aktarılabilir.',
  },
  {
    q: 'Tasarımlarım model eğitimi için kullanılır mı?',
    a: 'Hayır. Yüklediğin tasarımlar ve oluşturduğun projeler, açık rızan olmadan model eğitimi için kullanılmaz. Gizlilik politikamız bu konuda açıktır.',
  },
  {
    q: 'Bir üretim kaç kredi harcar?',
    a: 'Harcanan kredi sayısı üretilen ekran sayısına göre değişir. Tek ekranlı bir üretim 1 kredi harcarken, çok ekranlı üretimler daha fazla kredi tüketir. Kesin değerler her plana göre açıkça belirtilir.',
  },
  {
    q: 'Ticari projelerde kullanabilir miyim?',
    a: 'Creator ve Studio planlarında ticari kullanım hakkı tanınır. Explore planı yalnızca kişisel projeleri kapsar.',
  },
  {
    q: 'iOS ve Android tasarımları destekleniyor mu?',
    a: 'Floriven Studio mobil arayüzler üretir. Üretilen tasarımlar iOS ve Android için uygun boyut ve yapılandırmalarla hazırlanır.',
  },
  {
    q: 'Üretilen tasarımların telif hakkı kime aittir?',
    a: 'Floriven Studio aracılığıyla üretilen tasarımlar, kullanıcıya aittir. Platform, üretim hakkı karşılığında telif hakkı talebinde bulunmaz. Kullanım koşullarında detaylar yer alır.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className={styles.section} id="sss" aria-labelledby="faq-heading">
      <div className={styles.head}>
        <div className={styles.label}>SIKÇA SORULAN SORULAR</div>
        <h2 id="faq-heading">Aklındaki soruları<br /><em>yanıtladık.</em></h2>
      </div>
      <div className={styles.list}>
        {ITEMS.map((item, i) => (
          <div key={i} className={`${styles.item} ${open === i ? styles.itemOpen : ''}`}>
            <button
              className={styles.question}
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              aria-controls={`faq-answer-${i}`}
            >
              <span>{item.q}</span>
              <span className={styles.icon} aria-hidden="true">{open === i ? '−' : '+'}</span>
            </button>
            <div
              id={`faq-answer-${i}`}
              className={styles.answer}
              hidden={open !== i}
              role="region"
            >
              <p>{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
