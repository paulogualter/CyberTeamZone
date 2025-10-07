import { Suspense } from 'react'
import CourseCatalogWithPagination from '@/components/CourseCatalogWithPagination'
import Header from '@/components/Header'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <CourseCatalogWithPagination />
        </Suspense>
      </main>
    </div>
  )
}
