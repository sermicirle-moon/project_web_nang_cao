import HeroSection from "./HeroSection";
import Features from "./Features";
import Benefits from "./Benefit";
import StickyCTA from "./StickyCTA";

export default function LandingPage() {
  return (
    <div className="space-y-20">
      <HeroSection />
      <Features />
      <Benefits />
      <StickyCTA />
    </div>
  );
}