import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserValidEscudos, getUserEscudosHistory, addEscudos } from '@/lib/escudos'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Obter escudos do usuário
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const validEscudos = await getUserValidEscudos(session.user.id)
    const history = await getUserEscudosHistory(session.user.id)

    return NextResponse.json({
      success: true,
      data: {
        validEscudos,
        history
      }
    })
  } catch (error) {
    console.error('Error fetching user escudos:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Adicionar escudos manualmente (apenas admin)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId, amount, reason } = await req.json()

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json({ 
        error: 'User ID and positive amount are required' 
      }, { status: 400 })
    }

    // Verificar se o usuário existe
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Adicionar escudos
    await addEscudos({
      userId,
      amount,
      source: 'MANUAL'
    })

    return NextResponse.json({
      success: true,
      message: `Added ${amount} escudos to ${targetUser.name || targetUser.email}`,
      data: {
        userId,
        amount,
        reason: reason || 'Manual addition by admin'
      }
    })
  } catch (error) {
    console.error('Error adding escudos:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
