import { Link } from "react-router-dom";
import studioStyles from "../../studio/StudioPage.module.css";
import dashboardStyles from "../DashboardPage.module.css";
import { WorkspacePageHeader } from "../workspace/WorkspacePageHeader";

function AssetsList() {
  return (
    <div className={dashboardStyles.continueHeroCard}>
      <div className={studioStyles.leftContent}>
        {["logo.svg", "hero-bg.png", "icon-set.svg"].map((name, index) => (
          <div className={studioStyles.asItem} key={name}>
            <span className={studioStyles.asPreview}>◆</span>
            <div><div style={{ fontSize: 11, fontWeight: 500, color: "var(--fv-text)" }}>{name}</div><div style={{ marginTop: 1, fontSize: 9, color: "var(--fv-text-muted)" }}>{index === 0 ? "Vektör" : index === 1 ? "Görsel" : "Simge seti"}</div></div>
          </div>
        ))}
        <button className={studioStyles.sBtn}>+ Varlık yükle</button>
      </div>
    </div>
  );
}

export function AssetsPage() {
  return (
    <div className={dashboardStyles.page}>
      <WorkspacePageHeader section="assets" />
      <div className={dashboardStyles.sectionHeader}><div><span className={dashboardStyles.subHeader}>ÇALIŞMA ALANI</span><h2>Studio varlıkları</h2></div><Link to="/app?focus=prompt" className={dashboardStyles.linkMore}>Yeni üretim →</Link></div>
      <AssetsList />
    </div>
  );
}
