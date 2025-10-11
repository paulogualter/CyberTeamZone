import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Simple debug endpoint called')
    
    const { searchParams } = new URL(req.url)
    const test = searchParams.get('test') || 'basic'
    
    console.log('📋 Test type:', test)

    const results: any = {
      timestamp: new Date().toISOString(),
      test,
      success: true,
      tests: {}
    }

    // Test 1: Basic connectivity
    if (test === 'basic' || test === 'all') {
      try {
        console.log('🔍 Testing basic connectivity...')
        results.tests.basic = {
          success: true,
          message: 'Endpoint is working',
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        results.tests.basic = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Test 2: Session check
    if (test === 'session' || test === 'all') {
      try {
        console.log('🔍 Testing session...')
        const session = await getServerSession(authOptions)
        
        results.tests.session = {
          success: true,
          sessionExists: !!session,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          userRole: (session?.user as any)?.role,
          sessionExpires: session?.expires
        }
        console.log('📊 Session result:', results.tests.session)
      } catch (error) {
        results.tests.session = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Test 3: Supabase connection
    if (test === 'supabase' || test === 'all') {
      try {
        console.log('🔍 Testing Supabase connection...')
        const { data, error } = await supabaseAdmin
          .from('User')
          .select('count')
          .limit(1)
        
        results.tests.supabase = {
          success: !error,
          error: error?.message,
          data: data,
          connectionWorking: !error
        }
        console.log('📊 Supabase result:', results.tests.supabase)
      } catch (error) {
        results.tests.supabase = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Test 4: Module query
    if (test === 'module' || test === 'all') {
      try {
        console.log('🔍 Testing module query...')
        const { data, error } = await supabaseAdmin
          .from('Module')
          .select('id, title, courseId')
          .limit(5)
        
        results.tests.module = {
          success: !error,
          error: error?.message,
          count: data?.length || 0,
          modules: data || []
        }
        console.log('📊 Module result:', results.tests.module)
      } catch (error) {
        results.tests.module = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Test 5: Lesson query
    if (test === 'lesson' || test === 'all') {
      try {
        console.log('🔍 Testing lesson query...')
        const { data, error } = await supabaseAdmin
          .from('Lesson')
          .select('id, title, moduleId')
          .limit(5)
        
        results.tests.lesson = {
          success: !error,
          error: error?.message,
          count: data?.length || 0,
          lessons: data || []
        }
        console.log('📊 Lesson result:', results.tests.lesson)
      } catch (error) {
        results.tests.lesson = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Test 6: Specific module query
    if (test === 'specific-module' || test === 'all') {
      try {
        console.log('🔍 Testing specific module query...')
        const moduleId = 'module_1760134320837_r7frihu3'
        const { data, error } = await supabaseAdmin
          .from('Module')
          .select('id, title, courseId')
          .eq('id', moduleId)
          .single()
        
        results.tests.specificModule = {
          success: !error,
          error: error?.message,
          moduleId,
          module: data || null,
          found: !!data
        }
        console.log('📊 Specific module result:', results.tests.specificModule)
      } catch (error) {
        results.tests.specificModule = {
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
    console.error('❌ Error in simple debug:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        debug: {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}