import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const instructor = await prisma.instructor.findUnique({
      where: { id: params.id },
      include: {
        courses: {
          select: {
            id: true,
            title: true,
            isPublished: true
          }
        }
      }
    })

    if (!instructor) {
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

    // Check if instructor exists
    const existingInstructor = await prisma.instructor.findUnique({
      where: { id: params.id }
    })

    if (!existingInstructor) {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 404 }
      )
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingInstructor.email) {
      const emailExists = await prisma.instructor.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already taken by another instructor' },
          { status: 409 }
        )
      }
    }

    const instructor = await prisma.instructor.update({
      where: { id: params.id },
      data: {
        name: name || existingInstructor.name,
        email: email || existingInstructor.email,
        bio: bio !== undefined ? bio : existingInstructor.bio,
        avatar: avatar !== undefined ? avatar : existingInstructor.avatar,
        expertise: expertise !== undefined ? expertise : existingInstructor.expertise,
        socialLinks: socialLinks !== undefined ? socialLinks : existingInstructor.socialLinks,
        isActive: isActive !== undefined ? isActive : existingInstructor.isActive
      }
    })

    return NextResponse.json({
      success: true,
      instructor
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
    // Check if instructor has courses
    const instructorWithCourses = await prisma.instructor.findUnique({
      where: { id: params.id },
      include: {
        courses: true
      }
    })

    if (!instructorWithCourses) {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 404 }
      )
    }

    if (instructorWithCourses.courses.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete instructor with existing courses' },
        { status: 400 }
      )
    }

    await prisma.instructor.delete({
      where: { id: params.id }
    })

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
