import styles from "../DashboardPage.module.css";
import { quickStarts } from "../dashboard.data";
import type { DashboardComposerState } from "./useDashboardComposer";
import { RedesignWorkflow } from "./RedesignWorkflow";
import type { RedesignWorkflowState } from "./useRedesignWorkflow";

type Props = {
  composer: DashboardComposerState;
  redesign: RedesignWorkflowState;
};

export function DashboardComposer({ composer, redesign }: Props) {
  const { creationMode } = composer;
  return (
    <section className={styles.composerConsole} aria-labelledby="composer-title">
      <h2 id="composer-title" className={styles.srOnly}>Floriven tasarım oluşturucu</h2>
      <div className={styles.modeBar}>
        {(["mobile", "web", "redesign"] as const).map((mode) => (
          <button key={mode} className={creationMode === mode ? styles.modeActive : ""} onClick={() => composer.setCreationMode(mode)} aria-pressed={creationMode === mode}>
            <span>{mode === "mobile" ? "📱" : mode === "web" ? "🌐" : "⚡"}</span>{mode === "mobile" ? " Mobil Uygulama" : mode === "web" ? " Web UI & Dashboard" : " Ekranı Yeniden Tasarla"}
          </button>
        ))}
      </div>

      {creationMode === "redesign" ? <RedesignWorkflow workflow={redesign} /> : (
        <>
          <div className={styles.consoleBody}>
            <textarea id="design-prompt" value={composer.prompt} onChange={(e) => composer.handlePromptChange(e.target.value, e.currentTarget)} placeholder={creationMode === "mobile" ? "Nasıl bir mobil uygulama tasarlamak istiyorsun?" : "Nasıl bir web arayüzü veya dashboard tasarlamak istiyorsun?"} rows={3} />
            <div className={styles.quickStartSection}>
              <span className={styles.quickStartLabel}>Hızlı başlangıçlar</span>
              <div className={styles.chipScrollRow}>
                {quickStarts.map((chip) => (
                  <button key={chip.label} className={`${styles.quickChip} ${composer.selectedQuickStart === chip.prompt ? styles.quickChipSelected : ""}`} onClick={() => composer.handleSelectQuickStart(chip.prompt)} title={chip.prompt} aria-label={`${chip.label}: öneri promptunu düzenleyiciye yerleştir`}>✦ {chip.label}</button>
                ))}
              </div>
            </div>
          </div>

          {composer.showAdvanced && (
            <div id="advanced-options" className={styles.advancedOptionsAccordion} hidden={!composer.showAdvanced} aria-hidden={!composer.showAdvanced}>
              {creationMode === "mobile" ? (
                <div className={styles.advancedGrid}>
                  <AdvancedGroup label="PLATFORM" values={["iOS", "Android", "Her ikisi"]} selected={composer.selectedPlatform} onSelect={composer.setSelectedPlatform} />
                  <AdvancedGroup label="EKRAN KAPSAMI" values={["Tek ekran", "Temel akış", "Tam akış"]} selected={composer.screenScope} onSelect={composer.setScreenScope} />
                  <AdvancedGroup label="TASARIM YÖNÜ" values={["Otomatik", "Editorial Minimal", "Soft Futurism", "Warm Organic", "Professional", "Experimental"]} selected={composer.advancedDirection} onSelect={composer.setAdvancedDirection} />
                  <AdvancedGroup label="VARYASYON VE KALİTE" values={["1 Varyasyon", "2 Varyasyon", "3 Varyasyon", "Hızlı", "Standart", "Yüksek"]} selected={`${composer.advancedVariations} Varyasyon`} onSelect={(value) => value.endsWith(" Varyasyon") ? composer.setAdvancedVariations(Number(value[0])) : composer.setQualityMode(value)} />
                </div>
              ) : (
                <div className={styles.advancedGrid}>
                  <AdvancedGroup label="LAYOUT TİPİ" values={["Landing page", "Dashboard", "SaaS application", "E-commerce", "Admin panel"]} selected={composer.webLayoutType} onSelect={composer.setWebLayoutType} />
                  <AdvancedGroup label="RESPONSIVE HEDEF" values={["Desktop", "Desktop + tablet", "Full responsive"]} selected={composer.webResponsiveTarget} onSelect={composer.setWebResponsiveTarget} />
                  <AdvancedGroup label="SAYFA KAPSAMI" values={["Tek sayfa", "Temel sayfalar", "Tam ürün akışı"]} selected={composer.webPageScope} onSelect={composer.setWebPageScope} />
                </div>
              )}
            </div>
          )}

          <footer className={styles.consoleFooter}>
            <div className={styles.optionPills}>
              <button className={`${styles.pillBtn} ${composer.showAdvanced ? styles.pillBtnActive : ""}`} onClick={() => composer.setShowAdvanced(!composer.showAdvanced)} aria-expanded={composer.showAdvanced} aria-controls="advanced-options">
                <span>Gelişmiş seçenekler</span>{composer.advancedSummary && <small className={styles.advancedSummary}>{composer.advancedSummary}</small>}<span aria-hidden="true">{composer.showAdvanced ? "▴" : "▾"}</span>
              </button>
            </div>
            <div className={styles.actionButtons}>
              <input ref={composer.referenceInputRef} className={styles.fileInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => composer.selectReference(event.target.files?.[0])} />
              <button className={`${styles.refBtn} ${composer.referenceName ? styles.refBtnAttached : ""}`} onClick={() => composer.referenceInputRef.current?.click()} title="Görsel veya stil referansı ekle"><span>+</span> Referans</button>
              {composer.referenceName && <span className={styles.referenceStatus}>{composer.referenceName}</span>}
              <button className={styles.generateBtn} onClick={composer.startGeneration} disabled={composer.generating || !composer.prompt.trim()}>
                {composer.generating ? <><span className={styles.spinner} /> Tasarlanıyor…</> : <>Floriven ile Üret ✦</>}
              </button>
              {composer.generationError && <span className={styles.generationError} role="alert">{composer.generationError}</span>}
            </div>
          </footer>
        </>
      )}
    </section>
  );
}

function AdvancedGroup({ label, values, selected, onSelect }: { label: string; values: string[]; selected: string; onSelect: (value: string) => void }) {
  return <div className={styles.advancedGroup}><label className={styles.advancedLabel}>{label}</label><div className={styles.advancedPillRow}>{values.map((value) => <button key={value} className={`${styles.advPill} ${selected === value ? styles.advPillActive : ""}`} onClick={() => onSelect(value)}>{value}</button>)}</div></div>;
}
