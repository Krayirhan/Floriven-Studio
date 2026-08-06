import styles from "../StudioPage.module.css";

export function FlowConnections({ screenCount }: { screenCount: number }) {
  if (screenCount < 2) return null;
  const phoneWidth = 280;
  const gap = 60;
  return (
    <svg
      className={styles.flowLayer}
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,87,34,0.05)" />
          <stop offset="50%" stopColor="rgba(255,87,34,0.25)" />
          <stop offset="100%" stopColor="rgba(98,214,168,0.08)" />
        </linearGradient>
      </defs>
      {Array.from({ length: screenCount - 1 }, (_, index) => {
        const x1 = (phoneWidth + gap) * index + phoneWidth + 16;
        const x2 = (phoneWidth + gap) * (index + 1) - 16;
        return (
          <g key={index}>
            <line
              x1={x1}
              y1={180}
              x2={x2}
              y2={180}
              stroke="url(#flowGrad)"
              strokeWidth="1"
              strokeDasharray="8 5"
              opacity="0.7"
            />
            <circle cx={x1} cy={180} r="3" fill="rgba(255,87,34,0.35)" />
            <circle cx={x2} cy={180} r="3" fill="rgba(98,214,168,0.25)" />
          </g>
        );
      })}
    </svg>
  );
}
