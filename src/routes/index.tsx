import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/sections/HeroSection";
import { NarrativeSection } from "@/components/sections/NarrativeSection";
import { VenturesSection } from "@/components/sections/VenturesSection";
import { PortfolioSection } from "@/components/sections/PortfolioSection";
import { NumbersSection } from "@/components/sections/NumbersSection";
import { DesignSection } from "@/components/sections/DesignSection";
import { ContactSection } from "@/components/sections/ContactSection";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <HeroSection />
      <NarrativeSection />
      <VenturesSection />
      <PortfolioSection />
      <NumbersSection />
      <DesignSection />
      <ContactSection />
    </>
  );
}
