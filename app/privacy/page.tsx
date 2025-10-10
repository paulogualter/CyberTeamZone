import Link from 'next/link'

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">Política de Privacidade</h1>
      <p className="text-lg text-gray-300 mb-8">
        Esta é a página da política de privacidade. Em breve, você encontrará informações sobre como protegemos seus dados aqui.
      </p>
      <Link href="/" className="text-blue-400 hover:underline">
        Voltar para a página inicial
      </Link>
    </div>
  )
}

export default PrivacyPage
