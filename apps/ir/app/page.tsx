import MainLayout from '@/components/layout/MainLayout';
import OrganizationSchema from '@/components/OrganizationSchema';
import HeroSection from '@/components/sections/HeroSection';
import MissionSection from '@/components/sections/MissionSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import TargetAudienceSection from '@/components/sections/TargetAudienceSection';
import PricingSection from '@/components/sections/PricingSection';
import SecurityPreviewSection from '@/components/sections/SecurityPreviewSection';
import FAQSection from '@/components/sections/FAQSection';
import FinalCTASection from '@/components/sections/FinalCTASection';

export default function Home() {
  return (
    <>
      <OrganizationSchema />
      <MainLayout>
        <HeroSection />
        <MissionSection />
        <HowItWorksSection />
        <TargetAudienceSection />
        <PricingSection />
        <SecurityPreviewSection />
        <FAQSection />
        <FinalCTASection />
      </MainLayout>
    </>
  );
}

