import styles from "./StatusState.module.css";

export function LoadingState({ label = "Yükleniyor..." }: { label?: string }) {
  return (
    <div className={styles.state} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <strong>{label}</strong>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className={styles.state} role="status">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

export function ErrorState({ message = "Beklenmeyen bir hata oluştu." }: { message?: string }) {
  return (
    <div className={styles.state} role="alert">
      <strong>Bir şeyler ters gitti</strong>
      <p>{message}</p>
    </div>
  );
}
