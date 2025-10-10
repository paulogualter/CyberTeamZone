import Link from 'next/link'

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">Termos de Uso</h1>
      <p className="text-lg text-gray-300 mb-8">
        Esta é a página dos termos de uso. Em breve, você encontrará as condições de uso da plataforma aqui.
      </p>
      <Link href="/" className="text-blue-400 hover:underline">
        Voltar para a página inicial
      </Link>
    </div>
  )
}

export default TermsPage
