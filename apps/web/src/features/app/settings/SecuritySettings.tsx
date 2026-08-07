import { useState } from "react";
import styles from "./SettingsPage.module.css";

export function SecuritySettings() {
  const [copiedKey, setCopiedKey] = useState(false);

  return (
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
  );
}
