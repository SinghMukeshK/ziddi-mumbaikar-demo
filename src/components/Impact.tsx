'use client'

import { motion } from 'framer-motion'
import { Truck, Users, MapPin, Sparkles, ArrowRight } from 'lucide-react'

export default function Impact() {
  const stats = [
    {
      number: "150+",
      label: "Cleanup Drives",
      description: "Beaches, streets, and public spaces restored across Mumbai.",
      icon: <Sparkles className="w-8 h-8" />
    },
    {
      number: "25k+",
      label: "Lives Impacted",
      description: "Citizens directly supported through our community initiatives.",
      icon: <Users className="w-8 h-8" />
    },
    {
      number: "45+",
      label: "Area Coverage",
      description: "Active presence from South Mumbai to the outermost suburbs.",
      icon: <MapPin className="w-8 h-8" />
    },
    {
      number: "800+",
      label: "Active Heroes",
      description: "Dedicated volunteers making real change happen every day.",
      icon: <Truck className="w-8 h-8" />
    }
  ]

  return (
    <section id="impact" className="py-24 bg-navy-900 text-white relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-primary-400 font-bold tracking-widest uppercase text-sm mb-4 block"
          >
            Our Track Record
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl font-black mb-6"
          >
            The Measurable <span className="text-primary-500">Difference</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            Numbers don&apos;t lie. Witness the tangible change we&apos;ve built together with the
            people of Mumbai over the last few years.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="relative group p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-primary-500/30 transition-all duration-500"
            >
              <div className="w-16 h-16 bg-primary-500/20 text-primary-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white transition-all duration-500">
                {stat.icon}
              </div>

              <div className="space-y-3">
                <div className="text-4xl lg:text-5xl font-black text-white group-hover:text-primary-500 transition-colors">
                  {stat.number}
                </div>
                <h3 className="text-lg font-bold text-gray-200">
                  {stat.label}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {stat.description}
                </p>
              </div>

              {/* Decorative corner element */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-tr-[2.5rem]"></div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-20"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 p-2 pr-2 sm:pr-8 bg-white/5 backdrop-blur-sm rounded-[2rem] border border-white/10">
            <div className="bg-primary-500 text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-primary-500/20">
              Join Our Movement
            </div>
            <p className="text-gray-300 font-bold flex items-center gap-2">
              Ready to create history? <ArrowRight className="w-5 h-5 text-primary-500" />
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
