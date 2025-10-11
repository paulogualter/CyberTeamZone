'use client'

import React, { useState } from 'react'
import { Plus, Edit, Trash2, Play, Eye, EyeOff, Clock, FileText, HelpCircle, Shield, Target } from 'lucide-react'
import LessonModal from './LessonModal'
import { useLessons } from '@/hooks/useLessons'

interface LessonListProps {
  moduleId: string
  moduleTitle?: string
}

export default function LessonList({ moduleId, moduleTitle }: LessonListProps) {
  const { lessons, isLoading, error, createLesson, updateLesson, deleteLesson } = useLessons({ moduleId })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<any>(null)

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Play className="h-4 w-4 text-blue-600" />
      case 'TEXT':
        return <FileText className="h-4 w-4 text-green-600" />
      case 'QUIZ':
        return <HelpCircle className="h-4 w-4 text-purple-600" />
      case 'PRACTICAL':
        return <Shield className="h-4 w-4 text-orange-600" />
      case 'CTF':
        return <Target className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getLessonTypeLabel = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return 'Vídeo'
      case 'TEXT':
        return 'Texto'
      case 'QUIZ':
        return 'Quiz'
      case 'PRACTICAL':
        return 'Prática'
      case 'CTF':
        return 'CTF'
      default:
        return 'Aula'
    }
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}min`
    }
    return `${mins}min`
  }

  const handleCreateLesson = async (lessonData: any) => {
    try {
      await createLesson(lessonData)
      setIsModalOpen(false)
    } catch (error) {
      console.error('Erro ao criar aula:', error)
    }
  }

  const handleUpdateLesson = async (lessonData: any) => {
    try {
      await updateLesson(lessonData)
      setIsModalOpen(false)
      setEditingLesson(null)
    } catch (error) {
      console.error('Erro ao atualizar aula:', error)
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await deleteLesson(lessonId)
    } catch (error) {
      console.error('Erro ao excluir aula:', error)
    }
  }

  const handleEditLesson = (lesson: any) => {
    setEditingLesson(lesson)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingLesson(null)
  }

  const nextOrder = lessons.length > 0 ? Math.max(...lessons.map(l => l.order)) + 1 : 1

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-300">Carregando aulas...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
        <p className="font-medium">Erro ao carregar aulas</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {moduleTitle ? `Aulas - ${moduleTitle}` : 'Aulas do Módulo'}
          </h2>
          <p className="text-gray-300 mt-1">
            {lessons.length} {lessons.length === 1 ? 'aula' : 'aulas'} cadastrada{lessons.length === 1 ? '' : 's'}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Aula</span>
        </button>
      </div>

      {/* Lessons List */}
      {lessons.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-white">Nenhuma aula cadastrada</h3>
          <p className="mt-1 text-sm text-gray-300">
            Comece criando a primeira aula deste módulo.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Aula
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {lessons
            .sort((a, b) => a.order - b.order)
            .map((lesson) => (
              <div
                key={lesson.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:shadow-lg hover:border-slate-600 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Order Badge */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {lesson.order}
                      </div>
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        {getLessonTypeIcon(lesson.type)}
                        <h3 className="text-lg font-medium text-white truncate">
                          {lesson.title}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-gray-300">
                          {getLessonTypeLabel(lesson.type)}
                        </span>
                        {lesson.isPublished ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white">
                            <Eye className="h-3 w-3 mr-1" />
                            Publicada
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-600 text-white">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Rascunho
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-300">
                        {lesson.duration && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDuration(lesson.duration)}</span>
                          </div>
                        )}
                        {lesson.videoUrl && (
                          <div className="flex items-center space-x-1">
                            <Play className="h-4 w-4" />
                            <span>Com vídeo</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <span>Criada em {new Date(lesson.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>

                      {lesson.content && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-300 line-clamp-2">
                            {lesson.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                            {lesson.content.length > 150 && '...'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditLesson(lesson)}
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-600/20 rounded-lg transition-colors"
                      title="Editar aula"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                      title="Excluir aula"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Modal */}
      <LessonModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingLesson ? handleUpdateLesson : handleCreateLesson}
        onDelete={handleDeleteLesson}
        lesson={editingLesson}
        moduleId={moduleId}
        nextOrder={nextOrder}
      />
    </div>
  )
}
