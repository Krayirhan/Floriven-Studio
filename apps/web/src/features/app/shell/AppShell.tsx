import { useState } from "react";
import { Outlet } from "react-router-dom";
import styles from "../AppShell.module.css";
import { AppSidebar } from "./AppSidebar";
import { AppTopbar } from "./AppTopbar";

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.shell}>
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((previous) => !previous)} />
      <main className={`${styles.main} ${collapsed ? styles.mainExpanded : ""}`}>
        <AppTopbar />
        <Outlet />
      </main>
    </div>
  );
}
