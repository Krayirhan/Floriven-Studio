import dashboardStyles from "../DashboardPage.module.css";

export type WorkspaceSection = "shared" | "templates" | "assets" | "help" | "notifications";

const pageMeta: Record<WorkspaceSection, { kicker: string; title: string; description: string }> = {
  shared: { kicker: "PAYLAŞILANLAR", title: "Ekibinle paylaşılan çalışmalar", description: "Yorumlanan ve birlikte düzenlenen proje akışlarını Dashboard’daki proje görünümüyle takip et." },
  templates: { kicker: "ŞABLONLAR", title: "Başlangıç için hazır akışlar", description: "Dashboard’daki gerçek tasarım preview’ları üzerinden bir başlangıç seç ve prompt composer’a taşı." },
  assets: { kicker: "VARLIKLAR", title: "Marka varlıkların", description: "Studio’da kullanılan logo, görsel ve simge setlerini aynı varlık listesi üzerinden yönet." },
  help: { kicker: "YARDIM MERKEZİ", title: "Floriven Studio’yu daha iyi kullan", description: "Üretim ve editör akışıyla ilgili rehberlere ulaş." },
  notifications: { kicker: "BİLDİRİMLER", title: "Tüm bildirimler", description: "Üretim, yorum ve çalışma alanı güncellemelerini takip et." },
};

export function WorkspacePageHeader({ section }: { section: WorkspaceSection }) {
  const meta = pageMeta[section];

  return (
    <header className={dashboardStyles.hero}>
      <span className={dashboardStyles.subHeader}>{meta.kicker}</span>
      <h1>{meta.title}</h1>
      <p>{meta.description}</p>
    </header>
  );
}
