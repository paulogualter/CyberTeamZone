import Link from 'next/link'

const RoadmapPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">Roadmap</h1>
      <p className="text-lg text-gray-300 mb-8">
        Esta é a página do roadmap. Em breve, você encontrará o planejamento de funcionalidades e melhorias aqui.
      </p>
      <Link href="/" className="text-blue-400 hover:underline">
        Voltar para a página inicial
      </Link>
    </div>
  )
}

export default RoadmapPage
