import { Hero } from "./components/Hero";
import { StatsBar } from "./components/StatsBar";
import { TrustBar } from "./components/TrustBar";
import { BeforeAfter } from "./components/BeforeAfter";
import { ScrollFeatures } from "./components/ScrollFeatures";
import { DesignSystem } from "./components/DesignSystem";
import { Gallery } from "./components/Gallery";
import { Testimonials } from "./components/Testimonials";
import { Pricing } from "./components/Pricing";
import { FAQ } from "./components/FAQ";
import { CtaBand } from "./components/CtaBand";

export function LandingPage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <TrustBar />
      <div className="wrap">
        <BeforeAfter />
        <ScrollFeatures />
        <DesignSystem />
      </div>
      <Gallery />
      <div className="wrap">
        <Testimonials />
      </div>
      <Pricing />
      <div className="wrap">
        <FAQ />
      </div>
      <CtaBand />
    </>
  );
}
