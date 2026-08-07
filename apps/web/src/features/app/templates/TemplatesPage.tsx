import { Link } from "react-router-dom";
import dashboardStyles from "../DashboardPage.module.css";
import { MultiScreenRenderer } from "../dashboard-preview";
import { templates } from "../dashboard.data";
import { WorkspacePageHeader } from "../workspace/WorkspacePageHeader";

function TemplateGallery() {
  return (
    <div className={dashboardStyles.templateGrid}>
      {templates.map((template) => (
        <article key={template.id} className={dashboardStyles.templateCard}>
          <div className={dashboardStyles.templatePreviewWindow} style={{ background: template.themeColor }}>
            <div className={dashboardStyles.templatePreviewGlow} />
            <MultiScreenRenderer direction={template.direction} />
          </div>
          <div className={dashboardStyles.templateMeta}>
            <div className={dashboardStyles.templateHeaderRow}>
              <span className={dashboardStyles.templateCategory}>{template.category}</span>
              <span className={dashboardStyles.templateDirectionTag}>{template.direction}</span>
            </div>
            <h3>{template.title}</h3>
            <p>{template.description}</p>
            <div className={dashboardStyles.templateFooterRow}>
              <span className={dashboardStyles.templateScreenTag}>📱 {template.screenCount} ekranlık akış</span>
              <Link to={`/app?template=${template.id === "finance_pro" ? "finance" : template.id === "calm_wellness" ? "wellness" : "commerce"}`} className={dashboardStyles.useStyleBtn}>Bu stille başla</Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function TemplatesPage() {
  return (
    <div className={dashboardStyles.page}>
      <WorkspacePageHeader section="templates" />
      <div className={dashboardStyles.sectionHeader}><div><span className={dashboardStyles.subHeader}>ÇALIŞMA ALANI</span><h2>Popüler tasarım stilleri</h2></div><Link to="/app?focus=prompt" className={dashboardStyles.linkMore}>Yeni üretim →</Link></div>
      <TemplateGallery />
    </div>
  );
}
