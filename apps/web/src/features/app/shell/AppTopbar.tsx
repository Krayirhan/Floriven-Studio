import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../AppShell.module.css";
import { BellIcon, CreditIcon, initialNotifications, SearchIcon, searchItems } from "./shell.data";
import type { NotificationItem } from "./shell.data";

type PopoverType = "generation" | "credits" | "notifications" | "help" | null;

export function AppTopbar() {
  const [activePopover, setActivePopover] = useState<PopoverType>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLElement>(null);
  const togglePopover = (type: PopoverType) => setActivePopover((prev) => prev === type ? null : type);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) setActivePopover(null);
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

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setSearchLoading(Boolean(value));
    window.setTimeout(() => setSearchLoading(false), 180);
  };
  const searchResults = searchItems.filter((item) => item.toLocaleLowerCase("tr-TR").includes(searchQuery.toLocaleLowerCase("tr-TR")));
  const unreadCount = notifications.filter((notification) => notification.unread).length;
  const markAllRead = () => setNotifications((previous) => previous.map((notification) => ({ ...notification, unread: false })));

  return (
    <header className={styles.topbar} ref={popoverRef}>
      <div className={styles.searchBox}><SearchIcon /><input ref={searchInputRef} type="text" value={searchQuery} onChange={(event) => handleSearch(event.target.value)} placeholder="Proje, ekran, varlık veya şablon ara…" aria-label="Global arama" /><kbd>⌘K</kbd>
        {searchQuery && <div className={styles.searchResults} role="status">{searchLoading ? <span>Aranıyor…</span> : searchResults.length > 0 ? searchResults.map((result) => <Link to="/app/projeler" key={result}>{result}</Link>) : <span>Sonuç bulunamadı.</span>}</div>}
      </div>
      <div className={styles.topbarCenter}><button className={styles.generationPill} onClick={() => togglePopover("generation")} aria-expanded={activePopover === "generation"}><span className={styles.livePulseDot} /><span>1 üretim devam ediyor</span></button></div>
      <div className={styles.topbarRight}>
        <button className={styles.creditPill} onClick={() => togglePopover("credits")} aria-expanded={activePopover === "credits"}><CreditIcon /><span>82 kredi</span></button>
        <button className={styles.iconNavBtn} onClick={() => togglePopover("notifications")} aria-label="Bildirimler" aria-expanded={activePopover === "notifications"}><BellIcon />{unreadCount > 0 && <span className={styles.unreadDot} />}</button>
        <button className={styles.helpLink} onClick={() => togglePopover("help")} aria-label="Yardım" aria-expanded={activePopover === "help"}>Yardım</button>
        <div className={styles.userProfilePill}><span className={styles.topAvatar}>E</span><span className={styles.userName}>Emre Y.</span></div>

        {activePopover === "generation" && <div className={styles.popoverPanel}><div className={styles.popoverHeader}><b>Aktif AI Üretimi</b><span className={styles.popoverStatusBadge}>%68</span></div><div className={styles.popoverBody}><h4 className={styles.popoverTitle}>Kişisel Finans</h4><p className={styles.popoverProgress}>2 / 3 ekran tamamlandı</p><p className={styles.popoverStepText}>“Bütçe Detayı hazırlanıyor…”</p><div className={styles.progressBarBg}><div className={styles.progressBarFill} style={{ width: "68%" }} /></div></div><div className={styles.popoverActions}><Link to="/app/projeler/prj_finance_01/studio" className={styles.popoverPrimaryBtn}>Projeyi aç</Link><Link to="/app/bildirimler" className={styles.popoverSecondaryBtn}>Detayları gör</Link><button className={styles.popoverCancelBtn} onClick={() => setActivePopover(null)}>Paneli kapat</button></div></div>}
        {activePopover === "credits" && <div className={styles.popoverPanel}><div className={styles.popoverHeader}><b>Kredi & Paket Durumu</b><span className={styles.planBadge}>Pro Plan</span></div><div className={styles.popoverBody}><div className={styles.creditBigCount}>82 kredi kaldı</div><p className={styles.popoverProgress}>Bu ay 18 kredi kullanıldı</p><p className={styles.popoverProgress}>Ücretsiz plan</p><div className={styles.progressBarBg}><div className={styles.progressBarFill} style={{ width: "59%" }} /></div></div><div className={styles.popoverFooter}><Link to="/app/faturalandirma" className={styles.popoverLinkBtn}>Kullanımı görüntüle →</Link></div></div>}
        {activePopover === "notifications" && <div className={styles.popoverPanel} style={{ width: "340px" }}><div className={styles.popoverHeader}><b>Bildirimler</b>{unreadCount > 0 && <button className={styles.markReadBtn} onClick={markAllRead}>Tümünü okundu işaretle</button>}</div><div className={styles.notificationList}>{["Bugün", "Dün", "Daha eski"].map((group) => { const groupItems = notifications.filter((notification) => notification.group === group); if (groupItems.length === 0) return null; return <div key={group} className={styles.notificationGroup}><span className={styles.groupHeader}>{group}</span>{groupItems.map((notification) => <div key={notification.id} className={`${styles.notificationItem} ${notification.unread ? styles.itemUnread : ""}`}><span className={styles.itemDot} /><div className={styles.itemContent}><p>{notification.text}</p><small>{notification.time}</small></div></div>)}</div>; })}</div><div className={styles.popoverFooter}><Link to="/app/bildirimler" className={styles.popoverLinkBtn}>Tüm bildirimleri gör →</Link></div></div>}
        {activePopover === "help" && <div className={styles.popoverPanel} role="menu" aria-label="Yardım menüsü"><div className={styles.popoverHeader}><b>Yardım</b></div><div className={styles.helpMenuItems}><Link to="/app/yardim" role="menuitem">Yardım merkezi</Link><Link to="/app/yardim" role="menuitem">Klavye kısayolları</Link><Link to="/app/yardim" role="menuitem">Geri bildirim gönder</Link></div></div>}
      </div>
    </header>
  );
}
