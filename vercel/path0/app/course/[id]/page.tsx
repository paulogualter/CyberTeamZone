'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function CourseRedirect() {
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    const run = async () => {
      if (!params?.id) return
      try {
        const res = await fetch(`/api/admin/courses/${params.id}/content`)
        const data = await res.json()
        if (res.ok && data?.success) {
          const firstLesson = data.course?.modules?.[0]?.lessons?.[0]
          if (firstLesson) {
            router.replace(`/course/${params.id}/lesson/${firstLesson.id}`)
            return
          }
        }
      } catch {}
      // Fallback: voltar para catálogo
      router.replace('/dashboard')
    }
    run()
  }, [params?.id, router])

  return null
}


