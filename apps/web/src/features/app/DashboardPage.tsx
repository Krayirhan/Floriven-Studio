import styles from "./DashboardPage.module.css";
import { DashboardComposer } from "./dashboard/DashboardComposer";
import { DashboardProjectHero } from "./dashboard/DashboardProjectHero";
import { DashboardSections } from "./dashboard/DashboardSections";
import { useDashboardComposer } from "./dashboard/useDashboardComposer";
import { useRedesignWorkflow } from "./dashboard/useRedesignWorkflow";

export function DashboardPage() {
  const composer = useDashboardComposer();
  const redesign = useRedesignWorkflow(composer.generating, composer.setGenerating);

  return <div className={styles.page}>
    <section className={styles.hero}><h1>Ne tasarlamak istiyorsun?</h1><p>Mobil veya web fikrini anlat, mevcut ekranını yükle ya da kaldığın projeyle devam et.</p></section>
    <DashboardComposer composer={composer} redesign={redesign} />
    <DashboardProjectHero />
    <DashboardSections onSelectTemplate={composer.handleSelectTemplate} />
  </div>;
}
