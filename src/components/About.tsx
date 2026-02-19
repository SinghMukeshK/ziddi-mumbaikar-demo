'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { CheckCircle2, Users, Rocket, Target } from 'lucide-react'

export default function About() {
  const stats = [
    { label: "Active Volunteers", value: "500+", icon: <Users className="w-5 h-5" /> },
    { label: "Donations Received", value: "₹50L+", icon: <Rocket className="w-5 h-5" /> },
    { label: "Projects Completed", value: "120+", icon: <Target className="w-5 h-5" /> }
  ]

  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary-100/30 rounded-full blur-3xl -ml-32 -mt-32"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-navy-50 rounded-full blur-3xl -mr-48 -mb-48"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-square md:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200"
                alt="Ziddi Mumbaikar Volunteers"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent"></div>

              {/* Floating Achievement Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20"
              >
                <p className="text-navy-900 font-bold text-lg mb-1">Impact Driven</p>
                <p className="text-gray-600 text-sm italic">&quot;We don&apos;t wait for change, we create it by taking the first step on the streets of Mumbai.&quot;</p>
              </motion.div>
            </div>

            {/* Background Accent Square */}
            <div className="absolute -z-10 -bottom-6 -right-6 w-full h-full border-4 border-primary-500/20 rounded-[2rem]"></div>
          </motion.div>

          {/* Content Side */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <span className="text-primary-500 font-bold tracking-widest uppercase text-sm mb-4 block">Our Story & Mission</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-navy-900 mb-6 leading-tight">
                Not Just An NGO, <br />
                <span className="text-primary-500">A Citizen&apos;s Movement</span>
              </h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  We are not another organization with fancy offices. We are your neighbors, your colleagues,
                  and your fellow commuters who decided to stop complaining and start acting.
                </p>
                <p>
                  Born from the very streets we walk every day, <span className="text-navy-900 font-bold">Ziddi Mumbaikar</span> is
                  built on the belief that if every citizen takes responsibility for just one square kilometer around them,
                  Mumbai will transform overnight.
                </p>
              </div>
            </motion.div>

            {/* Key Values Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                "Citizen-Led Action",
                "100% Transparency",
                "Immediate Response",
                "Community Empowerment"
              ].map((value, i) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  key={i}
                  className="flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-navy-900 text-sm uppercase tracking-wide">{value}</span>
                </motion.div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-100">
              {stats.map((stat, i) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  key={i}
                  className="text-center group"
                >
                  <div className="flex justify-center text-primary-500 mb-2 group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-black text-navy-900">{stat.value}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="pt-4"
            >
              <button className="bg-navy-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-navy-800 transition-all hover:shadow-2xl hover:-translate-y-1 active:scale-95 shadow-xl shadow-navy-900/10">
                Join The Movement
              </button>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
