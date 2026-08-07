import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./OnboardingPage.module.css";

export function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [workspace, setWorkspace] = useState("");
  const [goal, setGoal] = useState("");
  return (
    <main className={styles.page}>
      <header className={styles.topBar}>
        <Link to="/" className={styles.logo}>
          <img src="/logo/logo-white.png" alt="Floriven" className={styles.logoImage} /><small>Studio</small>
        </Link>
        <span>Adım {step} / 3</span>
      </header>
      <div className={styles.progress}>
        <i style={{ width: `${(step / 3) * 100}%` }} />
      </div>
      <section className={styles.content}>
        {step === 1 && (
          <>
            <span className={styles.kicker}>ÇALIŞMA ALANIN</span>
            <h1>İlk workspace’ini oluştur.</h1>
            <p>Projelerini, tasarım sistemlerini ve ekibini tek yerde yönet.</p>
            <label>
              Workspace adı
              <input
                value={workspace}
                onChange={(event) => setWorkspace(event.target.value)}
                placeholder="Örn. Acme Design"
              />
            </label>
            <button className={styles.primary} onClick={() => setStep(2)}>
              Devam et →
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <span className={styles.kicker}>SENİ TANIYALIM</span>
            <h1>Floriven’i ne için kullanacaksın?</h1>
            <p>Başlangıç deneyimini ihtiyaçlarına göre hazırlayalım.</p>
            <div className={styles.options}>
              {[
                "Hızlı prototip oluşturmak",
                "Ürün gereksinimlerini görselleştirmek",
                "Tasarım varyasyonları üretmek",
                "Figma ve geliştirici çıktısı almak",
              ].map((option) => (
                <button
                  className={goal === option ? styles.optionActive : ""}
                  onClick={() => setGoal(option)}
                  key={option}
                >
                  {goal === option ? "✓" : "○"} {option}
                </button>
              ))}
            </div>
            <div className={styles.actions}>
              <button onClick={() => setStep(1)}>← Geri</button>
              <button
                className={styles.primary}
                disabled={!goal}
                onClick={() => setStep(3)}
              >
                Devam et →
              </button>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <span className={styles.kicker}>HAZIRSIN</span>
            <h1>İlk fikrini arayüze dönüştür.</h1>
            <p>
              Workspace’in hazır. Şimdi bir brief ile başlayabilir veya örnek
              projeyi inceleyebilirsin.
            </p>
            <div className={styles.startCards}>
              <Link to="/app?focus=prompt">
                <b>✦</b>
                <strong>Brief yaz</strong>
                <small>Ürün fikrini anlat ve ilk ekranlarını üret.</small>
              </Link>
              <Link to="/app">
                <b>▦</b>
                <strong>Dashboard’a git</strong>
                <small>Projelerini ve örnek akışları incele.</small>
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
