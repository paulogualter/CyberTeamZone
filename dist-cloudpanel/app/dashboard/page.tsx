'use client'

import { motion } from 'framer-motion'
import Header from '@/components/Header'
import UserDashboard from '@/components/UserDashboard'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus'

export default function Dashboard() {
  const { isLoading } = useSubscriptionStatus()

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <UserDashboard />
      </main>
    </div>
  )
}
