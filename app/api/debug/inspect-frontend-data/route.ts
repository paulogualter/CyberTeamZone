import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Frontend data inspector called')
    
    // Get raw request data
    const rawBody = await req.text()
    console.log('📝 Raw request body:', rawBody)
    
    // Try to parse JSON
    let parsedBody
    try {
      parsedBody = JSON.parse(rawBody)
      console.log('📊 Parsed JSON:', JSON.stringify(parsedBody, null, 2))
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error'
      console.log('❌ JSON parse error:', errorMessage)
      return NextResponse.json({
        error: 'Invalid JSON',
        debug: {
          rawBody,
          parseError: errorMessage
        }
      }, { status: 400 })
    }

    // Check session
    const session = await getServerSession(authOptions)
    console.log('📋 Session info:', {
      exists: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: (session?.user as any)?.role,
      sessionKeys: session ? Object.keys(session) : []
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({
        error: 'No session',
        debug: {
          session: null,
          parsedBody
        }
      }, { status: 401 })
    }

    // Check role
    const userRole = (session.user as any)?.role
    console.log('👤 User role:', userRole)
    
    if (userRole !== 'ADMIN') {
      return NextResponse.json({
        error: 'Not admin',
        debug: {
          role: userRole,
          expected: 'ADMIN',
          parsedBody
        }
      }, { status: 403 })
    }

    // Extract all possible fields
    const { 
      title, 
      description, 
      content, 
      videoUrl, 
      duration, 
      order, 
      moduleId,
      isPublished,
      // Check for any other fields
      ...otherFields
    } = parsedBody

    console.log('📊 Extracted fields:', {
      title: title,
      description: description,
      content: content,
      videoUrl: videoUrl,
      duration: duration,
      order: order,
      moduleId: moduleId,
      isPublished: isPublished,
      otherFields: Object.keys(otherFields)
    })

    // Validate required fields
    if (!title) {
      return NextResponse.json({
        error: 'Title is required',
        debug: {
          receivedFields: Object.keys(parsedBody),
          parsedBody
        }
      }, { status: 400 })
    }

    if (!moduleId) {
      return NextResponse.json({
        error: 'ModuleId is required',
        debug: {
          receivedFields: Object.keys(parsedBody),
          parsedBody
        }
      }, { status: 400 })
    }

    // Test Supabase connection
    console.log('🔍 Testing Supabase connection...')
    const { data: testData, error: testError } = await supabaseAdmin
      .from('Module')
      .select('id')
      .eq('id', moduleId)
      .single()

    if (testError) {
      console.log('❌ Supabase test error:', testError)
      return NextResponse.json({
        error: 'Supabase connection failed',
        debug: {
          supabaseError: testError.message,
          parsedBody
        }
      }, { status: 500 })
    }

    if (!testData) {
      return NextResponse.json({
        error: 'Module not found',
        debug: {
          moduleId,
          parsedBody
        }
      }, { status: 404 })
    }

    // If we get here, everything should work
    return NextResponse.json({
      success: true,
      message: 'All checks passed - lesson creation should work',
      debug: {
        session: {
          userId: session.user.id,
          userEmail: session.user.email,
          userRole: userRole
        },
        request: {
          rawBody,
          parsedBody,
          extractedFields: {
            title,
            description,
            content,
            videoUrl,
            duration,
            order,
            moduleId,
            isPublished
          }
        },
        supabase: {
          moduleFound: !!testData,
          moduleId: testData?.id
        }
      }
    })

  } catch (error) {
    console.error('❌ Inspector error:', error)
    return NextResponse.json({
      error: 'Inspector failed',
      debug: {
        error: error.message,
        stack: error.stack
      }
    }, { status: 500 })
  }
}
