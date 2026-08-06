import { useEffect, useRef, useState } from "react";
import styles from "./StatsBar.module.css";

const STATS = [
  {
    value: 18,
    suffix: " sn",
    label: "Ortalama üretim süresi",
    note: "brief → 4 ekran",
  },
  {
    value: 4,
    suffix: "+",
    label: "Ekran / brief çıktısı",
    note: "navigasyon dahil",
  },
  {
    value: 100,
    suffix: "%",
    label: "Token-driven tasarım",
    note: "tutarlı sistem",
  },
  {
    value: 12,
    suffix: "+",
    label: "Export hedefi",
    note: "Figma, RN, SwiftUI…",
  },
];

function StatItem({
  value,
  suffix,
  label,
  note,
  active,
}: (typeof STATS)[0] & { active: boolean }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!active) return;
    const steps = 50;
    const step = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, value);
      setVal(Math.round(current));
      if (current >= value) clearInterval(timer);
    }, 1200 / steps);
    return () => clearInterval(timer);
  }, [active, value]);

  return (
    <div className={styles.stat}>
      <div className={styles.number}>
        {val}
        <span className={styles.suffix}>{suffix}</span>
      </div>
      <div className={styles.label}>{label}</div>
      <div className={styles.note}>{note}</div>
    </div>
  );
}

export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setActive(true);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.bar} ref={ref}>
      <div className="wrap">
        <div className={styles.grid}>
          {STATS.map((s) => (
            <StatItem key={s.label} {...s} active={active} />
          ))}
        </div>
      </div>
    </div>
  );
}
