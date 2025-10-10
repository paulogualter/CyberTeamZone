import Link from 'next/link'

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">Blog</h1>
      <p className="text-lg text-gray-300 mb-8">
        Esta é a página do blog. Em breve, você encontrará artigos e tutoriais sobre segurança da informação aqui.
      </p>
      <Link href="/" className="text-blue-400 hover:underline">
        Voltar para a página inicial
      </Link>
    </div>
  )
}

export default BlogPage
