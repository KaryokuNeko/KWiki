import { FloatingNav } from "./components/FloatingNav"
import { VideoCarousel } from "./components/VideoCarousel"
import { CharacterShowcase } from "./components/CharacterShowcase"
import { ItemGallery } from "./components/ItemGallery"
import { Footer } from "./components/Footer"
import { FullPageScroll } from "./components/FullPageScroll"
import { listPublishedVideos } from "@/lib/homepage-video"
import { listFeaturedCharacters } from "@/lib/character"
import { listFeaturedItems } from "@/lib/item"

export default async function Home() {
  // Fetch all content server-side
  const [videos, characters, items] = await Promise.all([
    listPublishedVideos(),
    listFeaturedCharacters(),
    listFeaturedItems()
  ])

  console.log("Fetched homepage content:", { videos, characters, items })

  return (
    <FullPageScroll>
      <FloatingNav />

      {/* Section 1: Video Carousel */}
      <section data-section="videos" id="section-videos" className="h-screen w-full">
        <VideoCarousel videos={videos} />
      </section>

      {/* Section 2: Character Showcase */}
      <section data-section="characters" id="section-characters" className="h-screen w-full">
        <CharacterShowcase characters={characters} />
      </section>

      {/* Section 3: Item Gallery + Footer */}
      <section data-section="items" id="section-items" className="w-full">
        <ItemGallery items={items} />
        <Footer />
      </section>
    </FullPageScroll>
  )
}
