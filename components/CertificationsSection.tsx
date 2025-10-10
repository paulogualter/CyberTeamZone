'use client'

import { motion } from 'framer-motion'

export default function CertificationsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-16 pt-8 border-t border-gray-700"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Recognized Certifications</h2>
        <p className="text-gray-300 text-lg max-w-3xl mx-auto">
          Our certificates are recognized by leading cybersecurity companies and 
          validate your technical skills for the job market.
        </p>
      </div>
      
      <div className="flex flex-wrap justify-center items-center gap-6 opacity-80">
        {/* CEH Logo */}
        <div className="flex items-center justify-center w-20 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-lg border border-green-500 hover:opacity-100 transition-opacity duration-300">
          <span className="text-white font-bold text-sm">CEH</span>
        </div>
        
        {/* CISSP Logo */}
        <div className="flex items-center justify-center w-20 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg border border-orange-500 hover:opacity-100 transition-opacity duration-300">
          <span className="text-white font-bold text-sm">CISSP</span>
        </div>
        
        {/* CISM Logo */}
        <div className="flex items-center justify-center w-20 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border border-blue-500 hover:opacity-100 transition-opacity duration-300">
          <span className="text-white font-bold text-sm">CISM</span>
        </div>
        
        {/* Security+ Logo */}
        <div className="flex items-center justify-center w-20 h-12 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg border border-yellow-400 hover:opacity-100 transition-opacity duration-300">
          <span className="text-white font-bold text-xs">Security+</span>
        </div>
        
        {/* OSCP Logo */}
        <div className="flex items-center justify-center w-20 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-lg border border-red-500 hover:opacity-100 transition-opacity duration-300">
          <span className="text-white font-bold text-sm">OSCP</span>
        </div>
        
        {/* CISA Logo */}
        <div className="flex items-center justify-center w-20 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg border border-purple-500 hover:opacity-100 transition-opacity duration-300">
          <span className="text-white font-bold text-sm">CISA</span>
        </div>
      </div>
    </motion.div>
  )
}
