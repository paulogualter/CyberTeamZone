'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import LessonList from '@/components/LessonList'
import { Plus, BookOpen, Users, Clock } from 'lucide-react'

export default function ModuleLessonsPage() {
  const params = useParams()
  const moduleId = params.moduleId as string
  const [moduleInfo, setModuleInfo] = useState({
    title: 'Módulo de Segurança',
    description: 'Aprenda os fundamentos da segurança da informação',
    courseTitle: 'Curso de Cibersegurança',
    instructorName: 'João Silva',
    totalLessons: 0,
    totalDuration: 0
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <nav className="flex" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-4">
                    <li>
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 text-gray-400" />
                        <span className="ml-2 text-sm font-medium text-gray-500">
                          {moduleInfo.courseTitle}
                        </span>
                      </div>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <span className="text-gray-400">/</span>
                        <span className="ml-4 text-sm font-medium text-gray-900">
                          {moduleInfo.title}
                        </span>
                      </div>
                    </li>
                  </ol>
                </nav>
                <h1 className="mt-2 text-3xl font-bold text-gray-900">
                  {moduleInfo.title}
                </h1>
                <p className="mt-1 text-lg text-gray-600">
                  {moduleInfo.description}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Instrutor</p>
                  <p className="font-medium text-gray-900">{moduleInfo.instructorName}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total de Aulas
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {moduleInfo.totalLessons}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Duração Total
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {moduleInfo.totalDuration}min
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Estudantes
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          0
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LessonList 
          moduleId={moduleId}
          moduleTitle={moduleInfo.title}
        />
      </div>
    </div>
  )
}
