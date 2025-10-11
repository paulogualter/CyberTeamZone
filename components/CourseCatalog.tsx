'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import CourseCard from './CourseCard'
import CourseDetailModal from './CourseDetailModal'
import CategoryFilter from './CategoryFilter'
import SearchBar from './SearchBar'
import Pagination from './Pagination'
import { Course, Category } from '@/types'

interface PaginationData {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

// Removed mock data - using real API data only

export default function CourseCatalog() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationData | null>(null)

  // Fetch courses and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch courses
        const coursesResponse = await fetch('/api/courses')
        if (!coursesResponse.ok) {
          throw new Error('Failed to fetch courses')
        }
        const coursesData = await coursesResponse.json()
        
        // Fetch categories - temporarily use mock data
        console.log('Fetching categories...')
        const categoriesResponse = await fetch('/api/categories')
        console.log('Categories response status:', categoriesResponse.status)
        
        let categoriesData
        if (categoriesResponse.ok) {
          categoriesData = await categoriesResponse.json()
          console.log('Categories data from API:', categoriesData)
        } else {
          console.log('Categories API failed, using mock data')
          categoriesData = { categories: [] }
        }
        
        console.log('Courses data from API:', coursesData.courses)
        if (coursesData.courses && coursesData.courses.length > 0) {
          // Transform API data to match component interface
          const transformedCourses = coursesData.courses.map((course: any) => ({
            id: course.id,
            title: course.title,
            shortDescription: course.shortDescription,
            description: course.description,
            price: course.price,
            escudosPrice: course.escudosPrice,
            difficulty: course.difficulty,
            duration: course.duration,
            categoryId: course.categoryId,
            instructorId: course.instructorId,
            coverImage: course.coverImage,
            isPublished: course.isPublished,
            status: course.status || 'ACTIVE',
            courseType: course.courseType || 'RECORDED',
            instructor: course.instructor || { id: '1', name: 'CyberTeam', email: 'team@cyberteam.com' },
            category: course.category || { id: '1', name: 'Cybersecurity', description: 'Cybersecurity courses' }
          }))
          setCourses(transformedCourses)
          setFilteredCourses(transformedCourses)
        } else {
          // No courses found
          console.log('No courses found')
          setCourses([])
          setFilteredCourses([])
        }
        
        // Use API categories
        console.log('Using API categories')
        const apiCategories = (categoriesData.categories || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          icon: c.icon || '📚',
          color: c.color || '#6366f1',
          courseCount: c.courseCount || 0
        }))
        
        // Calculate total courses for "All Categories"
        const totalCourses = apiCategories.reduce((sum: number, category: any) => sum + (category.courseCount || 0), 0)
        
        // Add "All Categories" option
        const transformedCategories = [
          { id: 'all', name: 'All Categories', description: 'All available courses', icon: '🔍', color: '#6366f1', courseCount: totalCourses },
          ...apiCategories
        ]
        
        setCategories(transformedCategories)
        
      } catch (error) {
        console.error('Error fetching data:', error)
        // No fallback to mock data - show empty state
        setCourses([])
        setCategories([])
        setFilteredCourses([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    let filtered = courses

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.categoryId === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.instructor && course.instructor.name && course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    setFilteredCourses(filtered)
  }, [courses, selectedCategory, searchQuery])

  const handleCourseClick = (course: Course) => {
    if (!session) {
      // Redirect to login/signup
      window.location.href = '/auth/signin'
    } else {
      // Redirect to course details or enrollment
      window.location.href = `/courses/${course.id}`
    }
  }

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course)
    setShowDetailModal(true)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <div className="lg:w-1/4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-blue-500/20">
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Categorias</h3>
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:w-3/4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Course Catalog</h1>
          <p className="text-gray-300">
            Showing {filteredCourses.length} courses
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-white text-xl">Loading courses...</div>
          </div>
        ) : (
          /* Course Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CourseCard
                    course={course}
                    onClick={() => handleViewCourse(course)}
                  />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 text-lg">
                  No courses found
                </div>
                <p className="text-gray-500 mt-2">
                  Try adjusting your search filters
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedCourse(null)
          }}
        />
      )}
    </div>
  )
}