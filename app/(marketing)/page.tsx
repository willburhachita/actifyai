import { Hero } from "@/components/marketing/Hero";
import { WhySection } from "@/components/marketing/WhySection";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { SecurityStory } from "@/components/marketing/SecurityStory";
import { DashboardPreview } from "@/components/marketing/DashboardPreview";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { Navbar } from "@/components/marketing/Navbar";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg-deep bg-grid overflow-x-hidden">
      <Navbar />
      <Hero />
      <WhySection />
      <HowItWorks />
      <SecurityStory />
      <DashboardPreview />
      <FinalCTA />
    </main>
  );
}
