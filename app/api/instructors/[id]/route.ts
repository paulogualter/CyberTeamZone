import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { data: instructor, error } = await supabaseAdmin
      .from('Instructor')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !instructor) {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      instructor
    })
  } catch (error) {
    console.error('Error fetching instructor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { name, email, bio, avatar, expertise, socialLinks, isActive } = await req.json()

    // Buscar por id inicialmente
    let { data: existingInstructor, error: findError } = await supabaseAdmin
      .from('Instructor')
      .select('*')
      .eq('id', params.id)
      .maybeSingle()

    // Se não achou e é um id sintetizado (user_*), tentar resolver por email
    if ((!existingInstructor || findError) && params.id.startsWith('user_')) {
      // Remove APENAS o primeiro prefixo 'user_' para recuperar o User.id original
      let possibleUserId = params.id.replace(/^user_/, '')

      let resolvedEmail = email as string | undefined
      if (!resolvedEmail && possibleUserId) {
        const { data: userById } = await supabaseAdmin
          .from('User')
          .select('email')
          .eq('id', possibleUserId)
          .single()
        if (userById?.email) resolvedEmail = userById.email
      }

      if (resolvedEmail) {
        const { data: byEmail } = await supabaseAdmin
          .from('Instructor')
          .select('*')
          .eq('email', resolvedEmail)
          .maybeSingle()
        if (byEmail) {
          existingInstructor = byEmail
        } else {
          // Criar registro mínimo
          const { data: created } = await supabaseAdmin
            .from('Instructor')
            .insert({
              name: name || 'Instrutor',
              email: resolvedEmail,
              bio: bio ?? null,
              avatar: avatar ?? null,
              expertise: expertise ?? null,
              socialLinks: socialLinks ?? null,
              isActive: isActive !== undefined ? isActive : true,
            })
            .select('*')
            .single()
          existingInstructor = created || undefined
        }
      }
    }

    if (!existingInstructor) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 })
    }

    // Se email for alterado, garantir unicidade
    if (email && email !== existingInstructor.email) {
      const { data: emailExists } = await supabaseAdmin
        .from('Instructor')
        .select('id')
        .eq('email', email)
        .maybeSingle()
      if (emailExists) {
        return NextResponse.json({ error: 'Email already taken by another instructor' }, { status: 409 })
      }
    }

    const updatePayload: any = {
      name: name ?? existingInstructor.name,
      email: email ?? existingInstructor.email,
      bio: bio !== undefined ? bio : existingInstructor.bio,
      avatar: avatar !== undefined ? avatar : existingInstructor.avatar,
      expertise: expertise !== undefined ? expertise : existingInstructor.expertise,
      socialLinks: socialLinks !== undefined ? socialLinks : existingInstructor.socialLinks,
      isActive: isActive !== undefined ? isActive : existingInstructor.isActive,
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('Instructor')
      .update(updatePayload)
      .eq('id', existingInstructor.id)
      .select('*')
      .single()

    if (updateError || !updated) {
      return NextResponse.json({ error: 'Failed to update instructor' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      instructor: updated
    })
  } catch (error) {
    console.error('Error updating instructor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar se instrutor existe
    const { data: instructor, error } = await supabaseAdmin
      .from('Instructor')
      .select('id')
      .eq('id', params.id)
      .single()

    if (error || !instructor) {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 404 }
      )
    }

    // Verificar se há cursos vinculados
    const { data: courses } = await supabaseAdmin
      .from('Course')
      .select('id')
      .eq('instructorId', params.id)
      .limit(1)

    if (courses && courses.length > 0) {
      return NextResponse.json({ error: 'Cannot delete instructor with existing courses' }, { status: 400 })
    }

    const { error: delError } = await supabaseAdmin
      .from('Instructor')
      .delete()
      .eq('id', params.id)
    if (delError) {
      return NextResponse.json({ error: 'Failed to delete instructor' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Instructor deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting instructor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
