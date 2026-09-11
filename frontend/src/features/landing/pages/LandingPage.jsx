// LandingPage.jsx
// Public corporate landing page for PRIMEPOWER MANPOWER.
// Rendered as a standalone, unauthenticated public route at '/'.
// Uses the html:has(.landing-page) pattern (same as PublicApplyPage) to
// override the global overflow:hidden on <body> and enable page scrolling.

import LandingNavbar from '../components/LandingNavbar';
import HeroSection from '../components/HeroSection';
import ServicesSection from '../components/ServicesSection';
import WhyPrimepowerSection from '../components/WhyPrimepowerSection';
import HowItWorksSection from '../components/HowItWorksSection';
import CTABannerSection from '../components/CTABannerSection';
import LandingFooter from '../components/LandingFooter';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <LandingNavbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <WhyPrimepowerSection />
        <HowItWorksSection />
        <CTABannerSection />
      </main>
      <LandingFooter />
    </div>
  );
}
