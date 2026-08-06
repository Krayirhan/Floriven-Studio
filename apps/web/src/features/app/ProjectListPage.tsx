import { useState } from "react";
import { AppShell } from "./AppShell";
import { mockProjectService } from "../../services/mockProjectService";
import styles from "./ProductPages.module.css";

export function ProjectListPage() {
  const [filter, setFilter] = useState<"all" | "favorites" | "drafts">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const projects = mockProjectService.list();

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === "favorites") return matchesSearch && p.id === "prj_finance_01";
    if (filter === "drafts") return matchesSearch && p.status === "draft";
    return matchesSearch;
  });

  return (
    <AppShell>
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <span className={styles.kicker}>PROJELERİM</span>
            <h1>Tüm Çalışmalar</h1>
            <p>Fikirlerini, akışlarını ve tasarım sistemlerini yönet.</p>
          </div>
          <a href="/app/projeler/yeni" className={styles.primary}>
            + Yeni Proje Oluştur
          </a>
        </header>

        {/* SEARCH & FILTER BAR */}
        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Proje adına veya içeriğe göre ara..."
            />
          </div>

          <div className={styles.filterPills}>
            <button
              className={filter === "all" ? styles.filterActive : ""}
              onClick={() => setFilter("all")}
            >
              Tümü ({projects.length})
            </button>
            <button
              className={filter === "favorites" ? styles.filterActive : ""}
              onClick={() => setFilter("favorites")}
            >
              ★ Favoriler (1)
            </button>
            <button
              className={filter === "drafts" ? styles.filterActive : ""}
              onClick={() => setFilter("drafts")}
            >
              ⚡ Taslaklar
            </button>
          </div>
        </div>

        {/* PROJECTS GRID */}
        <div className={styles.projectGrid}>
          {/* New Project Creator Card */}
          <a href="/app/projeler/yeni" className={`${styles.projectCard} ${styles.newProject}`}>
            <div className={styles.newProjectIcon}>✦</div>
            <h3>Yeni Proje Başlat</h3>
            <p>Brief, görsel veya hazır şablonla yeni mobil/web akışı oluştur</p>
          </a>

          {filteredProjects.map((project) => (
            <a
              href={`/app/projeler/${project.id}/studio`}
              className={styles.projectCard}
              key={project.id}
            >
              <div
                className={styles.projectPreview}
                style={
                  {
                    "--project-accent": project.accent || "var(--color-primary)",
                  } as React.CSSProperties
                }
              >
                <div className={styles.previewBadge}>
                  {project.status === "draft" ? "Taslak" : "Düzenlenebilir"}
                </div>
                <span />
                <span />
                <div>
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <div className={styles.projectInfo}>
                <div>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                </div>
                <span className={styles.projectMenu} title="Seçenekler">•••</span>
              </div>
              <div className={styles.projectMeta}>
                <span className={styles.badgeTag}>{project.screens} Ekran</span>
                <span>{project.updatedAt || "Yeni"}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

