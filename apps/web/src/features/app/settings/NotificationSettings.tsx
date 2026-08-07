import styles from "./SettingsPage.module.css";

export function NotificationSettings() {
  return (
    <>
      <h2>Bildirim Tercihleri</h2>
      <p>AI üretimi ve proje güncellemeleri bildirimlerini yönet.</p>
      <div className={styles.toggleList}>
        <label className={styles.toggleRow}>
          <div>
            <b>AI Üretimi Tamamlandı Bildirimi</b>
            <small>Üretim bittiğinde e-posta ve studio içi anlık bildirim al.</small>
          </div>
          <input type="checkbox" defaultChecked />
        </label>
        <label className={styles.toggleRow}>
          <div>
            <b>Haftalık Kredi & Kullanım Raporu</b>
            <small>Haftalık harcanan AI kredilerini ve üretilen ekran özetini al.</small>
          </div>
          <input type="checkbox" defaultChecked />
        </label>
      </div>
    </>
  );
}
