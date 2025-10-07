import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Get course with modules and lessons
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: true,
        category: true,
        modules: {
          include: {
            lessons: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Get user progress
    const userProgress = await prisma.userProgress.findMany({
      where: {
        userId: session.user.id,
        lesson: {
          module: {
            courseId: courseId
          }
        }
      },
      include: {
        lesson: {
          include: {
            module: true
          }
        }
      }
    })

    // Calculate progress
    const totalLessons = course.modules.reduce((acc: number, module: any) => acc + module.lessons.length, 0)
    const completedLessons = userProgress.filter((progress: any) => progress.completed).length
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    // Create progress map
    const progressMap = new Map()
    userProgress.forEach((progress: any) => {
      progressMap.set(progress.lessonId, {
        completed: progress.completed,
        watchedTime: progress.watchedTime || 0,
        lastWatched: progress.updatedAt
      })
    })

    return NextResponse.json({
      success: true,
      course,
      progress: {
        percentage: progressPercentage,
        completedLessons,
        totalLessons,
        progressMap: Object.fromEntries(progressMap)
      }
    })
  } catch (error) {
    console.error('Error fetching course progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { lessonId, completed, watchedTime, videoDuration } = await req.json()

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 })
    }

    // Get lesson details to check if it has video
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { 
        id: true, 
        type: true, 
        videoUrl: true 
      }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Determine if lesson should be marked as completed
    let shouldComplete = completed || false

    // If lesson has video, check if 90% was watched
    if (lesson.type === 'VIDEO' && lesson.videoUrl && videoDuration) {
      const watchedPercentage = (watchedTime / videoDuration) * 100
      shouldComplete = watchedPercentage >= 90
    } 
    // If lesson has no video, mark as completed automatically
    else if (lesson.type !== 'VIDEO' || !lesson.videoUrl) {
      shouldComplete = true
    }

    // Upsert user progress
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lessonId
        }
      },
      update: {
        completed: shouldComplete,
        watchedTime: watchedTime || 0,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        lessonId: lessonId,
        completed: shouldComplete,
        watchedTime: watchedTime || 0
      }
    })

    return NextResponse.json({
      success: true,
      progress,
      autoCompleted: shouldComplete && !completed
    })
  } catch (error) {
    console.error('Error updating course progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
