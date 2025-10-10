'use client'

import { motion } from 'framer-motion'

export default function StatsAndCertificationsSection() {
  return (
    <>
      {/* Certifications Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-16 pt-8 pb-8 bg-blue-900/20 rounded-xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Recognized Certifications</h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Our certificates are recognized by leading cybersecurity companies and 
            validate your technical skills for the job market.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-90">
          {/* CEH Logo */}
          <div className="flex items-center justify-center w-40 h-28 hover:opacity-100 transition-opacity duration-300 p-2 hover:scale-105 transform transition-transform">
            <img 
              src="/images/certifications/ceh-real.svg" 
              alt="CEH - Certified Ethical Hacker" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          {/* CISSP Logo */}
          <div className="flex items-center justify-center w-40 h-28 hover:opacity-100 transition-opacity duration-300 p-2 hover:scale-105 transform transition-transform">
            <img 
              src="/images/certifications/cissp-real.svg" 
              alt="CISSP - Certified Information Systems Security Professional" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          {/* CISM Logo */}
          <div className="flex items-center justify-center w-40 h-28 hover:opacity-100 transition-opacity duration-300 p-2 hover:scale-105 transform transition-transform">
            <img 
              src="/images/certifications/cism-real.svg" 
              alt="CISM - Certified Information Security Manager" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          {/* Security+ Logo */}
          <div className="flex items-center justify-center w-40 h-28 hover:opacity-100 transition-opacity duration-300 p-2 hover:scale-105 transform transition-transform">
            <img 
              src="/images/certifications/security-plus-real.svg" 
              alt="Security+ - CompTIA Security+" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          {/* OSCP Logo */}
          <div className="flex items-center justify-center w-40 h-28 hover:opacity-100 transition-opacity duration-300 p-2 hover:scale-105 transform transition-transform">
            <img 
              src="/images/certifications/oscp-real.svg" 
              alt="OSCP - Offensive Security Certified Professional" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          {/* CISA Logo */}
          <div className="flex items-center justify-center w-40 h-28 hover:opacity-100 transition-opacity duration-300 p-2 hover:scale-105 transform transition-transform">
            <img 
              src="/images/certifications/cisa-real.svg" 
              alt="CISA - Certified Information Systems Auditor" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      </motion.div>

      {/* Statistics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-8 pt-8 pb-8 border-t border-gray-700 bg-slate-800/30 rounded-xl"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400 mb-1">500+</div>
            <div className="text-sm text-gray-400">Active Students</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400 mb-1">50+</div>
            <div className="text-sm text-gray-400">Available Courses</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400 mb-1">100+</div>
            <div className="text-sm text-gray-400">CTFs Solved</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400 mb-1">95%</div>
            <div className="text-sm text-gray-400">Satisfaction Rate</div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
