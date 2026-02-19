'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Trash2,
  ShieldCheck,
  Truck,
  Users,
  Home,
  Leaf,
  ArrowRight,
  Sparkles
} from 'lucide-react'

export default function WhatWeDo() {
  const services = [
    {
      title: "Cleanliness Drives",
      description: "Regular community cleanup drives in neighborhoods, beaches, and public spaces across Mumbai.",
      link: "/services/cleanliness-drives",
      icon: <Trash2 className="w-8 h-8" />,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      delay: 0.1
    },
    {
      title: "Fogging & Health",
      description: "Mosquito control drives and health awareness campaigns to prevent dengue and malaria.",
      link: "/services/health-campaigns",
      icon: <ShieldCheck className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      delay: 0.2
    },
    {
      title: "Emergency Support",
      description: "24/7 emergency ambulance service and first aid support for community emergencies.",
      link: "/services/emergency-support",
      icon: <Truck className="w-8 h-8" />,
      color: "from-red-500 to-rose-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      delay: 0.3
    },
    {
      title: "Women Empowerment",
      description: "Safety workshops, self-defense training, and empowerment events for women and families.",
      link: "/services/community-events",
      icon: <Users className="w-8 h-8" />,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      delay: 0.4
    },
    {
      title: "Local Area Care",
      description: "Neighborhood support for elderly care, disaster relief, and community infrastructure.",
      link: "/services/local-assistance",
      icon: <Home className="w-8 h-8" />,
      color: "from-orange-500 to-amber-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      delay: 0.5
    },
    {
      title: "Environmental Action",
      description: "Tree plantation drives, waste management solutions, and sustainable living workshops.",
      link: "/services/environmental-action",
      icon: <Leaf className="w-8 h-8" />,
      color: "from-teal-500 to-green-600",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
      delay: 0.6
    }
  ]

  return (
    <section id="what-we-do" className="py-24 bg-white relative overflow-hidden">
      {/* Background Decorative Blurs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy-50 rounded-full blur-3xl -ml-48 -mb-48"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-primary-100"
          >
            <Sparkles className="w-4 h-4" />
            Our Impact Areas
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl font-black text-navy-900 mb-6 leading-tight"
          >
            How We Are <span className="text-primary-500 underline decoration-primary-200 decoration-8 underline-offset-8">Fixing</span> Mumbai
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed"
          >
            Real problems require real solutions. We don&apos;t just talk; we act.
            Join us in making Mumbai better, one neighborhood at a time.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: service.delay }}
              whileHover={{ y: -12 }}
              className="group relative bg-white rounded-[2.5rem] p-10 shadow-xl shadow-navy-900/5 border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/10"
            >
              {/* Animated Icon Container */}
              <div className={`relative w-20 h-20 ${service.bgColor} rounded-3xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-all duration-500`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500`}></div>
                <div className={`${service.iconColor} relative z-10 group-hover:text-white transition-colors duration-500`}>
                  {service.icon}
                </div>

                {/* Glow effect on hover */}
                <div className={`absolute inset-0 bg-white blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
              </div>

              {/* Title */}
              <h3 className="font-display text-2xl font-black text-navy-900 mb-4 group-hover:text-primary-600 transition-colors duration-300">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-gray-500 leading-relaxed mb-8 flex-1">
                {service.description}
              </p>

              {/* Learn More Link */}
              <Link
                href={service.link}
                className="inline-flex items-center gap-2 text-primary-500 font-black text-sm uppercase tracking-wider group-hover:gap-4 transition-all duration-300"
              >
                <span>Discover More</span>
                <ArrowRight className="w-5 h-5 transition-transform" />
              </Link>

              {/* Corner Decorative Element */}
              <div className={`absolute -top-2 -right-2 w-24 h-24 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 rounded-bl-[4rem] transition-opacity duration-500`}></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
