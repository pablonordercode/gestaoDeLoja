export default function Home() {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-blue-600 text-white py-20 px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Bem-vindo à Nossa Loja
          </h1>
          <p className="text-lg md:text-xl mb-6">
            Aqui você encontra os melhores produtos com os melhores preços.
          </p>
          <a
            href="/produtos"
            className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition"
          >
            Ver Produtos
          </a>
        </section>
  
        {/* Destaques */}
        <section className="py-16 px-6 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            Categorias em Destaque
          </h2>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full text-3xl font-bold">
                🎧
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Eletrônicos
              </h3>
              <p className="text-gray-600 text-sm">
                Fones, caixas de som, celulares e muito mais.
              </p>
            </div>
  
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 text-green-600 flex items-center justify-center rounded-full text-3xl font-bold">
                👕
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Moda
              </h3>
              <p className="text-gray-600 text-sm">
                Roupas, calçados e acessórios para todos os estilos.
              </p>
            </div>
  
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-yellow-100 text-yellow-600 flex items-center justify-center rounded-full text-3xl font-bold">
                🏠
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Casa & Decoração
              </h3>
              <p className="text-gray-600 text-sm">
                Produtos para deixar seu lar mais bonito e confortável.
              </p>
            </div>
          </div>
        </section>
  
        {/* Call to Action */}
        <section className="bg-gray-100 py-16 px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Aproveite nossas ofertas exclusivas
          </h2>
          <p className="text-gray-600 mb-6">
            Descontos imperdíveis em diversos produtos. Não fique de fora!
          </p>
          <a
            href="/produtos"
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Explorar Agora
          </a>
        </section>
      </div>
    )
  }
  