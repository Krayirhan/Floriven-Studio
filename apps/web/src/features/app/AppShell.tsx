import { type CSSProperties, type ReactNode, useState, useEffect, useRef } from "react";
import styles from "./AppShell.module.css";

function SvgIcon({ children, size = 16 }: { children: ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" style={{ flexShrink: 0 }}>
      {children}
    </svg>
  );
}

const HomeIcon = () => <SvgIcon><path d="M3 12L12 3l9 9"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-9"/></SvgIcon>;
const GridIcon = () => <SvgIcon><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></SvgIcon>;
const UsersIcon = () => <SvgIcon><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 1 0 7.75"/></SvgIcon>;
const LayoutIcon = () => <SvgIcon><rect x="3" y="3" width="18" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></SvgIcon>;
const LayersIcon = () => <SvgIcon><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></SvgIcon>;
const CreditIcon = () => <SvgIcon size={14}><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></SvgIcon>;
const SettingsIcon = () => <SvgIcon><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></SvgIcon>;
const HelpIcon = () => <SvgIcon size={14}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></SvgIcon>;
const SearchIcon = () => <SvgIcon size={14}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></SvgIcon>;
const BellIcon = () => <SvgIcon size={15}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></SvgIcon>;

type PopoverType = "generation" | "credits" | "notifications" | "help" | null;

interface NotificationItem {
  id: string;
  group: "Bugün" | "Dün" | "Daha eski";
  text: string;
  time: string;
  unread: boolean;
}

const initialNotifications: NotificationItem[] = [
  { id: "1", group: "Bugün", text: "Bütçe Detayı ekranı oluşturuldu.", time: "15 dk önce", unread: true },
  { id: "2", group: "Bugün", text: "Figma dışa aktarımın hazır.", time: "1 saat önce", unread: true },
  { id: "3", group: "Dün", text: "Melo Wellness projesine yorum eklendi.", time: "Dün 14:20", unread: false },
  { id: "4", group: "Daha eski", text: "Kredi bakiyen 10'un altına düştü.", time: "3 gün önce", unread: false },
];

