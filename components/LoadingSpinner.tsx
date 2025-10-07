export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <div className="spinner"></div>
        <p className="text-gray-400">Carregando...</p>
      </div>
    </div>
  )
}
