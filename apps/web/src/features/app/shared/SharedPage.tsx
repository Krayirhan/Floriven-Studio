import { Link } from "react-router-dom";
import dashboardStyles from "../DashboardPage.module.css";
import { MultiScreenRenderer } from "../dashboard-preview";
import { projectsList } from "../dashboard.data";
import { WorkspacePageHeader } from "../workspace/WorkspacePageHeader";

function SharedProjects() {
  return (
    <div className={dashboardStyles.projectGrid}>
      {projectsList.slice(0, 2).map((project) => (
        <Link key={project.id} to={`/app/projeler/${project.id}/studio`} className={dashboardStyles.projectCard}>
          <div className={dashboardStyles.projectCardPreviewHeader}>
            <div className={dashboardStyles.cardPreviewGlow} />
            <MultiScreenRenderer direction={project.direction} />
          </div>
          <div className={dashboardStyles.projectCardBody}>
            <div className={dashboardStyles.cardDirectionPill}>{project.direction}</div>
            <div className={dashboardStyles.cardTitleRow}>
              <h3>{project.name}</h3>
              <span className={dashboardStyles.screenCountBadge}>{project.screens} ekran</span>
            </div>
            <p>{project.description}</p>
            <div className={dashboardStyles.cardFooterMeta}>
              <span>{project.lastUpdated}</span>
              <span className={dashboardStyles.cardArrow}>Düzenle →</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function SharedPage() {
  return (
    <div className={dashboardStyles.page}>
      <WorkspacePageHeader section="shared" />
      <div className={dashboardStyles.sectionHeader}><div><span className={dashboardStyles.subHeader}>ÇALIŞMA ALANI</span><h2>Son güncellemeler</h2></div><Link to="/app?focus=prompt" className={dashboardStyles.linkMore}>Yeni üretim →</Link></div>
      <SharedProjects />
    </div>
  );
}
