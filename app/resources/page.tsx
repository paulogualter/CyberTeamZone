import Link from 'next/link'

const ResourcesPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">Recursos</h1>
      <p className="text-lg text-gray-300 mb-8">
        Esta é a página de recursos. Em breve, você encontrará ferramentas, templates e materiais de estudo aqui.
      </p>
      <Link href="/" className="text-blue-400 hover:underline">
        Voltar para a página inicial
      </Link>
    </div>
  )
}

export default ResourcesPage