const searchItems = ["Kişisel Finans", "Melo Wellness", "Nora Market", "Aether AI", "Apex Wealth şablonu"];

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [activePopover, setActivePopover] = useState<PopoverType>(null);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLElement>(null);

  const togglePopover = (type: PopoverType) => {
    setActivePopover((prev) => (prev === type ? null : type));
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setActivePopover(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;
  const searchResults = searchItems.filter((item) => item.toLocaleLowerCase("tr-TR").includes(searchQuery.toLocaleLowerCase("tr-TR")));

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setSearchLoading(Boolean(value));
    window.setTimeout(() => setSearchLoading(false), 180);
  };

  return (
    <div className={styles.shell}>
      {/* GLOBAL SIDEBAR */}
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}
      >
        {/* Brand + collapse */}
        <div className={styles.sidebarTop}>
          <a href="/app" className={styles.brand}>
            {collapsed
              ? <img src="/logo/icon-color.png" alt="Floriven" className={styles.brandIcon} />
              : <img src="/logo/logo-color.png" alt="Floriven" className={styles.brandLogo} />
            }
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
          <a href="/app" className={styles.navActive} aria-label="Ana sayfa">
            <HomeIcon /> {!collapsed && <span>Ana sayfa</span>}
          </a>
          <a href="/app/projeler" aria-label="Projelerim">
            <GridIcon /> {!collapsed && <span>Projelerim</span>}
          </a>
          <a href="/app" aria-label="Paylaşılanlar">
            <UsersIcon /> {!collapsed && <span>Paylaşılanlar</span>}
          </a>
          <a href="/app" aria-label="Şablonlar">
            <LayoutIcon /> {!collapsed && <span>Şablonlar</span>}
          </a>
          <a href="/app" aria-label="Varlıklar">
            <LayersIcon /> {!collapsed && <span>Varlıklar</span>}
          </a>
        </nav>

        {/* Recent projects */}
        {!collapsed && (
          <div className={styles.recentSection}>
            <div className={styles.recentHeader}>
              <span>SON PROJELER</span>
              <a href="/app/projeler">Tümü</a>
            </div>
            {(
              [
                {
                  id: "prj_finance_01",
                  name: "Kişisel Finans",
                  screens: 3,
                  time: "5 dk önce",
                  accent: "#DE7B5B",
                },
                {
                  id: "prj_wellness_02",
                  name: "Melo Wellness",
                  screens: 6,
                  time: "1 sa.",
                  accent: "#7EA786",
                },
                {
                  id: "prj_shop_03",
                  name: "Nora Market",
                  screens: 4,
                  time: "Dün",
                  accent: "#d99b38",
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
          <a href="/app/faturalandirma" aria-label="Kullanım ve krediler">
            <CreditIcon /> {!collapsed && <span>Kullanım ve krediler</span>}
          </a>
          <a href="/app/ayarlar" aria-label="Ayarlar">
            <SettingsIcon /> {!collapsed && <span>Ayarlar</span>}
          </a>
          <a href="#" aria-label="Yardım">
            <HelpIcon /> {!collapsed && <span>Yardım</span>}
          </a>
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

      {/* MAIN LAYOUT WITH COMPACT GLOBAL TOPBAR */}
      <main
        className={`${styles.main} ${collapsed ? styles.mainExpanded : ""}`}
      >
        {/* COMPACT GLOBAL TOPBAR (50–54 PX) */}
        <header className={styles.topbar} ref={popoverRef}>
          {/* LEFT: Global search */}
          <div className={styles.searchBox}>
            <SearchIcon />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Proje, ekran, varlık veya şablon ara…"
              aria-label="Global arama"
            />
            <kbd>⌘K</kbd>
            {searchQuery && (
              <div className={styles.searchResults} role="status">
                {searchLoading ? (
                  <span>Aranıyor…</span>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result) => <a href="/app/projeler" key={result}>{result}</a>)
                ) : (
                  <span>Sonuç bulunamadı.</span>
                )}
              </div>
            )}
          </div>

          {/* CENTER: Active AI Generation Status */}
          <div className={styles.topbarCenter}>
            <button
              className={styles.generationPill}
              onClick={() => togglePopover("generation")}
              aria-expanded={activePopover === "generation"}
            >
              <span className={styles.livePulseDot} />
              <span>1 üretim devam ediyor</span>
            </button>
          </div>

          {/* RIGHT: Actions, Credits, Notifications, User */}
          <div className={styles.topbarRight}>
            {/* Credits pill */}
            <button
              className={styles.creditPill}
              onClick={() => togglePopover("credits")}
              aria-expanded={activePopover === "credits"}
            >
              <CreditIcon />
              <span>82 kredi</span>
            </button>

            {/* Notification button */}
            <button
              className={styles.iconNavBtn}
              onClick={() => togglePopover("notifications")}
              aria-label="Bildirimler"
              aria-expanded={activePopover === "notifications"}
            >
              <BellIcon />
              {unreadCount > 0 && <span className={styles.unreadDot} />}
            </button>

            {/* Help link */}
            <button
              className={styles.helpLink}
              onClick={() => togglePopover("help")}
              aria-label="Yardım"
              aria-expanded={activePopover === "help"}
            >
              Yardım
            </button>

            {/* User avatar */}
            <div className={styles.userProfilePill}>
              <span className={styles.topAvatar}>E</span>
              <span className={styles.userName}>Emre Y.</span>
            </div>

            {/* INTERACTIVE POPOVERS */}
            {activePopover === "generation" && (
              <div className={styles.popoverPanel}>
                <div className={styles.popoverHeader}>
                  <b>Aktif AI Üretimi</b>
                  <span className={styles.popoverStatusBadge}>%68</span>
                </div>
                <div className={styles.popoverBody}>
                  <h4 className={styles.popoverTitle}>Kişisel Finans</h4>
                  <p className={styles.popoverProgress}>2 / 3 ekran tamamlandı</p>
                  <p className={styles.popoverStepText}>“Bütçe Detayı hazırlanıyor…”</p>
                  <div className={styles.progressBarBg}>
                    <div className={styles.progressBarFill} style={{ width: "68%" }} />
                  </div>
                </div>
                <div className={styles.popoverActions}>
                  <a href="/app/projeler/prj_finance_01/studio" className={styles.popoverPrimaryBtn}>
                    Projeyi aç
                  </a>
                  <button className={styles.popoverSecondaryBtn}>Detayları gör</button>
                  <button className={styles.popoverCancelBtn}>Üretimi iptal et</button>
                </div>
              </div>
            )}

            {activePopover === "credits" && (
              <div className={styles.popoverPanel}>
                <div className={styles.popoverHeader}>
                  <b>Kredi & Paket Durumu</b>
                  <span className={styles.planBadge}>Pro Plan</span>
                </div>
                <div className={styles.popoverBody}>
                  <div className={styles.creditBigCount}>82 kredi kaldı</div>
                  <p className={styles.popoverProgress}>Bu ay 18 kredi kullanıldı</p>
                  <p className={styles.popoverProgress}>Ücretsiz plan</p>
                  <div className={styles.progressBarBg}>
                    <div className={styles.progressBarFill} style={{ width: "59%" }} />
                  </div>
                </div>
                <div className={styles.popoverFooter}>
                  <a href="/app/faturalandirma" className={styles.popoverLinkBtn}>
                    Kullanımı görüntüle →
                  </a>
                </div>
              </div>
            )}

            {activePopover === "notifications" && (
              <div className={styles.popoverPanel} style={{ width: "340px" }}>
                <div className={styles.popoverHeader}>
                  <b>Bildirimler</b>
                  {unreadCount > 0 && (
                    <button className={styles.markReadBtn} onClick={markAllRead}>
                      Tümünü okundu işaretle
                    </button>
                  )}
                </div>
                <div className={styles.notificationList}>
                  {["Bugün", "Dün", "Daha eski"].map((group) => {
                    const groupItems = notifications.filter((n) => n.group === group);
                    if (groupItems.length === 0) return null;
                    return (
                      <div key={group} className={styles.notificationGroup}>
                        <span className={styles.groupHeader}>{group}</span>
                        {groupItems.map((n) => (
                          <div
                            key={n.id}
                            className={`${styles.notificationItem} ${n.unread ? styles.itemUnread : ""}`}
                          >
                            <span className={styles.itemDot} />
                            <div className={styles.itemContent}>
                              <p>{n.text}</p>
                              <small>{n.time}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
                <div className={styles.popoverFooter}>
                  <a href="#" className={styles.popoverLinkBtn}>
                    Tüm bildirimleri gör →
                  </a>
                </div>
              </div>
            )}

            {activePopover === "help" && (
              <div className={styles.popoverPanel} role="menu" aria-label="Yardım menüsü">
                <div className={styles.popoverHeader}><b>Yardım</b></div>
                <div className={styles.helpMenuItems}>
                  <a href="#" role="menuitem">Yardım merkezi</a>
                  <a href="#" role="menuitem">Klavye kısayolları</a>
                  <a href="#" role="menuitem">Geri bildirim gönder</a>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* PAGE CONTENT */}
        {children}
      </main>
    </div>
  );
}
