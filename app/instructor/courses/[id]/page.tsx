'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function EditCoursePage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const courseId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({
    title: '',
    shortDescription: '',
    description: '',
    price: 0,
    escudosPrice: 0,
    duration: 0,
    categoryId: '',
    coverImage: '',
    status: 'ACTIVE'
  })

  useEffect(() => {
    if (!courseId) return
    fetchCourse()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  async function fetchCourse() {
    try {
      setLoading(true)
      const res = await fetch(`/api/instructor/courses/${courseId}`)
      const data = await res.json()
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Falha ao carregar curso')
      }
      const c = data.course
      setForm({
        title: c.title || '',
        shortDescription: c.shortDescription || '',
        description: c.description || '',
        price: c.price || 0,
        escudosPrice: c.escudosPrice || 0,
        duration: c.duration || 0,
        categoryId: c.categoryId || '',
        coverImage: c.coverImage || '',
        status: c.status || 'ACTIVE'
      })
    } catch (e: any) {
      toast.error(e.message || 'Erro ao carregar curso')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true)
      const res = await fetch(`/api/instructor/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Falha ao salvar curso')
      }
      toast.success('Curso atualizado!')
      router.push('/instructor/courses')
    } catch (e: any) {
      toast.error(e.message || 'Erro ao salvar curso')
    } finally {
      setSaving(false)
    }
  }

  async function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande (máx 5MB)')
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem válida')
      return
    }
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'courses')
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!data?.success) throw new Error(data?.error || 'Falha no upload')
      setForm((prev: any) => ({ ...prev, coverImage: data.url }))
      toast.success('Imagem enviada')
    } catch (e: any) {
      toast.error(e.message || 'Erro no upload')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-white">Editar Curso</h1>
          <p className="text-gray-300">Atualize as informações do seu curso</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSave} className="space-y-6 bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Título</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Descrição Curta</label>
            <input
              type="text"
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Escudos</label>
              <input
                type="number"
                value={form.escudosPrice}
                onChange={(e) => setForm({ ...form, escudosPrice: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duração (h)</label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Imagem de Capa</label>
            {form.coverImage && (
              <div className="mb-3">
                <img src={form.coverImage} alt="cover" className="w-64 h-36 object-cover rounded" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleCover}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push('/instructor/courses')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
