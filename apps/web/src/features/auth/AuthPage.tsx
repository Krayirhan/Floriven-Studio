import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./AuthPage.module.css";

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const isSignup = mode === "signup";
  return (
    <main className={styles.page}>
      <div className={styles.visual}>
        <Link to="/" className={styles.logo}>
          <img src="/logo/logo-white.png" alt="Floriven" className={styles.logoImage} /><small>Studio</small>
        </Link>
        <div>
          <span className={styles.eyebrow}>FİKİRDEN ARAYÜZE</span>
          <h1>
            Ürün fikrini
            <br />
            <em>görünür kıl.</em>
          </h1>
          <p>
            Doğal dilde anlat. Floriven Studio ile düzenlenebilir mobil
            ekranlara dönüştür.
          </p>
        </div>
        <span className={styles.visualFoot}>
          Floriven Studio · AI destekli ürün tasarımı
        </span>
      </div>
      <section className={styles.formSide}>
        <div className={styles.formWrap}>
          <Link to="/" className={styles.mobileLogo}>
            <img src="/logo/logo-color.png" alt="Floriven" className={styles.logoImage} /><small>Studio</small>
          </Link>
          <span className={styles.kicker}>
            {isSignup ? "BAŞLANGIÇ" : "TEKRAR HOŞ GELDİN"}
          </span>
          <h2>
            {isSignup ? "İlk akışını oluşturalım." : "Studio’ya giriş yap."}
          </h2>
          <p className={styles.lead}>
            {isSignup
              ? "Ürün fikrinden ilk ekranlarına birkaç adım var."
              : "Projelerine kaldığın yerden devam et."}
          </p>
          <button className={styles.oidc}>◉ Google ile devam et</button>
          <div className={styles.or}>
            <span>veya e-posta ile</span>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              navigate(isSignup ? "/onboarding" : "/app");
            }}
          >
            <label>
              E-posta
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="sen@ornek.com"
                required
              />
            </label>
            <label>
              Şifre
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="En az 8 karakter"
                required
                minLength={8}
              />
            </label>
            {isSignup && (
              <label className={styles.check}>
                <input type="checkbox" required /> Kullanım koşullarını ve
                gizlilik politikasını kabul ediyorum.
              </label>
            )}
            <button className={styles.submit}>
              {isSignup ? "Ücretsiz hesap oluştur" : "Giriş yap"} <span>→</span>
            </button>
          </form>
          <div className={styles.switch}>
            {isSignup ? "Zaten hesabın var mı?" : "Henüz hesabın yok mu?"}{" "}
            <Link to={isSignup ? "/giris" : "/kayit"}>
              {isSignup ? "Giriş yap" : "Hesap oluştur"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
