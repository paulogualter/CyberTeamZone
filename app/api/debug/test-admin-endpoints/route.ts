import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Debug admin endpoints endpoint called')
    
    const { searchParams } = new URL(req.url)
    const testType = searchParams.get('test') || 'all'
    const moduleId = searchParams.get('moduleId') || 'module_1760134320837_r7frihu3'
    const courseId = searchParams.get('courseId') || 'course_1760131262324_j54dte5i'
    
    console.log('📋 Test parameters:', { testType, moduleId, courseId })

    // Test 1: Check session
    const session = await getServerSession(authOptions)
    console.log('📋 Session exists:', !!session)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'No session found',
        debug: {
          sessionExists: false,
          userId: undefined,
          userRole: undefined,
          testType
        }
      }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    console.log('👤 User role:', userRole)
    
    if (!['ADMIN', 'INSTRUCTOR'].includes(userRole)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions',
        debug: {
          sessionExists: true,
          userId: session.user.id,
          userRole,
          requiredRoles: ['ADMIN', 'INSTRUCTOR'],
          testType
        }
      }, { status: 403 })
    }

    const results: any = {
      sessionExists: true,
      userId: session.user.id,
      userRole,
      testType,
      tests: {}
    }

    // Test 2: Admin modules GET
    if (testType === 'all' || testType === 'admin-modules-get') {
      try {
        console.log('🔍 Testing admin modules GET...')
        const { data: modules, error: modulesErr } = await supabaseAdmin
          .from('Module')
          .select('*')
          .eq('courseId', courseId)
          .order('order', { ascending: true })

        results.tests.adminModulesGet = {
          success: !modulesErr,
          error: modulesErr?.message,
          count: modules?.length || 0,
          modules: modules || []
        }
        console.log('📊 Admin modules GET result:', results.tests.adminModulesGet)
      } catch (error) {
        results.tests.adminModulesGet = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Test 3: Admin module GET by ID
    if (testType === 'all' || testType === 'admin-module-get') {
      try {
        console.log('🔍 Testing admin module GET by ID...')
        const { data: module, error: moduleErr } = await supabaseAdmin
          .from('Module')
          .select(`
            *,
            lessons:Lesson(*),
            course:Course(id, title, instructorId, instructor:User(name, email))
          `)
          .eq('id', moduleId)
          .single()

        results.tests.adminModuleGet = {
          success: !moduleErr,
          error: moduleErr?.message,
          module: module || null,
          lessonsCount: module?.lessons?.length || 0
        }
        console.log('📊 Admin module GET result:', results.tests.adminModuleGet)
      } catch (error) {
        results.tests.adminModuleGet = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Test 4: Admin lessons GET
    if (testType === 'all' || testType === 'admin-lessons-get') {
      try {
        console.log('🔍 Testing admin lessons GET...')
        const { data: lessons, error: lessonsErr } = await supabaseAdmin
          .from('Lesson')
          .select('*')
          .eq('moduleId', moduleId)
          .order('order', { ascending: true })

        results.tests.adminLessonsGet = {
          success: !lessonsErr,
          error: lessonsErr?.message,
          count: lessons?.length || 0,
          lessons: lessons || []
        }
        console.log('📊 Admin lessons GET result:', results.tests.adminLessonsGet)
      } catch (error) {
        results.tests.adminLessonsGet = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Test 5: Universal modules GET
    if (testType === 'all' || testType === 'universal-modules-get') {
      try {
        console.log('🔍 Testing universal modules GET...')
        const { data: modules, error: modulesErr } = await supabaseAdmin
          .from('Module')
          .select(`
            *,
            lessons:Lesson(*),
            course:Course(id, title, instructorId)
          `)
          .eq('courseId', courseId)
          .order('order', { ascending: true })

        results.tests.universalModulesGet = {
          success: !modulesErr,
          error: modulesErr?.message,
          count: modules?.length || 0,
          modules: modules || []
        }
        console.log('📊 Universal modules GET result:', results.tests.universalModulesGet)
      } catch (error) {
        results.tests.universalModulesGet = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Test 6: Universal lessons GET
    if (testType === 'all' || testType === 'universal-lessons-get') {
      try {
        console.log('🔍 Testing universal lessons GET...')
        const { data: lessons, error: lessonsErr } = await supabaseAdmin
          .from('Lesson')
          .select(`
            *,
            module:Module(id, title, courseId, course:Course(id, title, instructorId))
          `)
          .eq('moduleId', moduleId)
          .order('order', { ascending: true })

        results.tests.universalLessonsGet = {
          success: !lessonsErr,
          error: lessonsErr?.message,
          count: lessons?.length || 0,
          lessons: lessons || []
        }
        console.log('📊 Universal lessons GET result:', results.tests.universalLessonsGet)
      } catch (error) {
        results.tests.universalLessonsGet = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Test 7: Test lesson creation (simulation)
    if (testType === 'all' || testType === 'lesson-creation-test') {
      try {
        console.log('🔍 Testing lesson creation simulation...')
        
        // Check if module exists
        const { data: module, error: moduleErr } = await supabaseAdmin
          .from('Module')
          .select('id, courseId')
          .eq('id', moduleId)
          .single()

        if (moduleErr || !module) {
          results.tests.lessonCreationTest = {
            success: false,
            error: 'Module not found',
            moduleError: moduleErr?.message
          }
        } else {
          // Check course permissions for instructors
          if (userRole === 'INSTRUCTOR') {
            const { data: course, error: courseErr } = await supabaseAdmin
              .from('Course')
              .select('id, instructorId')
              .eq('id', module.courseId)
              .single()

            if (courseErr || !course || course.instructorId !== session.user.id) {
              results.tests.lessonCreationTest = {
                success: false,
                error: 'Course access denied',
                courseError: courseErr?.message,
                courseInstructorId: course?.instructorId,
                sessionUserId: session.user.id
              }
            } else {
              results.tests.lessonCreationTest = {
                success: true,
                message: 'Can create lesson',
                moduleId,
                courseId: module.courseId
              }
            }
          } else {
            results.tests.lessonCreationTest = {
              success: true,
              message: 'Admin can create lesson',
              moduleId,
              courseId: module.courseId
            }
          }
        }
        console.log('📊 Lesson creation test result:', results.tests.lessonCreationTest)
      } catch (error) {
        results.tests.lessonCreationTest = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    console.log('✅ All tests completed')
    return NextResponse.json({
      success: true,
      debug: results
    })

  } catch (error) {
    console.error('❌ Error in debug admin endpoints:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        debug: {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        }
      },
      { status: 500 }
    )
  }
}
