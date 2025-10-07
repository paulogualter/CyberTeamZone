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

// Mock data - in production this would come from API
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Basic Course',
    description: 'System introduction',
    shortDescription: 'System introduction',
    instructor: { id: '1', name: 'CyberTeam', email: 'cyberteam@example.com', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    difficulty: 'BEGINNER',
    duration: 60,
    price: 1.00,
    escudosPrice: 100,
    coverImage: '/images/curso-basico.jpg',
    videoUrl: '',
    isPublished: true,
    isFree: false,
    status: 'ACTIVE',
    courseType: 'RECORDED',
    categoryId: 'all',
    instructorId: '1',
    rating: 4.5,
    enrolledCount: 101,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Network Defense and Monitoring',
    description: 'Learn to build robust network defense systems, implement monitoring solutions, and detect threats in real-time.',
    shortDescription: 'Learn to build robust network defense systems...',
    instructor: { id: '1', name: 'CyberTeam', email: 'cyberteam@example.com', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    difficulty: 'BEGINNER',
    duration: 360,
    price: 1.00,
    escudosPrice: 100,
    coverImage: '/images/network-defense.jpg',
    videoUrl: '',
    isPublished: true,
    isFree: false,
    status: 'ACTIVE',
    courseType: 'ONLINE',
    categoryId: 'network-security',
    instructorId: '1',
    rating: 4.5,
    enrolledCount: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Advanced Web Application Penetration Testing',
    description: 'Comprehensive course covering OWASP Top 10, advanced exploitation techniques, and modern web application security.',
    shortDescription: 'Comprehensive course covering OWASP Top 10...',
    instructor: { id: '1', name: 'CyberTeam', email: 'cyberteam@example.com', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    difficulty: 'BEGINNER',
    duration: 480,
    price: 1.00,
    escudosPrice: 1000,
    coverImage: '/images/web-app-security.jpg',
    videoUrl: '',
    isPublished: true,
    isFree: false,
    status: 'ACTIVE',
    courseType: 'HYBRID',
    categoryId: 'web-app-security',
    instructorId: '1',
    rating: 4.5,
    enrolledCount: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const mockCategories: Category[] = [
  { id: 'all', name: 'All Categories', description: 'All available courses', icon: '🔍', color: '#6366f1', courseCount: 0 },
  { id: 'clx1234567890abcde1', name: 'Penetration Testing', description: 'Ethical hacking and penetration testing courses', icon: '🎯', color: '#EF4444', courseCount: 0 },
  { id: 'clx1234567890abcde2', name: 'Network Security', description: 'Network defense and monitoring courses', icon: '🛡️', color: '#10B981', courseCount: 0 },
  { id: 'clx1234567890abcde3', name: 'Web Application Security', description: 'Web application security and OWASP courses', icon: '🌐', color: '#F59E0B', courseCount: 0 },
  { id: 'clx1234567890abcde4', name: 'Incident Response', description: 'Incident response and forensics courses', icon: '🚨', color: '#8B5CF6', courseCount: 0 },
  { id: 'clx1234567890abcde5', name: 'Social Engineering', description: 'Social engineering awareness and prevention', icon: '👥', color: '#EC4899', courseCount: 0 },
  { id: 'clx1234567890abcde6', name: 'Malware Analysis', description: 'Malware analysis and reverse engineering', icon: '🦠', color: '#F97316', courseCount: 0 },
  { id: 'clx1234567890abcde7', name: 'Digital Forensics', description: 'Digital forensics and evidence collection', icon: '🔍', color: '#06B6D4', courseCount: 0 },
  { id: 'clx1234567890abcde8', name: 'Cryptography', description: 'Cryptography and encryption techniques', icon: '🔐', color: '#84CC16', courseCount: 0 },
  { id: 'clx1234567890abcde9', name: 'Red Team Operations', description: 'Red team exercises and attack simulation', icon: '🔴', color: '#DC2626', courseCount: 0 },
  { id: 'clx1234567890abcdea', name: 'Blue Team Defense', description: 'Blue team defense and monitoring', icon: '🔵', color: '#2563EB', courseCount: 0 },
  { id: 'clx1234567890abcdeb', name: 'Cloud Security', description: 'Cloud security and infrastructure protection', icon: '☁️', color: '#7C3AED', courseCount: 0 },
  { id: 'clx1234567890abcdec', name: 'Threat Intelligence', description: 'Threat intelligence and analysis', icon: '📊', color: '#059669', courseCount: 0 },
  { id: 'clx1234567890abcded', name: 'IoT Security', description: 'Internet of Things security', icon: '🌐', color: '#10B981', courseCount: 0 },
  { id: 'clx1234567890abcdee', name: 'Mobile Security', description: 'Mobile device and application security', icon: '📱', color: '#F59E0B', courseCount: 0 },
  { id: 'clx1234567890abcdef', name: 'Compliance & Governance', description: 'Security compliance and governance frameworks', icon: '📋', color: '#6B7280', courseCount: 0 },
]

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
          // Fallback to mock data if no courses found
          console.log('No courses found, using mock data')
          setCourses(mockCourses)
          setFilteredCourses(mockCourses)
        }
        
        // Always use mock data for now to test frontend
        console.log('Using mock categories for testing')
        setCategories(mockCategories)
        
      } catch (error) {
        console.error('Error fetching data:', error)
        // Fallback to mock data on error
        setCourses(mockCourses)
        setCategories(mockCategories)
        setFilteredCourses(mockCourses)
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