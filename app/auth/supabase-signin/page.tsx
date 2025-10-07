import SupabaseAuth from '@/components/SupabaseAuth'

export default function SupabaseSignIn() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-blue-500/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              <span className="text-blue-400">Cyber</span>Team.Zone
            </h1>
            <p className="text-gray-300">Sign in with Supabase OAuth</p>
          </div>
          
          <SupabaseAuth />
        </div>
      </div>
    </div>
  )
}
