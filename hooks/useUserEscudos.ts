import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface EscudosData {
  validEscudos: number
  history: any[]
}

export function useUserEscudos() {
  const { data: session, status } = useSession()
  const [escudosData, setEscudosData] = useState<EscudosData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Escudos da sessão (pode estar desatualizado)
  const sessionEscudos = (session?.user as any)?.escudos || 0

  // Escudos atualizados da API
  const currentEscudos = escudosData?.validEscudos || sessionEscudos

  const fetchEscudos = async () => {
    if (!session?.user?.id) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/user/escudos')
      const data = await response.json()

      if (data.success) {
        setEscudosData({
          validEscudos: data.data.validEscudos,
          history: data.data.history
        })
      } else {
        setError(data.error || 'Erro ao buscar escudos')
      }
    } catch (err) {
      setError('Erro ao buscar escudos')
      console.error('Error fetching escudos:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Buscar escudos quando a sessão estiver carregada
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchEscudos()
    }
  }, [status, session?.user?.id])

  // Função para forçar atualização
  const refreshEscudos = () => {
    fetchEscudos()
  }

  return {
    escudos: currentEscudos,
    escudosData,
    isLoading,
    error,
    refreshEscudos,
    // Indica se os dados estão atualizados
    isUpToDate: escudosData !== null
  }
}
