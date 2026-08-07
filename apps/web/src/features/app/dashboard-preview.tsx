import styles from "./DashboardPage.module.css";
import type { VisualDirection } from "./dashboard.data";

export function FinanceScreens3() {
  return (
    <div className={styles.screenStack3}>
      <div className={`${styles.mobilePhoneFrame3} ${styles.frameFinance3_1}`}>
        <div className={styles.notch} />
        <div className={styles.phoneHeader}><span>09:41</span><span className={styles.badgePill}>Pro</span></div>
        <div className={styles.financeCard}><small>Toplam Varlık</small><b>₺184.250</b><span className={styles.upTrend}>+₺14.200 bu ay</span></div>
        <div className={styles.quickActions}><div className={styles.actionPill}>Gönder</div><div className={styles.actionPill}>İste</div><div className={styles.actionPill}>Yatırım</div></div>
        <div className={styles.miniChart}><div style={{ height: "45%" }} /><div style={{ height: "65%" }} /><div style={{ height: "40%" }} /><div style={{ height: "85%" }} /><div style={{ height: "100%", background: "#10b981" }} /></div>
      </div>
      <div className={`${styles.mobilePhoneFrame3} ${styles.frameFinance3_2}`}>
        <div className={styles.notch} /><div className={styles.phoneHeader}><span>Varlıklar</span><span className={styles.dotIndicator} /></div>
        <div className={styles.donutPlaceholder}><div className={styles.donutCenter}>%68</div></div>
        <div className={styles.listRows}><div className={styles.rowItem}><span className={styles.rowDotEmerald} />Hisse Senedi</div><div className={styles.rowItem}><span className={styles.rowDotCyan} />Kripto Portföy</div><div className={styles.rowItem}><span className={styles.rowDotGold} />Altın & Döviz</div></div>
      </div>
      <div className={`${styles.mobilePhoneFrame3} ${styles.frameFinance3_3}`}>
        <div className={styles.notch} /><div className={styles.phoneHeader}><span>İşlemler</span><span>Tümü</span></div>
        <div className={styles.txList}><div className={styles.txRow}><span>Market Hacmi</span><b style={{ color: "#ef4444" }}>-₺340</b></div><div className={styles.txRow}><span>Maaş Yatırımı</span><b style={{ color: "#10b981" }}>+₺42.000</b></div><div className={styles.txRow}><span>Borsa Alım</span><b style={{ color: "#ef4444" }}>-₺1.200</b></div></div>
      </div>
    </div>
  );
}

export function FinanceScreens() {
  return <div className={styles.screenStack}><div className={`${styles.mobilePhoneFrame} ${styles.frameFinance1}`}><div className={styles.notch} /><div className={styles.phoneHeader}><span>09:41</span><span className={styles.badgePill}>Pro</span></div><div className={styles.financeCard}><small>Toplam Varlık</small><b>₺184.250</b><span className={styles.upTrend}>+₺14.200 bu ay</span></div><div className={styles.quickActions}><div className={styles.actionPill}>Gönder</div><div className={styles.actionPill}>İste</div></div></div><div className={`${styles.mobilePhoneFrame} ${styles.frameFinance2}`}><div className={styles.notch} /><div className={styles.phoneHeader}>Analiz</div><div className={styles.donutPlaceholder}><div className={styles.donutCenter}>%68</div></div></div></div>;
}

export function FuturismScreens() {
  return <div className={styles.screenStack}><div className={`${styles.mobilePhoneFrame} ${styles.frameFuturism1}`}><div className={styles.notch} /><div className={styles.phoneHeader}><span className={styles.glowText}>AETHER AI</span></div><div className={styles.chatBubbleUser}><p>Mobil akış üret...</p></div><div className={styles.chatBubbleAi}><p>3 ekranlı ödeme akışı hazır.</p></div></div><div className={`${styles.mobilePhoneFrame} ${styles.frameFuturism2}`}><div className={styles.notch} /><div className={styles.phoneHeader}>Node Graph</div><div className={styles.nodeBoxActive}><b>Claude 3.5</b></div></div></div>;
}

export function OrganicScreens() {
  return <div className={styles.screenStack}><div className={`${styles.mobilePhoneFrame} ${styles.frameOrganic1}`}><div className={styles.notch} /><div className={styles.phoneHeader}><span style={{ fontFamily: "serif" }}>NORA</span></div><div className={styles.organicHeroBanner}><small>Özel Kavrum</small><h4>Ethiopia</h4></div></div><div className={`${styles.mobilePhoneFrame} ${styles.frameOrganic2}`}><div className={styles.notch} /><div className={styles.buyButtonOrganic}>Sipariş Ver</div></div></div>;
}

export function WellnessScreens() {
  return <div className={styles.screenStack}><div className={`${styles.mobilePhoneFrame} ${styles.frameWellness1}`}><div className={styles.notch} /><div className={styles.phoneHeader}>Günlük Özet</div><div className={styles.ringContainer}><div className={styles.ringOuter}><div className={styles.ringInner}>8.4k</div></div></div></div><div className={`${styles.mobilePhoneFrame} ${styles.frameWellness2}`}><div className={styles.notch} /><div className={styles.playButtonWellness}>▶ Başlat</div></div></div>;
}

export function EducationScreens() {
  return <div className={styles.screenStack}><div className={`${styles.mobilePhoneFrame} ${styles.frameEdu1}`}><div className={styles.notch} /><div className={styles.phoneHeader}>🔥 14 Gün</div><div className={styles.eduCard}><b>UX Prensipleri</b></div></div><div className={`${styles.mobilePhoneFrame} ${styles.frameEdu2}`}><div className={styles.notch} /><div className={styles.quizOption}>Fitts Yasası</div></div></div>;
}

export function EditorialScreens() {
  return <div className={styles.screenStack}><div className={`${styles.mobilePhoneFrame} ${styles.frameEditorial1}`}><div className={styles.notch} /><div className={styles.phoneHeader}>KÜRATÖR</div><div className={styles.editorialPhotoHero}><span>MİMARİ</span></div></div><div className={`${styles.mobilePhoneFrame} ${styles.frameEditorial2}`}><div className={styles.notch} /><div className={styles.edFrame} /></div></div>;
}

export function MultiScreenRenderer({ direction }: { direction: VisualDirection }) {
  switch (direction) {
    case "Professional Finance": return <FinanceScreens />;
    case "Soft Futurism": return <FuturismScreens />;
    case "Warm Organic": return <OrganicScreens />;
    case "Calm Wellness": return <WellnessScreens />;
    case "Playful Education": return <EducationScreens />;
    case "Editorial Minimal": return <EditorialScreens />;
    default: return <FinanceScreens />;
  }
}
