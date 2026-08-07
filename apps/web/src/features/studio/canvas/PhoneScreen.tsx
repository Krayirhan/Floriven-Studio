import type { DesignNode, Screen } from "@floriven/design-spec";
import styles from "../StudioPage.module.css";
import { propString } from "../studio.utils";

function Greeting({ node, selected, onSelect }: { node: DesignNode; selected: boolean; onSelect: () => void }) {
  return (
    <div className={styles.phGreeting}>
      <div>
        <div className={styles.phGreetingText}>Günaydın</div>
        <div
          className={`${styles.phGreetingName} ${selected ? styles.phSelected : ""}`}
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          role="button"
          tabIndex={0}
        >
          {propString(node, "name", "Emre")}
        </div>
      </div>
      <div className={styles.phAvatar} aria-hidden="true" />
    </div>
  );
}

function BalanceCard({ selected, onSelect }: { selected: boolean; onSelect: () => void }) {
  const bars = [30, 52, 38, 68, 90, 75, 82, 95, 60, 78, 55, 88];
  return (
    <div
      className={`${styles.phBalance} ${selected ? styles.phSelected : ""}`}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      role="button"
      tabIndex={0}
    >
      <span className={styles.phBalLabel}>Toplam bakiye</span>
      <span className={styles.phBalAmt}>₺24.850</span>
      <span className={styles.phBalChange}>↑ %3,2 bu ay</span>
      <div className={styles.phBalChart}>
        {bars.map((height, i) => <span key={i} style={{ height: `${height}%` }} />)}
      </div>
    </div>
  );
}

function QuickActions() {
  return (
    <div className={styles.phQuickRow}>
      {[{ label: "Gönder", icon: "↗" }, { label: "İste", icon: "↙" }, { label: "Kartlar", icon: "◈" }].map((a) => (
        <div className={styles.phQuick} key={a.label}>
          <span className={styles.phQuickIcon}>{a.icon}</span>
          {a.label}
        </div>
      ))}
    </div>
  );
}

type Tx = { name: string; category: string; amount: string; positive?: boolean; icon: string; color: string };
const TXS: Tx[] = [
  { name: "Spotify", category: "Abonelik · bugün", amount: "-₺54", icon: "S", color: "#e8f5e9" },
  { name: "Teknoloji Mağazası", category: "Alışveriş · dün", amount: "-₺2.199", icon: "T", color: "#fce4ec" },
  { name: "Market", category: "Gıda · dün", amount: "-₺312", icon: "M", color: "#fff8e1" },
  { name: "Netflix", category: "Abonelik · 2 gün", amount: "-₺89", icon: "N", color: "#e8f5e9" },
  { name: "Freelance ödeme", category: "Gelir · 3 gün", amount: "+₺3.200", positive: true, icon: "F", color: "#e8f5e9" },
  { name: "Restoran", category: "Yemek · 3 gün", amount: "-₺145", icon: "R", color: "#fff8e1" },
  { name: "Elektrik faturası", category: "Fatura · 4 gün", amount: "-₺280", icon: "E", color: "#f3e5f5" },
];

function TxRow({ tx }: { tx: Tx }) {
  return (
    <div className={styles.phTxRow}>
      <span className={styles.phTxIcon} style={{ background: tx.color, color: "#444" }}>{tx.icon}</span>
      <span className={styles.phTxInfo}>
        <span className={styles.phTxName}>{tx.name}</span>
        <span className={styles.phTxSub}>{tx.category}</span>
      </span>
      <span className={`${styles.phTxAmt} ${tx.positive ? styles.phTxAmtPos : ""}`}>{tx.amount}</span>
    </div>
  );
}

