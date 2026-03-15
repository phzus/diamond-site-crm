import { Hero } from "@/components/sections/Hero";
import { Concept } from "@/components/sections/Concept";
import { Carousel } from "@/components/sections/Carousel";
import { Experience360 } from "@/components/sections/Experience360";
import { ExperienceDetails } from "@/components/sections/ExperienceDetails";

/**
 * Home Page
 * Server Component for optimal SEO
 * Dark minimal design
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Concept />
      <Carousel />
      <Experience360 />
      <ExperienceDetails />
      {/* Other sections will be added here */}
    </>
  );
}
