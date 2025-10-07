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

  // Fetch courses and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Build query parameters for pagination
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '12'
        })
        
        if (selectedCategory !== 'all') {
          params.append('category', selectedCategory)
        }
        
        if (searchQuery) {
          params.append('search', searchQuery)
        }
        
        // Fetch courses with pagination
        const coursesResponse = await fetch(`/api/courses?${params.toString()}`)
        if (!coursesResponse.ok) {
          throw new Error('Failed to fetch courses')
        }
        const coursesData = await coursesResponse.json()
        
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories')
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories')
        }
        const categoriesData = await categoriesResponse.json()
        
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
        
        if (categoriesData.categories && categoriesData.categories.length > 0) {
          // Transform API data and add "All Categories" option
          const transformedCategories = [
            { id: 'all', name: 'Todas as Categorias', description: 'All categories', icon: '🔍', color: '#6366f1', courseCount: coursesData.pagination?.totalCount || 0 },
            ...categoriesData.categories.map((category: any) => ({
              id: category.id,
              name: category.name,
              description: category.description,
              icon: category.icon || '📚',
              color: category.color || '#6366f1',
              courseCount: category.courseCount || 0
            }))
          ]
          setCategories(transformedCategories)
        } else {
          // No categories found
          console.log('No categories found')
          setCategories([])
        }
        
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
  }, [currentPage, selectedCategory, searchQuery])

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
          <h1 className="text-3xl font-bold text-white mb-2">Course Catalog</h1>
          <p className="text-gray-300">
            {pagination ? `Showing ${courses.length} of ${pagination.totalCount} courses` : `Showing ${courses.length} courses`}
          </p>
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