function TransactionList({ names, full = false, selected = false }: { names: string[]; full?: boolean; selected?: boolean }) {
  const list = names.map((n) => TXS.find((t) => t.name === n)).filter((t): t is Tx => Boolean(t));
  if (full) {
    const groups = [
      { label: "Bugün", items: list.slice(0, 2) },
      { label: "Dün", items: list.slice(2, 4) },
      { label: "Önceki günler", items: list.slice(4) },
    ];
    return (
      <div className={`${styles.phTxList} ${selected ? styles.phSelected : ""}`} onClick={(e) => e.stopPropagation()}>
        {groups.map((g) => (
          <div key={g.label}>
            <div className={styles.phDateGroup}>{g.label}</div>
            {g.items.map((tx) => <TxRow key={tx.name} tx={tx} />)}
          </div>
        ))}
        <div className={styles.phTxSummary}>Ağustos 2026 · Toplam ₺3.279 harcama</div>
      </div>
    );
  }
  return (
    <div className={`${styles.phTxList} ${selected ? styles.phSelected : ""}`} onClick={(e) => e.stopPropagation()}>
      {list.map((tx) => <TxRow key={tx.name} tx={tx} />)}
    </div>
  );
}

function BudgetDetail({ selected = false }: { selected?: boolean }) {
  const categories = [
    { name: "Yemek", spent: 890, total: 1200, pct: 74, color: "#ff5722" },
    { name: "Ulaşım", spent: 320, total: 500, pct: 64, color: "#62d6a8" },
    { name: "Eğlence", spent: 210, total: 300, pct: 70, color: "#f59e0b" },
    { name: "Alışveriş", spent: 1680, total: 1500, pct: 100, color: "#a78bfa" },
  ];
  const trendBars = [48, 62, 55, 71, 65, 79, 65];
  return (
    <>
      <div className={`${styles.phBudget} ${selected ? styles.phSelected : ""}`}>
        <div className={styles.phBudgetHeader}>
          <span className={styles.phBudgetLabel}>Bu ay harcama</span>
          <span className={styles.phBudgetLabel} style={{ color: "#62d6a8" }}>₺1.722 kaldı</span>
        </div>
        <span className={styles.phBudgetAmt}>₺3.278 / ₺5.000</span>
        <div className={styles.phBudgetTrack}>
          <div className={styles.phBudgetFill} style={{ width: "65%" }} />
        </div>
        <div className={styles.phBudgetMeta}>%65 kullanıldı · Günlük ortalama ₺106</div>

        {/* Trend mini-chart */}
        <div className={styles.phTrendRow}>
          <span className={styles.phTrendLabel}>7 günlük trend</span>
          <div className={styles.phTrendChart}>
            {trendBars.map((h, i) => (
              <div key={i} className={styles.phTrendBar} style={{ height: `${h}%`, opacity: i === 6 ? 1 : 0.5 + i * 0.07 }} />
            ))}
          </div>
        </div>

        <div className={styles.phBudgetStats}>
          <div className={styles.phBudgetStat}>
            <span className={styles.phBudgetStatLabel}>Geçen ay</span>
            <span className={styles.phBudgetStatVal}>₺4.102</span>
          </div>
          <div className={styles.phBudgetStat}>
            <span className={styles.phBudgetStatLabel}>Ay sonu tahmini</span>
            <span className={styles.phBudgetStatVal} style={{ color: "#f59e0b" }}>₺5.240</span>
          </div>
          <div className={styles.phBudgetStat}>
            <span className={styles.phBudgetStatLabel}>Kalan gün</span>
            <span className={styles.phBudgetStatVal}>24</span>
          </div>
        </div>
      </div>

      <div className={styles.phCatList}>
        {categories.map((cat) => (
          <div className={styles.phCatRow} key={cat.name}>
            <span className={styles.phCatDot} style={{ background: cat.color }} />
            <span className={styles.phCatName}>{cat.name}</span>
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: "#e8e8e8", overflow: "hidden", margin: "0 8px" }}>
              <div style={{ height: "100%", width: `${Math.min(cat.pct, 100)}%`, background: cat.color, borderRadius: 2 }} />
            </div>
            <span className={styles.phCatAmt} style={{ color: cat.pct >= 100 ? "#ef4444" : undefined }}>
              ₺{cat.spent}
              {cat.pct >= 100 && <span style={{ fontSize: 8, marginLeft: 2 }}>⚠</span>}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.phInsight}>
        <span>✦ AI öngörüsü:</span> Alışveriş bütçeni ₺180 aştın. Geçen aya göre %12 daha fazla harcadın. Günlük harcaman ₺20 azalırsa hedefine ulaşırsın.
      </div>
    </>
  );
}

