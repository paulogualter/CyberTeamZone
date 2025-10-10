'use client'

import { useState, useEffect } from 'react'
import { Category } from '@/types'

export default function SimpleCatalog() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        
        // Fetch categories from API
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          
          if (data.categories && data.categories.length > 0) {
            // Transform API data
            const apiCategories = data.categories.map((category: any) => ({
              id: category.id,
              name: category.name,
              description: category.description,
              icon: category.icon || '📚',
              color: category.color || '#6366f1',
              courseCount: category.courseCount || 0
            }))
            
            // Calculate total courses for "All Categories"
            const totalCourses = apiCategories.reduce((sum: number, category: any) => sum + (category.courseCount || 0), 0)
            
            // Add "All Categories" option
            const transformedCategories = [
              { id: 'all', name: 'All Categories', description: 'All available courses', icon: '🔍', color: '#6366f1', courseCount: totalCourses },
              ...apiCategories
            ]
            setCategories(transformedCategories)
          } else {
            // Fallback to mock data if no categories found
            const mockCategories = [
              { id: 'all', name: 'All Categories', description: 'All available courses', icon: '🔍', color: '#6366f1', courseCount: 0 },
              { id: '1', name: 'Penetration Testing', description: 'Ethical hacking courses', icon: '🎯', color: '#EF4444', courseCount: 0 },
              { id: '2', name: 'Network Security', description: 'Network defense courses', icon: '🛡️', color: '#10B981', courseCount: 0 },
              { id: '3', name: 'Web App Security', description: 'Web application security', icon: '🌐', color: '#F59E0B', courseCount: 0 }
            ]
            setCategories(mockCategories)
          }
        } else {
          console.error('Failed to fetch categories')
          // Fallback to mock data on error
          const mockCategories = [
            { id: 'all', name: 'All Categories', description: 'All available courses', icon: '🔍', color: '#6366f1', courseCount: 0 },
            { id: '1', name: 'Penetration Testing', description: 'Ethical hacking courses', icon: '🎯', color: '#EF4444', courseCount: 0 },
            { id: '2', name: 'Network Security', description: 'Network defense courses', icon: '🛡️', color: '#10B981', courseCount: 0 },
            { id: '3', name: 'Web App Security', description: 'Web application security', icon: '🌐', color: '#F59E0B', courseCount: 0 }
          ]
          setCategories(mockCategories)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        // Fallback to mock data on error
        const mockCategories = [
          { id: 'all', name: 'All Categories', description: 'All available courses', icon: '🔍', color: '#6366f1', courseCount: 0 },
          { id: '1', name: 'Penetration Testing', description: 'Ethical hacking courses', icon: '🎯', color: '#EF4444', courseCount: 0 },
          { id: '2', name: 'Network Security', description: 'Network defense courses', icon: '🛡️', color: '#10B981', courseCount: 0 },
          { id: '3', name: 'Web App Security', description: 'Web application security', icon: '🌐', color: '#F59E0B', courseCount: 0 }
        ]
        setCategories(mockCategories)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <div className="lg:w-1/4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-blue-500/20">
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 text-gray-300 hover:bg-slate-700 hover:text-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className="text-sm px-2 py-1 rounded-full bg-gray-600 text-gray-300">
                      {category.courseCount}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:w-3/4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Course Catalog</h1>
          <p className="text-gray-300">
            Explore our comprehensive collection of cybersecurity courses
          </p>
        </div>
      </div>
    </div>
  )
}
