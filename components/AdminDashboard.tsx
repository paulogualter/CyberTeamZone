'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
  TrophyIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  CogIcon,
  KeyIcon,
  ShieldCheckIcon,
  BellIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import Breadcrumb from './Breadcrumb'

// Removed mock data - using real API data only

interface StudentMetrics {
  totalStudents: number
  studentsWithActiveSubscription: number
  studentsWithoutActiveSubscription: number
}

function StudentsTab() {
  const [metrics, setMetrics] = useState<StudentMetrics>({
    totalStudents: 0,
    studentsWithActiveSubscription: 0,
    studentsWithoutActiveSubscription: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudentMetrics()
  }, [])

  const fetchStudentMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/students?page=1&limit=1')
      const data = await response.json()

      if (data.success && data.metrics) {
        setMetrics(data.metrics)
      }
    } catch (error) {
      console.error('Error fetching student metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Carregando métricas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/admin' },
            { label: 'Alunos', current: true }
          ]}
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Gerenciar Alunos</h2>
        <div className="flex space-x-3">
          <a
            href="/admin/students"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <UsersIcon className="h-5 w-5" />
            <span>Gerenciar Alunos</span>
          </a>
        </div>
      </div>

      {/* Student Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total de Alunos</p>
              <p className="text-3xl font-bold">{metrics.totalStudents}</p>
            </div>
            <UserGroupIcon className="h-12 w-12 text-blue-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Com Assinatura Ativa</p>
              <p className="text-3xl font-bold">{metrics.studentsWithActiveSubscription}</p>
              <p className="text-green-200 text-xs mt-1">
                {metrics.totalStudents > 0 
                  ? `${Math.round((metrics.studentsWithActiveSubscription / metrics.totalStudents) * 100)}% do total`
                  : '0%'
                }
              </p>
            </div>
            <CheckBadgeIcon className="h-12 w-12 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Sem Assinatura Ativa</p>
              <p className="text-3xl font-bold">{metrics.studentsWithoutActiveSubscription}</p>
              <p className="text-orange-200 text-xs mt-1">
                {metrics.totalStudents > 0 
                  ? `${Math.round((metrics.studentsWithoutActiveSubscription / metrics.totalStudents) * 100)}% do total`
                  : '0%'
                }
              </p>
            </div>
            <ExclamationTriangleIcon className="h-12 w-12 text-orange-200" />
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/students"
            className="bg-slate-600 hover:bg-slate-500 rounded-lg p-4 text-center transition-colors"
          >
            <UsersIcon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-white font-medium">Ver Todos os Alunos</p>
            <p className="text-gray-400 text-sm">Lista completa e gerenciamento</p>
          </a>
          
          <a
            href="/admin/users"
            className="bg-slate-600 hover:bg-slate-500 rounded-lg p-4 text-center transition-colors"
          >
            <ShieldCheckIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-white font-medium">Gerenciar Usuários</p>
            <p className="text-gray-400 text-sm">Admins e instrutores</p>
          </a>
          
          <a
            href="/admin/notifications"
            className="bg-slate-600 hover:bg-slate-500 rounded-lg p-4 text-center transition-colors"
          >
            <BellIcon className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-white font-medium">Notificações</p>
            <p className="text-gray-400 text-sm">Popup e alertas</p>
          </a>
          
          <div className="bg-slate-600 rounded-lg p-4 text-center">
            <TrophyIcon className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <p className="text-white font-medium">Relatórios</p>
            <p className="text-gray-400 text-sm">Em breve</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('year')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-blue-500/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Dashboard Administrativo
            </h1>
            <p className="text-gray-300">
              Gerencie sua plataforma de cibersegurança
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-slate-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="week">Última Semana</option>
              <option value="month">Último Mês</option>
              <option value="year">Último Ano</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-green-500/20">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-400">Receita Total</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-blue-500/20">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-400">Total de Alunos</p>
              <p className="text-2xl font-bold text-white">{formatNumber(0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-400">Cursos Ativos</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-yellow-500/20">
          <div className="flex items-center">
            <TrophyIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-400">Taxa de Conclusão</p>
              <p className="text-2xl font-bold text-white">0%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-blue-500/20"
      >
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Visão Geral', icon: ChartBarIcon },
              { id: 'courses', name: 'Cursos', icon: BookOpenIcon },
              { id: 'students', name: 'Alunos', icon: UsersIcon },
              { id: 'users', name: 'Usuários', icon: UsersIcon },
              { id: 'revenue', name: 'Receita', icon: CurrencyDollarIcon },
              { id: 'settings', name: 'Configurações', icon: CogIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Revenue Chart */}
              <div className="bg-slate-700/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Receita Mensal</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Course Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-700/50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Performance dos Cursos</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }} 
                      />
                      <Bar dataKey="enrollments" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Distribuição de Planos</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[].map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill="#3B82F6" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Gerenciar Cursos</h2>
                <div className="flex space-x-3">
                  <a
                    href="/admin/courses"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <BookOpenIcon className="h-5 w-5" />
                    <span>Gerenciar Cursos</span>
                  </a>
                  <a
                    href="/admin/courses-approval"
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <EyeIcon className="h-5 w-5" />
                    <span>Aprovar Cursos</span>
                  </a>
                  <a
                    href="/admin/instructors"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <UsersIcon className="h-5 w-5" />
                    <span>Gerenciar Instrutores</span>
                  </a>
                  <a
                    href="/admin/courses"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>Novo Curso</span>
                  </a>
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Curso
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Inscrições
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Receita
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Conclusão
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {[].map((course: any, index: number) => (
                      <tr key={index} className="hover:bg-slate-600/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">Nenhum curso</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          0
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatCurrency(0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          0%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-400 hover:text-blue-300">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="text-yellow-400 hover:text-yellow-300">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <StudentsTab />
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Gerenciar Usuários</h2>
                <div className="flex space-x-3">
                  <a
                    href="/admin/users"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <ShieldCheckIcon className="h-5 w-5" />
                    <span>Admins & Instrutores</span>
                  </a>
                  <a
                    href="/admin/students"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <UsersIcon className="h-5 w-5" />
                    <span>Gerenciar Alunos</span>
                  </a>
                  <a
                    href="/admin/notifications"
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <BellIcon className="h-5 w-5" />
                    <span>Notificações Popup</span>
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-700/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Modificar Roles</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Altere as permissões dos usuários entre Estudante, Instrutor e Administrador
                  </p>
                  <div className="flex space-x-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Estudante</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Instrutor</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Admin</span>
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Redefinir Senhas</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Redefina senhas de usuários com segurança e notifique-os por email
                  </p>
                  <div className="text-yellow-400 text-sm">
                    <KeyIcon className="h-4 w-4 inline mr-1" />
                    Senha temporária gerada
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Status de Conta</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Ative ou desative contas de usuários conforme necessário
                  </p>
                  <div className="flex space-x-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Ativo</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Inativo</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'revenue' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Relatórios de Receita</h2>
              <p className="text-gray-300">Em breve: Relatórios detalhados de receita e pagamentos</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Configurações do Sistema</h2>
              <p className="text-gray-300">Em breve: Configurações avançadas da plataforma</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
