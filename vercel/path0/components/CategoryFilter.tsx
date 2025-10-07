'use client'

import { Category } from '@/types'
import { motion } from 'framer-motion'

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string
  onCategorySelect: (categoryId: string) => void
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}: CategoryFilterProps) {
  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <motion.button
          key={category.id}
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onCategorySelect(category.id)}
          className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
            selectedCategory === category.id
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-lg">{category.icon}</span>
              <span className="font-medium">{category.name}</span>
            </div>
            <span className={`text-sm px-2 py-1 rounded-full ${
              selectedCategory === category.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-600 text-gray-300'
            }`}>
              {category.courseCount}
            </span>
          </div>
        </motion.button>
      ))}
    </div>
  )
}
