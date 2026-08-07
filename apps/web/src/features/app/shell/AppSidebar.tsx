import type { CSSProperties } from "react";
import { Link, NavLink } from "react-router-dom";
import styles from "../AppShell.module.css";
import { CreditIcon, GridIcon, HelpIcon, HomeIcon, LayersIcon, LayoutIcon, SettingsIcon, UsersIcon } from "./shell.data";

const navLinkClass = ({ isActive }: { isActive: boolean }) => isActive ? styles.navActive : undefined;

export function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}>
      <div className={styles.sidebarTop}>
        <Link to="/app" className={styles.brand}>
          {collapsed
            ? <img src="/logo/icon-color.png" alt="Floriven" className={styles.brandIcon} />
            : <img src="/logo/logo-color.png" alt="Floriven" className={styles.brandLogo} />}
        </Link>
        <button className={styles.collapseBtn} onClick={onToggle} aria-label={collapsed ? "Paneli genişlet" : "Paneli daralt"}>
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {!collapsed && <Link to="/app?focus=prompt" className={styles.primaryCta}>+ Yeni tasarım</Link>}
      {collapsed && <Link to="/app?focus=prompt" className={styles.primaryCtaIcon} title="Yeni tasarım">+</Link>}

      <nav className={styles.nav}>
        <NavLink to="/app" end className={navLinkClass} aria-label="Ana sayfa"><HomeIcon /> {!collapsed && <span>Ana sayfa</span>}</NavLink>
        <NavLink to="/app/projeler" className={navLinkClass} aria-label="Projelerim"><GridIcon /> {!collapsed && <span>Projelerim</span>}</NavLink>
        <NavLink to="/app/paylasilanlar" className={navLinkClass} aria-label="Paylaşılanlar"><UsersIcon /> {!collapsed && <span>Paylaşılanlar</span>}</NavLink>
        <NavLink to="/app/sablonlar" className={navLinkClass} aria-label="Şablonlar"><LayoutIcon /> {!collapsed && <span>Şablonlar</span>}</NavLink>
        <NavLink to="/app/varliklar" className={navLinkClass} aria-label="Varlıklar"><LayersIcon /> {!collapsed && <span>Varlıklar</span>}</NavLink>
      </nav>

      {!collapsed && <div className={styles.recentSection}>
        <div className={styles.recentHeader}><span>SON PROJELER</span><Link to="/app/projeler">Tümü</Link></div>
        {[
          { id: "prj_finance_01", name: "Kişisel Finans", screens: 3, time: "5 dk önce", accent: "#DE7B5B" },
          { id: "prj_wellness_02", name: "Melo Wellness", screens: 6, time: "1 sa.", accent: "#7EA786" },
          { id: "prj_shop_03", name: "Nora Market", screens: 4, time: "Dün", accent: "#d99b38" },
        ].map((project) => (
          <Link to={`/app/projeler/${project.id}/studio`} className={styles.recentItem} key={project.name}>
            <span className={styles.recentThumb} style={{ "--project-accent": project.accent } as CSSProperties}><i /><i /></span>
            <span className={styles.recentInfo}><b>{project.name}</b><small>{project.screens} ekran · {project.time}</small></span>
          </Link>
        ))}
      </div>}

      <div className={styles.sidebarBottom}>
        <Link to="/app/faturalandirma" aria-label="Kullanım ve krediler"><CreditIcon /> {!collapsed && <span>Kullanım ve krediler</span>}</Link>
        <Link to="/app/ayarlar" aria-label="Ayarlar"><SettingsIcon /> {!collapsed && <span>Ayarlar</span>}</Link>
        <NavLink to="/app/yardim" className={navLinkClass} aria-label="Yardım"><HelpIcon /> {!collapsed && <span>Yardım</span>}</NavLink>
        {!collapsed && <div className={styles.userBadge}><span className={styles.avatar}>E</span><span><b>Emre Y.</b><small>Ücretsiz plan</small></span><span className={styles.more}>•••</span></div>}
      </div>
    </aside>
  );
}
