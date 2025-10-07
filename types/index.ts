export interface User {
  id: string
  name?: string
  email: string
  emailVerified?: Date
  image?: string
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  subscriptionId?: string
  subscriptionStatus: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'PAST_DUE'
  subscriptionPlan?: 'BASIC' | 'GOLD' | 'DIAMOND'
  escudos: number
  subscriptionStart?: Date
  subscriptionEnd?: Date
}

export interface Instructor {
  id: string
  name: string
  email: string
  bio?: string
  avatar?: string
  expertise?: string | string[]
  socialLinks?: any
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  courses?: Course[]
  stats?: {
    totalCourses: number
    publishedCourses: number
    pendingCourses: number
    rejectedCourses: number
    totalEnrollments: number
    totalRevenue: number
  }
}

export interface Course {
  id: string
  title: string
  description: string
  shortDescription?: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  duration: number
  price: number
  escudosPrice: number
  coverImage?: string
  videoUrl?: string
  isPublished: boolean
  isFree: boolean
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'
  courseType: 'RECORDED' | 'ONLINE' | 'HYBRID'
  startDate?: Date
  createdAt: Date
  updatedAt: Date
  categoryId: string
  lessonsCount?: number
  instructorId: string
  instructor?: Instructor
  category?: Category
  rating?: number
  enrolledCount?: number
  modules?: Module[]
  isEnrolled?: boolean
  progress?: number
  completedLessons?: number
  totalLessons?: number
}

export interface Module {
  id: string
  title: string
  description?: string
  order: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
  courseId: string
  course?: Course
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  title: string
  description?: string
  content: string
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'PRACTICAL' | 'CTF'
  duration?: number
  order: number
  isPublished: boolean
  videoUrl?: string
  attachment?: string
  createdAt: Date
  updatedAt: Date
  moduleId: string
  module?: Module
}

export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  courseCount?: number
  createdAt?: Date
  updatedAt?: Date
}


export interface Enrollment {
  id: string
  enrolledAt: Date
  completedAt?: Date
  progress: number
  isActive: boolean
  userId: string
  courseId: string
}

export interface Payment {
  id: string
  amount: number
  currency: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
  paymentMethod: 'STRIPE' | 'MERCADOPAGO' | 'ESCUDOS'
  paymentId?: string
  escudosUsed?: number
  createdAt: Date
  updatedAt: Date
  userId: string
  courseId?: string
}

export interface Certificate {
  id: string
  title: string
  description?: string
  issuedAt: Date
  certificateUrl?: string
  userId: string
  courseId: string
}

export interface CTFChallenge {
  id: string
  title: string
  description: string
  flag: string
  points: number
  category: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  courseId?: string
}

export interface CTFSubmission {
  id: string
  flag: string
  isCorrect: boolean
  submittedAt: Date
  userId: string
  challengeId: string
}

export interface ForumPost {
  id: string
  title: string
  content: string
  isPinned: boolean
  isLocked: boolean
  createdAt: Date
  updatedAt: Date
  authorId: string
}

export interface ForumComment {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
  authorId: string
  postId: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'COURSE_ENROLLMENT' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'CERTIFICATE_ISSUED' | 'CTF_SOLVED' | 'FORUM_REPLY' | 'SYSTEM'
  isRead: boolean
  createdAt: Date
  userId: string
}

export interface UserProgress {
  id: string
  completed: boolean
  completedAt?: Date
  progress: number
  createdAt: Date
  updatedAt: Date
  userId: string
  courseId?: string
  lessonId?: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  createdAt: Date
}

export interface UserBadge {
  id: string
  earnedAt: Date
  userId: string
  badgeId: string
}

export interface Subscription {
  id: string
  name: string
  price: number
  escudos: number
  duration: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Dashboard Types
export interface DashboardStats {
  totalCourses: number
  totalStudents: number
  totalRevenue: number
  monthlyRevenue: number
  activeSubscriptions: number
  completionRate: number
}

export interface RevenueData {
  date: string
  revenue: number
  subscriptions: number
}

export interface CourseStats {
  courseId: string
  title: string
  enrollments: number
  revenue: number
  completionRate: number
  rating: number
}

// Payment Types
export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
  client_secret: string
}

export interface StripeConfig {
  publishableKey: string
  secretKey: string
}

export interface MercadoPagoConfig {
  accessToken: string
  publicKey: string
}
