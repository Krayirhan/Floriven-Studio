import { Link } from "react-router-dom";
import dashboardStyles from "../DashboardPage.module.css";
import { WorkspacePageHeader } from "../workspace/WorkspacePageHeader";

function NotificationUpdates() {
  const items = [["Bütçe Detayı ekranı oluşturuldu", "15 dakika önce · Kişisel Finans", "/app/projeler/prj_finance_01/studio"], ["Figma dışa aktarımın hazır", "1 saat önce · Kişisel Finans", "/app/projeler/prj_finance_01/studio"]] as const;

  return (
    <div className={dashboardStyles.projectGrid}>
      {items.map(([title, description, to]) => (
        <Link key={title} to={to} className={dashboardStyles.projectCard}>
          <div className={dashboardStyles.projectCardBody}>
            <div className={dashboardStyles.cardDirectionPill}>GÜNCELLEME</div>
            <div className={dashboardStyles.cardTitleRow}><h3>{title}</h3></div>
            <p>{description}</p>
            <div className={dashboardStyles.cardFooterMeta}><span>Floriven Studio</span><span className={dashboardStyles.cardArrow}>Aç →</span></div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function NotificationsPage() {
  return (
    <div className={dashboardStyles.page}>
      <WorkspacePageHeader section="notifications" />
      <div className={dashboardStyles.sectionHeader}><div><span className={dashboardStyles.subHeader}>ÇALIŞMA ALANI</span><h2>Son güncellemeler</h2></div><Link to="/app?focus=prompt" className={dashboardStyles.linkMore}>Yeni üretim →</Link></div>
      <NotificationUpdates />
    </div>
  );
}
