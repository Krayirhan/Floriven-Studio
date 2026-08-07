import styles from "./SettingsPage.module.css";

export function MembersSettings() {
  return (
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
  );
}
