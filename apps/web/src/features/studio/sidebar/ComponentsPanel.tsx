import styles from "../StudioPage.module.css";

const groups = [
  { label: "Temel", items: ["Button", "Input", "Text", "Image", "Container"] },
  { label: "Navigasyon", items: ["BottomNav", "TabBar", "SearchBar"] },
  {
    label: "Veri",
    items: ["Card", "BalanceCard", "BudgetCard", "Chart", "Avatar"],
  },
  { label: "Form", items: ["TextField", "Dropdown", "DatePicker", "Toggle"] },
];

export function ComponentsPanel() {
  return (
    <>
      <input className={styles.cpSearch} placeholder="Bileşen ara..." />
      {groups.map((group) => (
        <div key={group.label}>
          <div className={styles.cpGroup}>{group.label}</div>
          {group.items.map((item) => (
            <div className={styles.cpItem} key={item}>
              <span className={styles.cpIcon}>◌</span>
              {item}
            </div>
          ))}
        </div>
      ))}
      <div className={styles.scActions}>
        <button className={`${styles.sBtn} ${styles.sBtnAccent}`}>
          ✦ AI ile bileşen üret
        </button>
      </div>
    </>
  );
}
