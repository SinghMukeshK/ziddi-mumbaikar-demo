'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { galleryService, GalleryAlbum, GalleryAlbumMedia } from '@/services/gallery.service'
import { Images, ChevronRight, Loader2 } from 'lucide-react'

// Fallback static items shown while loading or if API returns nothing
const FALLBACK_ITEMS = [
  { id: 'f1', title: 'Blood Donation Camp', category: 'Health', images: ['/BloodDonationCamp.webp', '/HelpForEMergency.webp', '/Ambulance.jpg'], description: 'Free health checkups in our local community' },
  { id: 'f2', title: 'Community Health Camp', category: 'Health', images: ['/HelpForEMergency.webp', '/BloodDonationCamp.webp', '/AmbulanceService.webp'], description: 'We are always ready to help in case of emergency' },
  { id: 'f3', title: "Women's Safety Workshop", category: 'Safety', images: ['/ProvidingFood.webp', '/HelpForEMergency.webp'], description: 'Providing food to the needy' },
  { id: 'f4', title: 'Free Ambulance Service', category: 'Health', images: ['/AmbulanceService.webp', '/Ambulance.jpg', '/BloodDonationCamp.webp'], description: 'Providing free ambulance service to the needy' },
  { id: 'f5', title: 'Emergency Response Team', category: 'Emergency', images: ['/Ambulance.jpg', '/AmbulanceService.webp'], description: 'Our ambulance service in action' },
]

interface DisplayItem {
  id: string
  title: string
  category: string
  images: string[]
  description: string
}

function CardCarousel({ images, title }: { images: string[], title: string }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [images])

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={images[index]}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={images[index]}
            alt={`${title} - image ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
          />
        </motion.div>
      </AnimatePresence>

      {/* Indicator Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i === index ? 'bg-primary-500 w-4' : 'bg-white/50'
                }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Gallery() {
  const [items, setItems] = useState<DisplayItem[]>([])
  const [albums, setAlbums] = useState<GalleryAlbum[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch published albums
        const albumRes = await galleryService.getAlbums({ is_published: true, limit: 20 })
        const fetchedAlbums: GalleryAlbum[] = albumRes.data || []
        setAlbums(fetchedAlbums)

        if (fetchedAlbums.length === 0) {
          setItems(FALLBACK_ITEMS)
          setLoading(false)
          return
        }

        // For each album, fetch its media
        const displayItems: DisplayItem[] = []
        await Promise.all(
          fetchedAlbums.slice(0, 8).map(async (album) => {
            try {
              const mediaRes = await galleryService.getAlbumMedia(album.id)
              const mediaList = mediaRes.data || []
              const images = mediaList
                .map(m => m.media?.file_url || (m as any).Media?.file_url)
                .filter(Boolean) as string[]

              displayItems.push({
                id: album.id,
                title: album.title,
                category: album.description?.split('|')[0]?.trim() || 'General',
                images: images.length > 0 ? images : [album.cover_image_url || FALLBACK_ITEMS[displayItems.length % FALLBACK_ITEMS.length].images[0]],
                description: album.description?.split('|')[1]?.trim() || album.description || '',
              })
            } catch {
              // skip failed albums
            }
          })
        )

        setItems(displayItems.length > 0 ? displayItems : FALLBACK_ITEMS)
      } catch {
        setItems(FALLBACK_ITEMS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))]
  const filtered = activeCategory === 'All' ? items : items.filter(i => i.category === activeCategory)

  return (
    <section id="gallery" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            className="text-primary-500 font-bold tracking-widest uppercase text-sm mb-4 block"
          >
            Visual Journey
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl font-bold text-navy-900 mb-6"
          >
            See Our <span className="text-primary-500">Impact</span> In Photos
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed"
          >
            Every photo tells a story of change. From before-and-after cleanup shots
            to community health camps, witness the transformation happening across Mumbai.
          </motion.p>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mt-12"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 border-2 ${activeCategory === cat
                  ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white border-gray-100 text-gray-500 hover:border-primary-200 hover:text-primary-500'
                  }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
          </div>
        ) : (
          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filtered.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -10 }}
                  className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <CardCarousel images={item.images} title={item.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                      <span className="text-white font-bold text-xs tracking-widest bg-primary-500 px-3 py-1 rounded-full w-fit mb-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        {item.category}
                      </span>
                      <h3 className="text-white font-bold text-lg leading-tight transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 italic">
                      &quot;{item.description}&quot;
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mt-16">
          <Link
            href="/gallery"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-navy-900 text-white font-bold rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            <Images className="w-5 h-5 relative z-10" />
            <span className="relative z-10">View Complete Gallery</span>
            <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-primary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
