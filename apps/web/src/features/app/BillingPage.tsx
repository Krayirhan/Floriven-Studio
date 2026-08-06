import { useState } from "react";
import { AppShell } from "./AppShell";
import { useCountUp } from "../../hooks/useCountUp";
import styles from "./ProductPages.module.css";

export function BillingPage() {
  const credits = useCountUp(82, 1200);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  return (
    <AppShell>
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <span className={styles.kicker}>FATURALANDIRMA & KREDİLER</span>
            <h1>Abonelik ve Kullanım Yönetimi</h1>
            <p>AI üretim kredilerini ve çalışma alanı planını yönet.</p>
          </div>
          <button className={styles.primaryBtn}>+ Kredi Satın Al</button>
        </header>

        {/* CREDIT HERO BAR */}
        <section className={styles.creditHero}>
          <div className={styles.creditStatRow}>
            <div>
              <span>Kalan Üretim Kredisi</span>
              <b>{credits} ✦</b>
              <small>Bu dönem tanımlanan 100 krediden</small>
            </div>
            <div className={styles.topUpPills}>
              <button className={styles.pillBuy}>+ 500 Kredi (₺149)</button>
              <button className={styles.pillBuy}>+ 1500 Kredi (₺399)</button>
            </div>
          </div>
          <div className={styles.creditProgress}>
            <i style={{ width: `${credits}%` }} />
          </div>
          <div className={styles.creditNote}>
            💡 Krediler her ekran üretiminde kullanılır (-3 ile -8 kredi arası). Başarısız veya iptal edilen üretimler anında iade edilir.
          </div>
        </section>

        {/* PLAN COMPARISON TIERS */}
        <section className={styles.tierSection}>
          <div className={styles.tierHeader}>
            <h2>Abonelik Planları</h2>
            <div className={styles.cycleToggle}>
              <button
                className={billingCycle === "monthly" ? styles.cycleActive : ""}
                onClick={() => setBillingCycle("monthly")}
              >
                Aylık Faturalama
              </button>
              <button
                className={billingCycle === "annual" ? styles.cycleActive : ""}
                onClick={() => setBillingCycle("annual")}
              >
                Yıllık Faturalama <span className={styles.saveBadge}>%20 İndirim</span>
              </button>
            </div>
          </div>

          <div className={styles.tierGrid}>
            {/* FREE PLAN */}
            <div className={styles.tierCard}>
              <span className={styles.tierName}>Başlangıç</span>
              <div className={styles.tierPrice}>₺0 <small>/ ay</small></div>
              <p>Bireysel tasarımcılar ve ilk denemeler için.</p>
              <ul>
                <li>✓ 100 Üretim kredisi / ay</li>
                <li>✓ 3 Aktif proje</li>
                <li>✓ Mobil & Web UI export</li>
              </ul>
              <button className={styles.currentPlanBtn} disabled>Mevcut Planın</button>
            </div>

            {/* PRO BUILDER (RECOMMENDED) */}
            <div className={`${styles.tierCard} ${styles.tierPro}`}>
              <div className={styles.popularBadge}>EN POPÜLER</div>
              <span className={styles.tierName}>Pro Builder</span>
              <div className={styles.tierPrice}>
                {billingCycle === "annual" ? "₺399" : "₺499"} <small>/ ay</small>
              </div>
              <p>Profesyoneller ve hızlı prototip üretenler için.</p>
              <ul>
                <li>✓ 1,500 Üretim kredisi / ay</li>
                <li>✓ Sınırsız Aktif Proje</li>
                <li>✓ Figma Ready Export & DesignSpec</li>
                <li>✓ Öncelikli GPU Üretim Sırası</li>
              </ul>
              <button className={styles.upgradeBtn}>Pro'ya Yükselt →</button>
            </div>

            {/* TEAM ENTERPRISE */}
            <div className={styles.tierCard}>
              <span className={styles.tierName}>Team Enterprise</span>
              <div className={styles.tierPrice}>
                {billingCycle === "annual" ? "₺1,199" : "₺1,499"} <small>/ ay</small>
              </div>
              <p>Tasarım ekipleri ve ajanslar için.</p>
              <ul>
                <li>✓ 5,000 Üretim kredisi / ay</li>
                <li>✓ 10 Ekip Üyesi Davet Hakkı</li>
                <li>✓ Özel Tasarım Sistemi Entegrasyonu</li>
                <li>✓ 7/24 Teknik Destek & SLA</li>
              </ul>
              <button className={styles.tierOutlineBtn}>Ekip İletişimine Geç</button>
            </div>
          </div>
        </section>

        {/* LEDGER & TRANSACTION HISTORY */}
        <section className={styles.ledgerSection}>
          <h2>Kredi Hareketleri & Geçmiş</h2>
          <p>Son AI üretim harcamaları ve yüklemelerin.</p>
          <div className={styles.ledgerTable}>
            {(
              [
                ["Kişisel Finans - 3 Ekran Üretimi", "-8 Kredi", "Şimdi", "Başarılı"],
                ["Melo Wellness - Ekran Varyasyonları", "-12 Kredi", "Dün", "Başarılı"],
                ["Haftalık Yenileme Kredisi", "+100 Kredi", "12 Haziran", "Yüklendi"],
              ] as const
            ).map(([name, amount, time, status]) => (
              <div className={styles.ledgerRow} key={name}>
                <div>
                  <b>{name}</b>
                  <small>{time}</small>
                </div>
                <div className={styles.ledgerRight}>
                  <strong className={amount.startsWith("+") ? styles.statusGood : styles.statusSpent}>
                    {amount}
                  </strong>
                  <span className={styles.statusPill}>{status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

