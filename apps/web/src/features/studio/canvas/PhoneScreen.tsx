import type { DesignNode, Screen } from "@floriven/design-spec";
import styles from "../StudioPage.module.css";
import { propNumber, propString } from "../studio.utils";

function Greeting({
  node,
  selected,
  onSelect,
}: {
  node: DesignNode;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div className={styles.phGreeting}>
      <div>
        <div className={styles.phGreetingText}>Günaydın</div>
        <div
          className={`${styles.phGreetingName} ${selected ? styles.phSelected : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
          role="button"
          tabIndex={0}
        >
          Emre
        </div>
      </div>
      <div className={styles.phAvatar} aria-hidden="true" />
    </div>
  );
}

function BalanceCard({
  selected,
  onSelect,
}: {
  selected: boolean;
  onSelect: () => void;
}) {
  const bars = [30, 52, 38, 68, 90, 75, 82, 95, 60, 78, 55, 88];
  return (
    <div
      className={`${styles.phBalance} ${selected ? styles.phSelected : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      role="button"
      tabIndex={0}
    >
      <span className={styles.phBalLabel}>Toplam bakiye</span>
      <span className={styles.phBalAmt}>₺24.850</span>
      <span className={styles.phBalChange}>↑ %3,2 bu ay</span>
      <div className={styles.phBalChart}>
        {bars.map((height, index) => (
          <span key={index} style={{ height: `${height}%` }} />
        ))}
      </div>
    </div>
  );
}

function QuickActions() {
  return (
    <div className={styles.phQuickRow}>
      {[
        { label: "Gönder", icon: "↗" },
        { label: "İste", icon: "↙" },
        { label: "Kartlar", icon: "◈" },
      ].map((action) => (
        <div className={styles.phQuick} key={action.label}>
          <span className={styles.phQuickIcon}>{action.icon}</span>
          {action.label}
        </div>
      ))}
    </div>
  );
}

type Transaction = {
  name: string;
  category: string;
  amount: string;
  positive?: boolean;
  icon: string;
  color: string;
};
const transactions: Transaction[] = [
  {
    name: "Spotify",
    category: "Abonelik · bugün",
    amount: "-₺54",
    icon: "S",
    color: "var(--color-success-subtle)",
  },
  {
    name: "Teknoloji Mağazası",
    category: "Alışveriş · dün",
    amount: "-₺2.199",
    icon: "T",
    color: "#fce4ec",
  },
  {
    name: "Market",
    category: "Gıda · dün",
    amount: "-₺312",
    icon: "M",
    color: "var(--color-warning-subtle)",
  },
  {
    name: "Netflix",
    category: "Abonelik · 2 gün",
    amount: "-₺89",
    icon: "N",
    color: "var(--color-success-subtle)",
  },
  {
    name: "Freelance ödeme",
    category: "Gelir · 3 gün",
    amount: "+₺3.200",
    positive: true,
    icon: "F",
    color: "var(--color-success-subtle)",
  },
  {
    name: "Restoran",
    category: "Yemek · 3 gün",
    amount: "-₺145",
    icon: "R",
    color: "var(--color-warning-subtle)",
  },
  {
    name: "Elektrik faturası",
    category: "Fatura · 4 gün",
    amount: "-₺280",
    icon: "E",
    color: "#f3e5f5",
  },
];

function TransactionList({
  names,
  full = false,
  selected = false,
}: {
  names: string[];
  full?: boolean;
  selected?: boolean;
}) {
  const list = names
    .map((name) =>
      transactions.find((transaction) => transaction.name === name),
    )
    .filter((item): item is Transaction => Boolean(item));
  const groups = full
    ? [list.slice(0, 2), list.slice(2, 4), list.slice(4)]
    : [list.slice(0, 4)];
  const labels = full ? ["Bugün", "Dün", "Önceki günler"] : [""];
  return (
    <div
      className={`${styles.phTxList} ${selected ? styles.phSelected : ""}`}
      onClick={(event) => event.stopPropagation()}
    >
      {groups.map((group, groupIndex) => (
        <div key={labels[groupIndex]}>
          {labels[groupIndex] && (
            <div className={styles.phDateGroup}>{labels[groupIndex]}</div>
          )}
          {group.map((transaction) => (
            <div className={styles.phTxRow} key={transaction.name}>
              <span
                className={styles.phTxIcon}
                style={{ background: transaction.color, color: "#555" }}
              >
                {transaction.icon}
              </span>
              <span className={styles.phTxInfo}>
                <span className={styles.phTxName}>{transaction.name}</span>
                <span className={styles.phTxSub}>{transaction.category}</span>
              </span>
              <span
                className={`${styles.phTxAmt} ${transaction.positive ? styles.phTxAmtPos : ""}`}
              >
                {transaction.amount}
              </span>
            </div>
          ))}
        </div>
      ))}
      {full && (
        <div className={styles.phTxSummary}>
          Ağustos 2026 · Toplam ₺3.279 harcama
        </div>
      )}
    </div>
  );
}

function BudgetDetail({ selected = false }: { selected?: boolean }) {
  const categories = [
    { name: "Yemek", spent: 890, total: 1200, pct: 74, color: "var(--color-primary)" },
    { name: "Ulaşım", spent: 320, total: 500, pct: 64, color: "var(--color-success)" },
    { name: "Eğlence", spent: 210, total: 300, pct: 70, color: "var(--color-warning)" },
    { name: "Alışveriş", spent: 1680, total: 1500, pct: 100, color: "var(--template-commerce)" },
  ];
  return (
    <>
      <div
        className={`${styles.phBudget} ${selected ? styles.phSelected : ""}`}
      >
        <div className={styles.phBudgetHeader}>
          <span className={styles.phBudgetLabel}>Bu ay harcama</span>
          <span className={styles.phBudgetLabel} style={{ color: "var(--color-success)" }}>
            ₺1.722 kaldı
          </span>
        </div>
        <span className={styles.phBudgetAmt}>₺3.278 / ₺5.000</span>
        <div className={styles.phBudgetTrack}>
          <div className={styles.phBudgetFill} style={{ width: "65%" }} />
        </div>
        <div className={styles.phBudgetMeta}>
          %65 kullanıldı · Günlük ortalama ₺106
        </div>
      </div>
      <div className={styles.phCatList}>
        {categories.map((category) => (
          <div className={styles.phCatRow} key={category.name}>
            <span
              className={styles.phCatDot}
              style={{ background: category.color }}
            />
            <span className={styles.phCatName}>{category.name}</span>
            <div
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: "var(--color-text)",
                overflow: "hidden",
                margin: "0 8px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${category.pct}%`,
                  background: category.color,
                  borderRadius: 2,
                }}
              />
            </div>
            <span className={styles.phCatAmt}>
              ₺{category.spent} / ₺{category.total}
            </span>
          </div>
        ))}
      </div>
      <div className={styles.phInsight}>
        <span>✦ AI öngörüsü:</span> Alışveriş bütçeni ₺180 aştın. Geçen aya göre
        %12 daha fazla harcadın.
      </div>
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

function ScreenContent({
  screen,
  selectedNodeId,
  onSelect,
}: {
  screen: Screen;
  selectedNodeId: string;
  onSelect: (id: string) => void;
}) {
  if (screen.id === "scr_home")
    return (
      <>
        <Greeting
          node={screen.root}
          selected={selectedNodeId === "n_greet"}
          onSelect={() => onSelect("n_greet")}
        />
        <BalanceCard
          selected={selectedNodeId === "n_balance"}
          onSelect={() => onSelect("n_balance")}
        />
        <div className={styles.phSectionTitle}>Hızlı işlemler</div>
        <QuickActions />
        <div className={styles.phSectionTitle}>Son işlemler</div>
        <TransactionList
          names={["Spotify", "Market", "Freelance ödeme"]}
          selected={selectedNodeId === "n_txs"}
        />
      </>
    );
  if (screen.id === "scr_tx")
    return (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--fv-phone-text)",
            }}
          >
            İşlemler
          </span>
          <span
            style={{ fontSize: 12, fontWeight: 600, color: "var(--fv-accent)" }}
          >
            Filtre
          </span>
        </div>
        <div className={styles.phSearch}>⌕ İşlem ara...</div>
        <div className={styles.phSegmented}>
          <button className={`${styles.phSeg} ${styles.phSegActive}`}>
            Tümü
          </button>
          <button className={styles.phSeg}>Gelir</button>
          <button className={styles.phSeg}>Gider</button>
        </div>
        <TransactionList
          full
          selected={selectedNodeId === "n_tx_list"}
          names={[
            "Spotify",
            "Teknoloji Mağazası",
            "Netflix",
            "Freelance ödeme",
            "Restoran",
            "Market",
            "Elektrik faturası",
          ]}
        />
      </>
    );
  return (
    <>
      <span
        style={{ fontSize: 20, fontWeight: 700, color: "var(--fv-phone-text)" }}
      >
        Ağustos bütçesi
      </span>
      <BudgetDetail selected={selectedNodeId === "n_bgt_card"} />
    </>
  );
}

export function PhoneScreen({
  screen,
  selectedNodeId,
  active,
  onSelect,
}: {
  screen: Screen;
  selectedNodeId: string;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <div className={`${styles.phone} ${active ? styles.phoneActive : ""}`}>
      <div className={styles.phStatus}>
        <span>9:41</span>
        <span>●●● ◒</span>
      </div>
      <div className={styles.phBody}>
        <ScreenContent
          screen={screen}
          selectedNodeId={active ? selectedNodeId : ""}
          onSelect={onSelect}
        />
        <BottomNav screenId={screen.id} />
      </div>
    </div>
  );
}
