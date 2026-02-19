import Hero from '@/components/Hero'
import About from '@/components/About'
import WhatWeDo from '@/components/WhatWeDo'
import NgoServices from '@/components/NgoServices'
import TrendingFundraisers from '@/components/TrendingFundraisers'
import Impact from '@/components/Impact'
import Gallery from '@/components/Gallery'
import VolunteerHelp from '@/components/VolunteerHelp'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <TrendingFundraisers />
      <NgoServices />
      <WhatWeDo />
      <About />
      <Gallery />
      <VolunteerHelp />
      <Footer />
    </main>
  )
}
