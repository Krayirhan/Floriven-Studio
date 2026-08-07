import { useState } from "react";
import dashboardStyles from "./DashboardPage.module.css";
import styles from "./settings/SettingsPage.module.css";
import { GeneralSettings } from "./settings/GeneralSettings";
import { MembersSettings } from "./settings/MembersSettings";
import { NotificationSettings } from "./settings/NotificationSettings";
import { SecuritySettings } from "./settings/SecuritySettings";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "members" | "notifications" | "security">("general");

  return (
    <div className={dashboardStyles.page}>
        <header className={dashboardStyles.hero}>
          <span className={dashboardStyles.subHeader}>AYARLAR & WORKSPACE</span>
          <h1>Çalışma alanı ayarları</h1>
          <p>Profilini, ekibini, API erişimlerini ve çalışma tercihlerini yönet.</p>
        </header>

        <div className={dashboardStyles.sectionHeader}>
          <div><span className={dashboardStyles.subHeader}>WORKSPACE KONTROLÜ</span><h2>Tercihler ve erişim</h2></div>
          <span className={dashboardStyles.headerTag}>Floriven Studio</span>
        </div>

        <div className={styles.settingsGrid}>
          {/* TAB NAVIGATION */}
          <section className={styles.settingsNav}>
            <button
              className={activeTab === "general" ? styles.settingsActive : ""}
              onClick={() => setActiveTab("general")}
            >
              ⚙️ Genel
            </button>
            <button
              className={activeTab === "members" ? styles.settingsActive : ""}
              onClick={() => setActiveTab("members")}
            >
              👥 Üyeler ve Roller
            </button>
            <button
              className={activeTab === "notifications" ? styles.settingsActive : ""}
              onClick={() => setActiveTab("notifications")}
            >
              🔔 Bildirimler
            </button>
            <button
              className={activeTab === "security" ? styles.settingsActive : ""}
              onClick={() => setActiveTab("security")}
            >
              🔑 Güvenlik & API Keys
            </button>
          </section>

           {/* TAB CONTENTS */}
           <section className={styles.settingsCard}>
             {activeTab === "general" && <GeneralSettings />}
             {activeTab === "members" && <MembersSettings />}
             {activeTab === "notifications" && <NotificationSettings />}
             {activeTab === "security" && <SecuritySettings />}
           </section>
        </div>
    </div>
  );
}
