import { supabaseAdmin } from './supabase'

export interface EscudoTransaction {
  userId: string
  amount: number
  source: 'SUBSCRIPTION' | 'COURSE_PURCHASE' | 'MANUAL' | 'BONUS'
  paymentId?: string
  courseId?: string
}

/**
 * Adiciona escudos para um usuário com validade de 12 meses
 */
export async function addEscudos(transaction: EscudoTransaction) {
  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1) // 12 meses

  const { data: userEscudo, error } = await supabaseAdmin
    .from('UserEscudo')
    .insert({
      userId: transaction.userId,
      amount: transaction.amount,
      source: transaction.source,
      expiresAt: expiresAt.toISOString(),
      paymentId: transaction.paymentId,
      courseId: transaction.courseId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding escudos:', error)
    throw error
  }

  // Atualizar o total de escudos do usuário
  await updateUserEscudosTotal(transaction.userId)

  console.log(`✅ Escudos added: ${transaction.amount} for user ${transaction.userId}`)
  console.log(`🔄 Updated user escudos total`)

  return userEscudo
}

/**
 * Calcula o total de escudos válidos de um usuário
 */
export async function getUserValidEscudos(userId: string): Promise<number> {
  const { data: validEscudos, error } = await supabaseAdmin
    .from('UserEscudo')
    .select('amount')
    .eq('userId', userId)
    .eq('isUsed', false)
    .gt('expiresAt', new Date().toISOString())

  if (error) {
    console.error('Error fetching valid escudos:', error)
    return 0
  }

  return validEscudos?.reduce((total, escudo) => total + escudo.amount, 0) || 0
}

/**
 * Usa escudos para uma compra (FIFO - First In, First Out)
 */
export async function useEscudos(userId: string, amount: number): Promise<boolean> {
  const { data: validEscudos, error } = await supabaseAdmin
    .from('UserEscudo')
    .select('*')
    .eq('userId', userId)
    .eq('isUsed', false)
    .gt('expiresAt', new Date().toISOString())
    .order('createdAt', { ascending: true }) // FIFO

  if (error) {
    console.error('Error fetching valid escudos:', error)
    return false
  }

  let remainingAmount = amount
  const escudosToUse: string[] = []

  // Selecionar escudos para usar (FIFO)
  for (const escudo of validEscudos || []) {
    if (remainingAmount <= 0) break

    if (escudo.amount <= remainingAmount) {
      // Usar todo o escudo
      escudosToUse.push(escudo.id)
      remainingAmount -= escudo.amount
    } else {
      // Usar parte do escudo (criar um novo escudo com o restante)
      const usedAmount = remainingAmount
      const remainingEscudoAmount = escudo.amount - usedAmount

      // Marcar o escudo original como usado
      escudosToUse.push(escudo.id)

      // Criar um novo escudo com o valor restante
      if (remainingEscudoAmount > 0) {
        await supabaseAdmin
          .from('UserEscudo')
          .insert({
            userId: escudo.userId,
            amount: remainingEscudoAmount,
            source: escudo.source,
            expiresAt: escudo.expiresAt,
            paymentId: escudo.paymentId,
            courseId: escudo.courseId,
          })
      }

      remainingAmount = 0
    }
  }

  if (remainingAmount > 0) {
    return false // Não há escudos suficientes
  }

  // Marcar escudos como usados
  await supabaseAdmin
    .from('UserEscudo')
    .update({
      isUsed: true,
      usedAt: new Date().toISOString()
    })
    .in('id', escudosToUse)

  // Atualizar o total de escudos do usuário
  await updateUserEscudosTotal(userId)

  return true
}

/**
 * Atualiza o total de escudos do usuário na tabela User
 */
async function updateUserEscudosTotal(userId: string) {
  const totalEscudos = await getUserValidEscudos(userId)
  
  await supabaseAdmin
    .from('User')
    .update({ escudos: totalEscudos })
    .eq('id', userId)
}

/**
 * Calcula escudos proporcionais para compra direta de curso
 * Fórmula: 1 escudo = R$ 1,00
 */
export function calculateCourseEscudos(price: number): number {
  return Math.floor(price)
}

/**
 * Calcula o máximo de escudos que podem ser usados em uma compra
 * Limite: 30% do valor do curso
 */
export function calculateMaxEscudosForPurchase(coursePrice: number): number {
  return Math.floor(coursePrice * 0.30)
}

/**
 * Calcula o valor em dinheiro restante após usar escudos
 */
export function calculateRemainingAmount(coursePrice: number, escudosUsed: number): number {
  return Math.max(0, coursePrice - escudosUsed)
}

/**
 * Limpa escudos expirados (deve ser executado periodicamente)
 */
export async function cleanupExpiredEscudos() {
  const { data: expiredEscudos, error } = await supabaseAdmin
    .from('UserEscudo')
    .select('id, userId')
    .lte('expiresAt', new Date().toISOString())
    .eq('isUsed', false)

  if (error) {
    console.error('Error fetching expired escudos:', error)
    return 0
  }

  if (!expiredEscudos || expiredEscudos.length === 0) {
    return 0
  }

  // Marcar como usados (para manter histórico)
  await supabaseAdmin
    .from('UserEscudo')
    .update({
      isUsed: true,
      usedAt: new Date().toISOString()
    })
    .in('id', expiredEscudos.map(e => e.id))

  // Atualizar totais de todos os usuários afetados
  const affectedUserIdsArray = Array.from(new Set(expiredEscudos.map(e => e.userId)))
  for (const userId of affectedUserIdsArray) {
    await updateUserEscudosTotal(userId)
  }

  return expiredEscudos.length
}

/**
 * Obtém histórico de escudos de um usuário
 */
export async function getUserEscudosHistory(userId: string) {
  const { data: escudosHistory, error } = await supabaseAdmin
    .from('UserEscudo')
    .select(`
      *,
      course:Course(id, title),
      payment:Payment(id, amount, status)
    `)
    .eq('userId', userId)
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Error fetching escudos history:', error)
    return []
  }

  return escudosHistory || []
}
