import { Link } from "react-router-dom";
import dashboardStyles from "../DashboardPage.module.css";
import { StylePresetPreview } from "../dashboard-preview";
import { templates } from "../dashboard.data";
import { WorkspacePageHeader } from "../workspace/WorkspacePageHeader";

function TemplateGallery() {
  return (
    <div className={dashboardStyles.templateGrid}>
      {templates.map((template) => (
        <article key={template.id} className={dashboardStyles.templateCard}>
          <div className={dashboardStyles.templatePreviewWindow} style={{ background: template.previewColor }}>
            <StylePresetPreview presetId={template.id} />
          </div>
          <div className={dashboardStyles.templateMeta}>
            <div className={dashboardStyles.templateHeaderRow}>
              <span className={dashboardStyles.templateCategory}>{template.category}</span>
              <span className={dashboardStyles.templateDirectionTag}>{template.strategy.visualDirection}</span>
            </div>
            <h3>{template.name}</h3>
            <p>{template.description}</p>
            <p>{template.system.signatureComponents.slice(0, 2).join(" · ")}</p>
            <div className={dashboardStyles.templateFooterRow}>
              <span className={dashboardStyles.templateScreenTag}>v{template.version} · {template.strategy.cardStyle}</span>
              <Link to={`/app?template=${template.id}`} className={dashboardStyles.useStyleBtn}>Bu sistemi kullan</Link>
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
