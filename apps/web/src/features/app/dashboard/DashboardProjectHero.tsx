import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../DashboardPage.module.css";
import { FinanceScreens3 } from "../dashboard-preview";

const DEMO_PROJECT_ID = "prj_finance_01";

export function DashboardProjectHero() {
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const previewDialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setShowPreviewModal(false);
      setShowProjectMenu(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    if (showPreviewModal) previewDialogRef.current?.focus();
  }, [showPreviewModal]);

  return <section className={styles.continueSection}>
    <div className={styles.sectionHeader}><div><span className={styles.subHeader}>KALDIĞIN YERDEN DEVAM ET</span><h2>Son Çalışılan Proje</h2></div></div>
    <article className={styles.continueHeroCardLarge}>
      <div className={styles.heroPreviewWindowLarge}><div className={styles.previewGlowLarge} /><FinanceScreens3 /></div>
      <div className={styles.heroProjectMetaLarge}>
        <div className={styles.badgeGroup}><span className={styles.readyBadge}><span className={styles.liveDot} /> Düzenlemeye hazır</span><span className={styles.directionBadge}>Editorial Minimal</span></div>
        <h3>Kişisel Finans</h3><p>Genç profesyoneller için bütçe, gelir ve harcama yönetimi mobil deneyimi.</p>
        <div className={styles.projectTagsDetailed}><span>📱 3 ekran</span><span>🎨 3 varyasyon</span><span>⏱ 5 dk önce düzenlendi</span></div>
        <div className={styles.heroActionGroup}><Link to={`/app/projeler/${DEMO_PROJECT_ID}/studio`} className={styles.heroPrimaryBtn}>Düzenlemeye devam et</Link><button className={styles.heroSecondaryBtn} onClick={() => setShowPreviewModal(true)}>Önizle</button><div className={styles.menuWrapper}><button className={styles.heroMenuBtn} onClick={() => setShowProjectMenu(!showProjectMenu)} aria-label="Proje seçenekleri" aria-expanded={showProjectMenu} aria-controls="project-actions-menu">•••</button>{showProjectMenu && <div id="project-actions-menu" className={styles.heroDropdownMenu} role="menu">{["✦ Varyasyon üret", "🔗 Paylaş", "📋 Çoğalt", "ℹ Proje detayları", "📦 Arşivle"].map((action) => <button key={action} onClick={() => setShowProjectMenu(false)}>{action}</button>)}</div>}</div></div>
      </div>
    </article>
    {showPreviewModal && <div className={styles.previewModalOverlay} onClick={() => setShowPreviewModal(false)}><div ref={previewDialogRef} tabIndex={-1} className={styles.previewModalContent} role="dialog" aria-modal="true" aria-label="Kişisel Finans ekran önizlemesi" onClick={(event) => event.stopPropagation()}><div className={styles.modalHeader}><div><h3>Kişisel Finans — 3 Ekran Önizleme</h3><span className={styles.modalSubtitle}>Editorial Minimal · 3 Varyasyon</span></div><button className={styles.closeModalBtn} onClick={() => setShowPreviewModal(false)} aria-label="Önizlemeyi kapat">✕</button></div><div className={styles.modalBodyScreens}><FinanceScreens3 /></div><div className={styles.modalFooter}><Link to={`/app/projeler/${DEMO_PROJECT_ID}/studio`} className={styles.heroPrimaryBtn}>Düzenlemeye devam et →</Link></div></div></div>}
  </section>;
}
