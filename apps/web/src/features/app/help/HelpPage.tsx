import { Link } from "react-router-dom";
import dashboardStyles from "../DashboardPage.module.css";
import { WorkspacePageHeader } from "../workspace/WorkspacePageHeader";

function HelpGuides() {
  const items = [["İlk tasarımını üret", "Brief yazma ve doğru sonuç alma rehberi.", "/app?focus=prompt"], ["Klavye kısayolları", "Studio’da hızlı çalışmak için temel kısayollar.", "/app/projeler/prj_finance_01/studio"]] as const;

  return (
    <div className={dashboardStyles.templateGrid}>
      {items.map(([title, description, to]) => (
        <article key={title} className={dashboardStyles.templateCard}>
          <div className={dashboardStyles.templatePreviewWindow}>
            <div className={dashboardStyles.templatePreviewGlow} />
            <span className={dashboardStyles.cardDirectionPill}>?</span>
          </div>
          <div className={dashboardStyles.templateMeta}>
            <div className={dashboardStyles.templateHeaderRow}><span className={dashboardStyles.templateCategory}>REHBER</span><span className={dashboardStyles.templateDirectionTag}>Floriven</span></div>
            <h3>{title}</h3><p>{description}</p>
            <div className={dashboardStyles.templateFooterRow}><span className={dashboardStyles.templateScreenTag}>Studio rehberi</span><Link to={to} className={dashboardStyles.useStyleBtn}>Aç</Link></div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function HelpPage() {
  return (
    <div className={dashboardStyles.page}>
      <WorkspacePageHeader section="help" />
      <div className={dashboardStyles.sectionHeader}><div><span className={dashboardStyles.subHeader}>ÇALIŞMA ALANI</span><h2>Son güncellemeler</h2></div><Link to="/app?focus=prompt" className={dashboardStyles.linkMore}>Yeni üretim →</Link></div>
      <HelpGuides />
    </div>
  );
}
