'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { galleryService, GalleryAlbum, GalleryAlbumMedia } from '@/services/gallery.service'
import { Images, ChevronRight, Loader2 } from 'lucide-react'

// Fallback static items shown while loading or if API returns nothing
const FALLBACK_ITEMS = [
  { id: 'f1', title: 'Blood Donation Campl', category: 'Health', image: '/BloodDonationCamp.webp', description: 'Free health checkups in our local community' },
  { id: 'f2', title: 'Community Health Camp', category: 'Health', image: '/HelpForEMergency.webp', description: 'We are always ready to help in case of emergency' },
  { id: 'f3', title: "Women's Safety Workshop", category: 'Safety', image: '/ProvidingFood.webp', description: 'Providing food to the needy' },
  { id: 'f4', title: 'Free Ambulance Service', category: 'Health', image: '/AmbulanceService.webp', description: 'Providing free ambulance service to the needy' },
  { id: 'f5', title: 'Emergency Response Team', category: 'Emergency', image: '/Ambulance.jpg', description: 'Our ambulance service in action' },
  // { id: 'f6', title: 'Community Festival', category: 'Community', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800', description: 'Celebrating diversity in local neighborhoods' },
  // { id: 'f7', title: 'Street Cleaning Campaign', category: 'Cleanliness', image: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?auto=format&fit=crop&q=80&w=800', description: 'Volunteers cleaning busy market areas' },
  // { id: 'f8', title: 'Youth Engagement Program', category: 'Youth', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800', description: 'Inspiring next generation of change-makers' },
]

interface DisplayItem {
  id: string
  title: string
  category: string
  image: string
  description: string
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

        // For each album, fetch its first media item to use as preview
        const displayItems: DisplayItem[] = []
        await Promise.all(
          fetchedAlbums.slice(0, 8).map(async (album) => {
            try {
              const mediaRes = await galleryService.getAlbumMedia(album.id)
              const firstMedia = (mediaRes.data || [])[0]
              displayItems.push({
                id: album.id,
                title: album.title,
                category: album.description?.split('|')[0]?.trim() || 'General',
                image: firstMedia?.media?.file_url || album.cover_image_url || FALLBACK_ITEMS[displayItems.length % FALLBACK_ITEMS.length].image,
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
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
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
