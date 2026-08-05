import { Hero } from './components/Hero';
import { Ticker } from './components/Ticker';
import { HowItWorks } from './components/HowItWorks';
import { Features } from './components/Features';
import { CtaBand } from './components/CtaBand';

export function LandingPage() {
  return (
    <>
      <div className="wrap">
        <Hero />
      </div>
      <Ticker />
      <div className="wrap">
        <HowItWorks />
        <Features />
        <CtaBand />
      </div>
    </>
  );
}
