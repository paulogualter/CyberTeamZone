'use client'

import { useState, useEffect, useCallback } from 'react'

interface Lesson {
  id: string
  title: string
  content: string
  videoUrl?: string
  duration?: number
  order: number
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'PRACTICAL' | 'CTF'
  isPublished: boolean
  moduleId: string
  createdAt: string
  updatedAt: string
}

interface UseLessonsProps {
  moduleId: string
}

interface UseLessonsReturn {
  lessons: Lesson[]
  isLoading: boolean
  error: string | null
  createLesson: (lesson: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Lesson>
  updateLesson: (lesson: Lesson) => Promise<Lesson>
  deleteLesson: (lessonId: string) => Promise<void>
  refreshLessons: () => Promise<void>
}

export function useLessons({ moduleId }: UseLessonsProps): UseLessonsReturn {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLessons = useCallback(async () => {
    if (!moduleId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/lessons-crud?moduleId=${moduleId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar aulas')
      }

      setLessons(data.lessons || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao carregar aulas:', err)
    } finally {
      setIsLoading(false)
    }
  }, [moduleId])

  const createLesson = useCallback(async (lessonData: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lesson> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/lessons-crud', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lessonData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar aula')
      }

      const newLesson = data.lesson
      setLessons(prev => [...prev, newLesson])
      return newLesson
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateLesson = useCallback(async (lesson: Lesson): Promise<Lesson> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/lessons-crud', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lesson),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar aula')
      }

      const updatedLesson = data.lesson
      setLessons(prev => prev.map(l => l.id === lesson.id ? updatedLesson : l))
      return updatedLesson
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteLesson = useCallback(async (lessonId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/lessons-crud?id=${lessonId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir aula')
      }

      setLessons(prev => prev.filter(l => l.id !== lessonId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshLessons = useCallback(async () => {
    await fetchLessons()
  }, [fetchLessons])

  // Carregar aulas quando o moduleId mudar
  useEffect(() => {
    fetchLessons()
  }, [fetchLessons])

  return {
    lessons,
    isLoading,
    error,
    createLesson,
    updateLesson,
    deleteLesson,
    refreshLessons,
  }
}