function TxScreen({ selectedNodeId }: { selectedNodeId: string }) {
  const totalIncome = 3200;
  const totalExpense = 3279;
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: "var(--fv-phone-text)" }}>İşlemler</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#ff5722" }}>Filtre</span>
      </div>

      <div className={styles.phTxSummaryBar}>
        <div className={styles.phTxSumItem}>
          <span className={styles.phTxSumLabel}>Gelir</span>
          <span className={styles.phTxSumVal} style={{ color: "#62d6a8" }}>+₺{totalIncome.toLocaleString("tr")}</span>
        </div>
        <div className={styles.phTxSumDivider} />
        <div className={styles.phTxSumItem}>
          <span className={styles.phTxSumLabel}>Gider</span>
          <span className={styles.phTxSumVal} style={{ color: "#ef4444" }}>-₺{totalExpense.toLocaleString("tr")}</span>
        </div>
      </div>

      <div className={styles.phSearch}>⌕ İşlem ara...</div>
      <div className={styles.phSegmented}>
        <button className={`${styles.phSeg} ${styles.phSegActive}`}>Tümü</button>
        <button className={styles.phSeg}>Gelir</button>
        <button className={styles.phSeg}>Gider</button>
      </div>
      <TransactionList
        full
        selected={selectedNodeId === "n_tx_list"}
        names={["Spotify", "Teknoloji Mağazası", "Netflix", "Freelance ödeme", "Restoran", "Market", "Elektrik faturası"]}
      />
    </>
  );
}

function ScreenContent({ screen, selectedNodeId, onSelect }: { screen: Screen; selectedNodeId: string; onSelect: (id: string) => void }) {
  if (screen.id === "scr_home")
    return (
      <>
        <Greeting node={screen.root} selected={selectedNodeId === "n_greet"} onSelect={() => onSelect("n_greet")} />
        <BalanceCard selected={selectedNodeId === "n_balance"} onSelect={() => onSelect("n_balance")} />
        <div className={styles.phSectionTitle}>Hızlı işlemler</div>
        <QuickActions />
        <div className={styles.phSectionTitle}>Son işlemler</div>
        <TransactionList names={["Spotify", "Market", "Freelance ödeme"]} selected={selectedNodeId === "n_txs"} />
      </>
    );
  if (screen.id === "scr_tx")
    return <TxScreen selectedNodeId={selectedNodeId} />;
  return (
    <>
      <span style={{ fontSize: 20, fontWeight: 700, color: "var(--fv-phone-text)" }}>Ağustos bütçesi</span>
      <BudgetDetail selected={selectedNodeId === "n_bgt_card"} />
    </>
  );
}

function BottomNav({ screenId }: { screenId: string }) {
  return (
    <div className={styles.phBottomNav}>
      {[
        { label: "Ana sayfa", icon: "⌂", id: "scr_home" },
        { label: "İşlemler", icon: "↗", id: "scr_tx" },
        { label: "Bütçe", icon: "◈", id: "scr_bgt" },
        { label: "Profil", icon: "◎", id: "profile" },
      ].map((item) => (
        <div
          className={`${styles.phNavItem} ${item.id === screenId ? styles.phNavItemActive : ""}`}
          key={item.id}
        >
          <span className={styles.phNavIcon}>{item.icon}</span>
          {item.label}
        </div>
      ))}
    </div>
  );
}

export function PhoneScreen({ screen, selectedNodeId, active, onSelect }: { screen: Screen; selectedNodeId: string; active: boolean; onSelect: (id: string) => void }) {
  return (
    <div className={`${styles.phone} ${active ? styles.phoneActive : ""}`}>
      <div className={styles.phStatus}>
        <span>9:41</span>
        <span>●●● ◒</span>
      </div>
      <div className={styles.phBody}>
        <ScreenContent screen={screen} selectedNodeId={active ? selectedNodeId : ""} onSelect={onSelect} />
        <BottomNav screenId={screen.id} />
      </div>
    </div>
  );
}
