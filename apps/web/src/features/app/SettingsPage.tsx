import { useState } from "react";
import { AppShell } from "./AppShell";
import styles from "./ProductPages.module.css";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "members" | "notifications" | "security">("general");
  const [copiedKey, setCopiedKey] = useState(false);

  return (
    <AppShell>
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <span className={styles.kicker}>AYARLAR & WORKSPACE</span>
            <h1>Çalışma Alanı Ayarları</h1>
            <p>Profilini, ekibini, API erişimlerini ve çalışma tercihlerini yönet.</p>
          </div>
        </header>

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
            {activeTab === "general" && (
              <>
                <h2>Genel Bilgiler</h2>
                <p>Floriven Studio workspace’inin temel tanımları.</p>
                <label>
                  Workspace Adı
                  <input defaultValue="Floriven Design Studio" />
                </label>
                <label>
                  Varsayılan Tasarım Dili
                  <select defaultValue="Türkçe">
                    <option>Türkçe</option>
                    <option>English (US)</option>
                  </select>
                </label>
                <label>
                  Varsayılan Hedef Platform
                  <select defaultValue="iOS">
                    <option>Apple iOS</option>
                    <option>Android Material 3</option>
                    <option>Responsive Web UI</option>
                  </select>
                </label>
                <button className={styles.primaryBtn}>Değişiklikleri Kaydet</button>
              </>
            )}

            {activeTab === "members" && (
              <>
                <div className={styles.cardHeaderRow}>
                  <div>
                    <h2>Ekip Üyeleri (3/5)</h2>
                    <p>Workspace'e erişimi olan ekip arkadaşların.</p>
                  </div>
                  <button className={styles.secondaryBtn}>+ Üye Davet Et</button>
                </div>

                <div className={styles.membersTable}>
                  {[
                    { name: "Emre Y.", email: "emre@floriven.studio", role: "Workspace Owner", avatar: "EY" },
                    { name: "Ayşe K.", email: "ayse@floriven.studio", role: "UI Designer", avatar: "AK" },
                    { name: "Caner T.", email: "caner@floriven.studio", role: "Developer", avatar: "CT" },
                  ].map((member) => (
                    <div className={styles.memberRow} key={member.email}>
                      <div className={styles.memberAvatar}>{member.avatar}</div>
                      <div className={styles.memberInfo}>
                        <b>{member.name}</b>
                        <small>{member.email}</small>
                      </div>
                      <span className={styles.roleBadge}>{member.role}</span>
                      <button className={styles.iconBtn}>•••</button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === "notifications" && (
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
            )}

            {activeTab === "security" && (
              <>
                <h2>API Keys & Entegrasyonlar</h2>
                <p>Floriven AI Engine ve Figma entegrasyonu için gizli API anahtarları.</p>
                
                <div className={styles.apiKeyBox}>
                  <label>Aktif Studio API Key</label>
                  <div className={styles.keyInputRow}>
                    <input type="password" value="fl_live_998a4b7182c129e884b" readOnly />
                    <button
                      className={styles.copyBtn}
                      onClick={() => {
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2000);
                      }}
                    >
                      {copiedKey ? "Kopyalandı ✓" : "Kopyala"}
                    </button>
                  </div>
                </div>
                <button className={styles.dangerBtn}>Yeni API Key Üret</button>
              </>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}

