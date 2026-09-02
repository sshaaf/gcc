import { Topbar } from "@/components/Topbar";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { MatchCentre } from "@/components/MatchCentre";
import { Teams } from "@/components/Teams";
import { Honours } from "@/components/Honours";
import { Coaches } from "@/components/Coaches";
import { Ground } from "@/components/Ground";
import { Sponsors } from "@/components/Sponsors";
import { News } from "@/components/News";
import { GalleryPreview } from "@/components/GalleryPreview";
import { Join } from "@/components/Join";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Topbar />
      <Nav />
      <Hero />
      <MatchCentre />
      <Teams />
      <Honours />
      <Coaches />
      <Ground />
      <Sponsors />
      <News />
      <GalleryPreview />
      <Join />
      <Footer />
    </>
  );
}