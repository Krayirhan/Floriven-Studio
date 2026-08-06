import { type CSSProperties, type ReactNode, useState } from "react";
import styles from "./AppShell.module.css";

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.shell}>
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}
      >
        {/* Brand + collapse */}
        <div className={styles.sidebarTop}>
          <a href="/app" className={styles.brand}>
            <span className={styles.brandMark}>◆</span> {!collapsed && <span>Floriven <em>Studio</em></span>}
          </a>
          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Paneli genişlet" : "Paneli daralt"}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* Primary CTA */}
        {!collapsed && (
          <a href="/app/projeler/yeni" className={styles.primaryCta}>
            + Yeni tasarım
          </a>
        )}
        {collapsed && (
          <a
            href="/app/projeler/yeni"
            className={styles.primaryCtaIcon}
            title="Yeni tasarım"
          >
            +
          </a>
        )}

        {/* Main nav */}
        <nav className={styles.nav}>
          <a href="/app" className={styles.navActive}>
            ⌂ {!collapsed && <span>Ana sayfa</span>}
          </a>
          <a href="/app/projeler">▦ {!collapsed && <span>Projelerim</span>}</a>
          <a href="/app">◈ {!collapsed && <span>Paylaşılanlar</span>}</a>
          <a href="/app">☷ {!collapsed && <span>Şablonlar</span>}</a>
          <a href="/app">⊞ {!collapsed && <span>Varlıklar</span>}</a>
        </nav>

        {/* Recent projects */}
        {!collapsed && (
          <div className={styles.recentSection}>
            <div className={styles.recentHeader}>
              <span>Son projeler</span>
              <a href="/app/projeler">Tümü</a>
            </div>
            {(
              [
                {
                  id: "prj_finance_01",
                  name: "Kişisel Finans",
                  screens: 3,
                  time: "5 dk önce",
                  accent: "var(--color-primary)",
                },
                {
                  id: "prj_wellness_02",
                  name: "Melo Wellness",
                  screens: 6,
                  time: "1 sa.",
                  accent: "var(--color-success)",
                },
                {
                  id: "prj_shop_03",
                  name: "Nora Market",
                  screens: 4,
                  time: "Dün",
                  accent: "#E2B04A",
                },
              ] as const
            ).map((p) => (
              <a
                href={`/app/projeler/${p.id}/studio`}
                className={styles.recentItem}
                key={p.name}
              >
                <span className={styles.recentThumb} style={{ "--project-accent": p.accent } as CSSProperties}><i /><i /></span>
                <span className={styles.recentInfo}>
                  <b>{p.name}</b>
                  <small>
                    {p.screens} ekran · {p.time}
                  </small>
                </span>
              </a>
            ))}
          </div>
        )}

        {/* Bottom */}
        <div className={styles.sidebarBottom}>
          <a href="/app/faturalandirma">
            ◌ {!collapsed && <span>Kullanım ve krediler</span>}
          </a>
          <a href="/app/ayarlar">⚙ {!collapsed && <span>Ayarlar</span>}</a>
          <a href="#">? {!collapsed && <span>Yardım</span>}</a>
          {!collapsed && (
            <div className={styles.userBadge}>
              <span className={styles.avatar}>E</span>
              <span>
                <b>Emre Y.</b>
                <small>Ücretsiz plan</small>
              </span>
              <span className={styles.more}>•••</span>
            </div>
          )}
        </div>
      </aside>

      <main
        className={`${styles.main} ${collapsed ? styles.mainExpanded : ""}`}
      >
        {children}
      </main>
    </div>
  );
}
