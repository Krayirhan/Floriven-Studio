import styles from "../StudioPage.module.css";

const FLOW_CONNECTIONS = [
  { from: 0, to: 1, label: "İşlemler" },
  { from: 0, to: 2, label: "Bütçe" },
];

export function FlowConnections({ screenCount }: { screenCount: number }) {
  if (screenCount < 2) return null;
  const phoneWidth = 280;
  const gap = 60;
  const totalWidth = screenCount * phoneWidth + (screenCount - 1) * gap;
  const centerY = 220;

  return (
    <svg className={styles.flowLayer} viewBox={`0 0 ${totalWidth + 200} 600`} preserveAspectRatio="xMidYMid meet" aria-label="Akış bağlantıları">
      <defs>
        <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,87,34,0.4)" />
          <stop offset="100%" stopColor="rgba(98,214,168,0.3)" />
        </linearGradient>
        <marker id="arrowOrange" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="rgba(255,87,34,0.6)" />
        </marker>
        <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="rgba(98,214,168,0.5)" />
        </marker>
      </defs>

      {FLOW_CONNECTIONS.filter((c) => c.to < screenCount).map((conn, i) => {
        const x1 = (phoneWidth + gap) * conn.from + phoneWidth;
        const x2 = (phoneWidth + gap) * conn.to;
        const y = centerY + i * 40;
        const mx = (x1 + x2) / 2;

        return (
          <g key={i}>
            {/* Hotspot on source screen */}
            <circle cx={x1 - 2} cy={y} r={5} fill="rgba(255,87,34,0.25)" stroke="rgba(255,87,34,0.6)" strokeWidth={1.5} />
            <circle cx={x1 - 2} cy={y} r={2.5} fill="rgba(255,87,34,0.7)" />

            {/* Connection line with curve */}
            <path
              d={`M${x1 + 3},${y} C${mx},${y} ${mx},${y} ${x2 - 3},${y}`}
              fill="none"
              stroke={i === 0 ? "rgba(255,87,34,0.5)" : "rgba(98,214,168,0.4)"}
              strokeWidth={1.5}
              strokeDasharray="6 4"
              markerEnd={i === 0 ? "url(#arrowOrange)" : "url(#arrowGreen)"}
            />

            {/* Label */}
            <rect x={mx - 24} y={y - 11} width={48} height={16} rx={4} fill="var(--color-canvas, #0f0f1a)" stroke={i === 0 ? "rgba(255,87,34,0.3)" : "rgba(98,214,168,0.3)"} strokeWidth={1} />
            <text x={mx} y={y + 1} textAnchor="middle" fill={i === 0 ? "rgba(255,87,34,0.9)" : "rgba(98,214,168,0.8)"} fontSize={9} fontWeight={600} fontFamily="Inter, sans-serif">
              {conn.label}
            </text>

            {/* Destination hotspot */}
            <circle cx={x2 + 2} cy={y} r={5} fill={i === 0 ? "rgba(255,87,34,0.1)" : "rgba(98,214,168,0.1)"} stroke={i === 0 ? "rgba(255,87,34,0.4)" : "rgba(98,214,168,0.35)"} strokeWidth={1.5} />
          </g>
        );
      })}
    </svg>
  );
}
