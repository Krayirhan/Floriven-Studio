import styles from "./SettingsPage.module.css";

export function GeneralSettings() {
  return (
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
  );
}
