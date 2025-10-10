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


export default function CourseCatalogWithPagination() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [itemsPerPage, setItemsPerPage] = useState(6)

  // Reset to page 1 when items per page changes
  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  // Fetch courses and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Build query parameters for pagination
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString()
        })
        
        if (selectedCategory !== 'all') {
          params.append('category', selectedCategory)
        }
        
        if (searchQuery) {
          params.append('search', searchQuery)
        }
        
        // Fetch courses with pagination
        const coursesResponse = await fetch(`/api/courses?${params.toString()}`, { cache: 'no-store' })
        if (!coursesResponse.ok) {
          throw new Error('Failed to fetch courses')
        }
        const coursesData = await coursesResponse.json()
        
        // Fetch categories from API
        const categoriesResponse = await fetch('/api/categories', { cache: 'no-store' })
        let categoriesData = { categories: [] as any[] }
        if (categoriesResponse.ok) {
          categoriesData = await categoriesResponse.json()
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
            videoUrl: course.videoUrl,
            isPublished: course.isPublished,
            status: course.status || 'ACTIVE',
            courseType: course.courseType || 'RECORDED',
            instructor: course.instructor || { id: '1', name: 'CyberTeam', email: 'team@cyberteam.com' },
            category: course.category || { id: '1', name: 'Cybersecurity', description: 'Cybersecurity courses' }
          }))
          setCourses(transformedCourses)
          setPagination(coursesData.pagination)
        } else {
          // No courses found
          console.log('No courses found')
          setCourses([])
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalCount: 0,
            limit: 12,
            hasNext: false,
            hasPrev: false
          })
        }
        
        // Build categories list with 'all'
        const apiCategories = (categoriesData.categories || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          icon: c.icon || '📚',
          color: c.color || '#6366f1',
          courseCount: c.courseCount || 0
        }))
        setCategories([
          { id: 'all', name: 'All Categories', description: 'All available courses', icon: '🔍', color: '#6366f1', courseCount: 0 },
          ...apiCategories
        ])
        
      } catch (error) {
        console.error('Error fetching data:', error)
        // Set empty data on error
        setCourses([])
        setCategories([])
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          limit: 12,
          hasNext: false,
          hasPrev: false
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentPage, selectedCategory, searchQuery, itemsPerPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchQuery])

  const handleCourseClick = (course: Course) => {
    if (!session) {
      // Redirect to login/signup
      window.location.href = '/auth/signin'
    } else {
      // Redirect to course details or enrollment
      window.location.href = `/courses/${course.id}`
    }
  }

  const handleVerCurso = (course: Course) => {
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Course Catalog</h1>
              <p className="text-gray-300">
                {pagination ? `Showing ${courses.length} of ${pagination.totalCount} courses` : `Showing ${courses.length} courses`}
              </p>
            </div>
            
            {/* Items per page selector */}
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <label htmlFor="itemsPerPage" className="text-gray-300 text-sm">
                Cursos por página:
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-white text-xl">Carregando cursos...</div>
          </div>
        ) : (
          /* Course Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.length > 0 ? (
              courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CourseCard
                    course={course}
                    onClick={() => handleVerCurso(course)}
                  />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 text-lg">
                  Nenhum curso encontrado
                </div>
                <p className="text-gray-500 mt-2">
                  Tente ajustar seus filtros de busca
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
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
