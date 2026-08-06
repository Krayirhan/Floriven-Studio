import type { DesignSpec } from "@floriven/design-spec";

export const INITIAL_STUDIO_DOCUMENT: DesignSpec = {
  schemaVersion: "1.0.0",
  projectId: "prj_finance_01",
  platform: "ios",
  locale: "tr-TR",
  deviceProfile: "phone-default",
  tokens: {
    "color.primary": "var(--color-primary)",
    "color.success": "var(--color-success)",
    "color.warning": "var(--color-warning)",
    "color.surface": "var(--color-surface-raised)",
    "color.card": "#FFFFFF",
    "color.text": "var(--color-text)",
    "color.sub": "#787590",
  },
  assets: [],
  components: {},
  screens: [
    {
      id: "scr_home",
      name: "Ana Sayfa",
      route: "/home",
      root: {
        id: "r_home",
        type: "Screen",
        props: {},
        layout: { mode: "column", gap: "space.4" },
        children: [
          {
            id: "n_greet",
            type: "Greeting",
            props: { text: "Günaydın, Emre" },
            a11y: { role: "heading", label: "Günaydın, Emre" },
          },
          {
            id: "n_balance",
            type: "BalanceCard",
            props: {
              label: "Toplam bakiye",
              amount: "₺24.850",
              change: "+%3,2 bu ay",
            },
            a11y: { role: "region", label: "Toplam bakiye ₺24.850" },
          },
          {
            id: "n_qtitle",
            type: "SectionTitle",
            props: { text: "Hızlı işlemler" },
            a11y: { role: "heading", label: "Hızlı işlemler" },
          },
          {
            id: "n_quick",
            type: "QuickActions",
            props: { actions: ["Gönder", "İste", "Kartlar"] },
            a11y: { role: "navigation", label: "Hızlı işlemler" },
          },
          {
            id: "n_stitle",
            type: "SectionTitle",
            props: { text: "Son işlemler" },
            a11y: { role: "heading", label: "Son işlemler" },
          },
          {
            id: "n_txs",
            type: "TransactionList",
            props: { items: ["Spotify", "Market", "Freelance"] },
            a11y: { role: "list", label: "Son işlemler" },
          },
        ],
      },
    },
    {
      id: "scr_tx",
      name: "İşlemler",
      route: "/transactions",
      root: {
        id: "r_tx",
        type: "Screen",
        props: {},
        layout: { mode: "column", gap: "space.4" },
        children: [
          {
            id: "n_tx_title",
            type: "PageTitle",
            props: { text: "İşlemler" },
            a11y: { role: "heading", label: "İşlemler" },
          },
          {
            id: "n_tx_search",
            type: "SearchBar",
            props: { placeholder: "İşlem ara..." },
            a11y: { role: "search", label: "İşlem ara" },
          },
          {
            id: "n_tx_filter",
            type: "SegmentedControl",
            props: { options: ["Tümü", "Gelir", "Gider"] },
            a11y: { role: "tablist", label: "İşlem filtresi" },
          },
          {
            id: "n_tx_list",
            type: "TransactionList",
            props: {
              items: [
                "Spotify",
                "Teknoloji Mağazası",
                "Netflix",
                "Freelance ödeme",
                "Restoran",
                "Market",
                "Elektrik faturası",
              ],
            },
            a11y: { role: "list", label: "Tüm işlemler" },
          },
        ],
      },
    },
    {
      id: "scr_bgt",
      name: "Bütçe Detayı",
      route: "/budget",
      root: {
        id: "r_bgt",
        type: "Screen",
        props: {},
        layout: { mode: "column", gap: "space.4" },
        children: [
          {
            id: "n_bgt_title",
            type: "PageTitle",
            props: { text: "Ağustos bütçesi" },
            a11y: { role: "heading", label: "Ağustos bütçesi" },
          },
          {
            id: "n_bgt_card",
            type: "BudgetCard",
            props: {
              label: "Bu ay harcama",
              amount: "₺3.278",
              total: "₺5.000",
              progress: 65,
              remaining: "₺1.722",
              dailyAvg: "₺106",
            },
            a11y: { role: "region", label: "Bütçe özeti" },
          },
          {
            id: "n_bgt_cats",
            type: "BudgetCategories",
            props: {
              categories: [
                { name: "Yemek", spent: 890, total: 1200, color: "var(--color-primary)" },
                { name: "Ulaşım", spent: 320, total: 500, color: "var(--color-success)" },
                { name: "Eğlence", spent: 210, total: 300, color: "var(--color-warning)" },
                {
                  name: "Alışveriş",
                  spent: 1680,
                  total: 1500,
                  color: "var(--template-commerce)",
                },
              ],
            },
            a11y: { role: "list", label: "Kategori bazlı harcama" },
          },
          {
            id: "n_bgt_insight",
            type: "AIInsight",
            props: {
              text: "Alışveriş bütçeni ₺180 aştın. Geçen aya göre %12 daha fazla harcadın. Bazı abonelikleri gözden geçirmen faydalı olabilir.",
            },
            a11y: { role: "note", label: "Harcama öngörüsü" },
          },
        ],
      },
    },
  ],
  flows: [
    { from: "scr_home", to: "scr_tx", trigger: "tap" },
    { from: "scr_home", to: "scr_bgt", trigger: "tap" },
  ],
  metadata: { revision: 14 },
};
