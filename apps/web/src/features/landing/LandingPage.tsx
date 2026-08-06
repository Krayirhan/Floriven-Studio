import { Hero } from "./components/Hero";
import { TrustBar } from "./components/TrustBar";
import { BeforeAfter } from "./components/BeforeAfter";
import { ScrollFeatures } from "./components/ScrollFeatures";
import { DesignSystem } from "./components/DesignSystem";
import { Pricing } from "./components/Pricing";
import { FAQ } from "./components/FAQ";
import { CtaBand } from "./components/CtaBand";

export function LandingPage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <div className="wrap">
        <BeforeAfter />
        <ScrollFeatures />
        <DesignSystem />
      </div>
      <Pricing />
      <div className="wrap">
        <FAQ />
      </div>
      <CtaBand />
    </>
  );
}
