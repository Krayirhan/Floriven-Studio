import { useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../../components/ui";
import { projectService } from "../../services";
import { MultiScreenRenderer } from "./dashboard-preview";
import { projectsList } from "./dashboard.data";
import styles from "./DashboardPage.module.css";

export function ProjectListPage() {
  const [filter, setFilter] = useState<"all" | "favorites" | "drafts">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const projects = projectService.list();
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLocaleLowerCase("tr-TR").includes(searchQuery.toLocaleLowerCase("tr-TR"))
      || project.description.toLocaleLowerCase("tr-TR").includes(searchQuery.toLocaleLowerCase("tr-TR"));
    if (filter === "favorites") return matchesSearch && project.id === "prj_finance_01";
    if (filter === "drafts") return matchesSearch && project.status === "draft";
    return matchesSearch;
  });

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <span className={styles.subHeader}>PROJELERİM</span>
        <h1>Tüm çalışmalar</h1>
        <p>Fikirlerini, akışlarını ve tasarım sistemlerini Dashboard’daki aynı proje görünümüyle yönet.</p>
      </header>

      <section className={styles.projectsSection}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.subHeader}>PROJE KÜTÜPHANESİ</span>
            <h2>Çalışmaların</h2>
          </div>
          <Link to="/app?focus=prompt" className={styles.linkMore}>Yeni üretim →</Link>
        </div>

        <div className={styles.libraryToolbar}>
          <label className={styles.librarySearch}>
            <span aria-hidden="true">⌕</span>
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Proje ara..." aria-label="Proje ara" />
          </label>
          <div className={styles.libraryFilters} role="group" aria-label="Proje filtresi">
            <button className={filter === "all" ? styles.libraryFilterActive : ""} onClick={() => setFilter("all")}>Tümü ({projects.length})</button>
            <button className={filter === "favorites" ? styles.libraryFilterActive : ""} onClick={() => setFilter("favorites")}>Favoriler (1)</button>
            <button className={filter === "drafts" ? styles.libraryFilterActive : ""} onClick={() => setFilter("drafts")}>Taslaklar</button>
          </div>
        </div>

        {filteredProjects.length === 0 ? <EmptyState title="Proje bulunamadı" description="Arama veya filtre kriterlerini değiştirerek tekrar deneyin." /> : (
          <div className={styles.projectGrid}>
            {filteredProjects.map((project) => {
              const preview = projectsList.find((item) => item.id === project.id);
              return (
                <Link key={project.id} to={`/app/projeler/${project.id}/studio`} className={styles.projectCard}>
                  <div className={styles.projectCardPreviewHeader}>
                    <div className={styles.cardPreviewGlow} />
                    <MultiScreenRenderer direction={preview?.direction ?? "Professional Finance"} />
                  </div>
                  <div className={styles.projectCardBody}>
                    <div className={styles.cardDirectionPill}>{preview?.direction ?? "Floriven Studio"}</div>
                    <div className={styles.cardTitleRow}>
                      <h3>{project.name}</h3>
                      <span className={styles.screenCountBadge}>{project.screens} ekran</span>
                    </div>
                    <p>{project.description}</p>
                    <div className={styles.cardFooterMeta}>
                      <span>{project.updatedAt || "Yeni"}</span>
                      <span className={styles.cardArrow}>Düzenle →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
