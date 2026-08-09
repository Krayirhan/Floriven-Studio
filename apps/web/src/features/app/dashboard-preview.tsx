import styles from "./DashboardPage.module.css";
import type { CSSProperties } from "react";
import type { DesignTemplateId } from "@floriven/design-spec";

const PREVIEW_TOKENS: Record<DesignTemplateId, CSSProperties> = {
  "obsidian-precision": { "--preset-bg": "#07111f", "--preset-surface": "#0e1b2c", "--preset-text": "#f4f8ff", "--preset-muted": "#8fa6bd", "--preset-accent": "#22d3ee", "--preset-radius": "4px", "--preset-font": "Inter, sans-serif" } as CSSProperties,
  "serene-health": { "--preset-bg": "#f3faf6", "--preset-surface": "#ffffff", "--preset-text": "#17332b", "--preset-muted": "#698078", "--preset-accent": "#2f9b78", "--preset-radius": "18px", "--preset-font": "Inter, sans-serif" } as CSSProperties,
  "terracotta-market": { "--preset-bg": "#f6eee5", "--preset-surface": "#fffaf4", "--preset-text": "#44271d", "--preset-muted": "#8a6b5d", "--preset-accent": "#c86140", "--preset-radius": "12px", "--preset-font": "Georgia, serif" } as CSSProperties,
  "electric-learning": { "--preset-bg": "#1d0e46", "--preset-surface": "#32166d", "--preset-text": "#ffffff", "--preset-muted": "#c8b8ef", "--preset-accent": "#c7ff36", "--preset-radius": "20px", "--preset-font": "Inter, sans-serif" } as CSSProperties,
  "editorial-culture": { "--preset-bg": "#f5f1e9", "--preset-surface": "#f5f1e9", "--preset-text": "#181511", "--preset-muted": "#6c655c", "--preset-accent": "#181511", "--preset-radius": "0px", "--preset-font": "Georgia, serif" } as CSSProperties,
};

/** Same neutral product content, five genuinely different visual systems. */
export function StylePresetPreview({ presetId }: { presetId: DesignTemplateId }) {
  return <div className={styles.presetPreview} data-preset={presetId} style={PREVIEW_TOKENS[presetId]} aria-label={`${presetId} tasarım sistemi önizlemesi`}>
    <div className={styles.presetPhone}>
      <div className={styles.presetStatus}><span>09:41</span><span>● ●</span></div>
      <header className={styles.presetHeader}><small>ÇALIŞMA ALANI</small><strong>Bugünün odağı</strong><span>Kuzey Studio teslimi</span></header>
      <div className={styles.presetMetrics}><article><small>BEKLEYEN</small><b>₺38.500</b></article><article><small>İLERLEME</small><b>%72</b></article></div>
      <div className={styles.presetFeature}><i /><div><small>ATLAS COFFEE</small><b>Web tasarımı</b><span>18 Ağustos · 5 gün kaldı</span></div></div>
      <div className={styles.presetRows}><span><b>01</b> Geciken fatura</span><span><b>02</b> Aylık gelir hedefi</span></div>
      <nav className={styles.presetNav}><b>Özet</b><span>Projeler</span><span>Finans</span></nav>
    </div>
    <div className={`${styles.presetPhone} ${styles.presetPhoneSecondary}`}><div className={styles.presetStatus}><span>Projeler</span><span>•••</span></div><div className={styles.presetFeature}><i /><div><small>TESLİM</small><b>Kuzey Studio</b><span>Marka kimliği · %84</span></div></div><div className={styles.presetRows}><span><b>A</b> Atlas Coffee</span><span><b>N</b> Nova Editoryal</span></div></div>
  </div>;
}

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

export function MultiScreenRenderer({ direction }: { direction: string }) {
  switch (direction) {
    case "Operasyonel kesinlik ve üst düzey veri kontrolü": case "Kesin ve analitik": return <FinanceScreens />;
    case "Sakin bakım, güvenli yönlendirme ve insani netlik": case "Sakin ve destekleyici": return <WellnessScreens />;
    case "Dokunsal sıcaklık, küratöryel keşif ve premium alışveriş": case "Sıcak ve ürün odaklı": return <OrganicScreens />;
    case "Enerjik ilerleme, anlık geri bildirim ve oyunlaştırılmış odak": return <EducationScreens />;
    case "Küratöryel anlatı, tipografik gerilim ve kültürel rafinelik": return <EditorialScreens />;
    default: return <FinanceScreens />;
  }
}
