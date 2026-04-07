import { Navbar } from "@/components/marketing/Navbar";
import { StudioLanding } from "@/components/marketing/StudioLanding";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg-deep overflow-x-hidden">
      <Navbar />
      <StudioLanding />
    </main>
  );
}
