import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const instructor = searchParams.get('instructor')

    const skip = (page - 1) * limit

    // Get user session to check enrollments
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Build where clause
    const where: any = {
      isPublished: true,
      status: 'ACTIVE'
    }

    if (category && category !== 'all') {
      where.categoryId = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (instructor) {
      where.instructor = {
        name: { contains: instructor, mode: 'insensitive' }
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.course.count({ where })

    // Get courses with pagination
    const courses = await prisma.course.findMany({
      where,
      include: {
        instructor: true,
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // Get user enrollments if logged in
    let userEnrollments: any[] = []
    if (userId) {
      userEnrollments = await prisma.enrollment.findMany({
        where: {
          userId: userId,
          isActive: true
        },
        select: {
          courseId: true,
          progress: true
        }
      })
    }

    // Create enrollment map for quick lookup
    const enrollmentMap = new Map()
    userEnrollments.forEach(enrollment => {
      enrollmentMap.set(enrollment.courseId, enrollment.progress)
    })

    // Add enrollment info to courses
    const coursesWithEnrollment = courses.map(course => ({
      ...course,
      isEnrolled: enrollmentMap.has(course.id),
      progress: enrollmentMap.get(course.id) || 0
    }))

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({ 
      courses: coursesWithEnrollment,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}
