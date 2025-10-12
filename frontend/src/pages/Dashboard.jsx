import { useState, useEffect } from "react"
import api from "../services/api"
import { useNotification } from "../hooks/useNotification"
import NotificationContainer from "../components/NotificationContainer"

export default function Dashboard() {
  const { notifications, showSuccess, showError, removeNotification } = useNotification()
  const [produtos, setProdutos] = useState([])
  const [produtosFiltrados, setProdutosFiltrados] = useState([])
  const [termoPesquisa, setTermoPesquisa] = useState("")
  const [vendas, setVendas] = useState([])
  const [loading, setLoading] = useState(true)
  const [paginaAtual, setPaginaAtual] = useState(1)
  const vendasPorPagina = 5
  
  // Estados para registro de venda
  const [mostrarRegistrarVenda, setMostrarRegistrarVenda] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [quantidadeVenda, setQuantidadeVenda] = useState(1)
  const [clienteNome, setClienteNome] = useState("")
  const [valorTotal, setValorTotal] = useState(0)

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    filtrarProdutos()
  }, [termoPesquisa, produtos])

  useEffect(() => {
    if (produtoSelecionado && quantidadeVenda) {
      setValorTotal(produtoSelecionado.preco * quantidadeVenda)
    }
  }, [produtoSelecionado, quantidadeVenda])

  const carregarDados = async () => {
    try {
      const [produtosRes, vendasRes] = await Promise.all([
        api.get("/produtos/todosProdutos"),
        api.get("/vendas/todasVendas") // Assumindo que existe este endpoint
      ])
      
      setProdutos(produtosRes.data.data || [])
      setVendas(vendasRes.data.data || [])
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      // Se não existir endpoint de vendas, carregar apenas produtos
      try {
        const produtosRes = await api.get("/produtos/todosProdutos")
        setProdutos(produtosRes.data.data || [])
      } catch (produtosError) {
        console.error("Erro ao carregar produtos:", produtosError)
      }
    } finally {
      setLoading(false)
    }
  }

  const filtrarProdutos = () => {
    if (!termoPesquisa.trim()) {
      setProdutosFiltrados(produtos)
      return
    }

    const filtrados = produtos.filter(produto =>
      produto.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      produto.categoria.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      produto.fornecedor?.toLowerCase().includes(termoPesquisa.toLowerCase())
    )
    setProdutosFiltrados(filtrados)
  }

  const handleRegistrarVenda = (produto) => {
    setProdutoSelecionado(produto)
    setQuantidadeVenda(1)
    setClienteNome("")
    setValorTotal(produto.preco)
    setMostrarRegistrarVenda(true)
  }

  const confirmarVenda = async () => {
    if (!produtoSelecionado || !clienteNome.trim()) {
      showError("Por favor, preencha todos os campos obrigatórios!")
      return
    }

    if (quantidadeVenda > produtoSelecionado.quantidade) {
      showError("Quantidade solicitada maior que o estoque disponível!")
      return
    }

    try {
      const vendaData = {
        produtoId: produtoSelecionado._id,
        produtoNome: produtoSelecionado.nome,
        quantidade: quantidadeVenda,
        precoUnitario: produtoSelecionado.preco,
        valorTotal: valorTotal,
        clienteNome: clienteNome,
        dataVenda: new Date().toISOString()
      }

      // Salvar venda no localStorage
      const vendasExistentes = JSON.parse(localStorage.getItem("vendas") || "[]")
      vendasExistentes.push({ ...vendaData, id: Date.now() })
      localStorage.setItem("vendas", JSON.stringify(vendasExistentes))

      // Atualizar estoque do produto
      await atualizarEstoqueProduto(produtoSelecionado._id, quantidadeVenda)
      
        showSuccess("Venda registrada com sucesso!")
        setMostrarRegistrarVenda(false)
        carregarVendasDoLocalStorage() // Atualizar vendas automaticamente
        carregarDados() // Recarregar produtos para atualizar estoque
      } catch (error) {
        console.error("Erro ao registrar venda:", error)
        showError("Erro ao registrar venda. Tente novamente.")
      }
  }

  const carregarVendasDoLocalStorage = () => {
    const vendasSalvas = JSON.parse(localStorage.getItem("vendas") || "[]")
    // Ordenar vendas por data decrescente (mais recentes primeiro)
    const vendasOrdenadas = vendasSalvas.sort((a, b) => new Date(b.dataVenda) - new Date(a.dataVenda))
    setVendas(vendasOrdenadas)
  }

  // Funções de paginação
  const totalPaginas = Math.ceil(vendas.length / vendasPorPagina)
  const indiceInicio = (paginaAtual - 1) * vendasPorPagina
  const indiceFim = indiceInicio + vendasPorPagina
  const vendasPaginaAtual = vendas.slice(indiceInicio, indiceFim)

  const irParaPagina = (pagina) => {
    setPaginaAtual(pagina)
  }

  const paginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1)
    }
  }

  const proximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1)
    }
  }

  const atualizarEstoqueProduto = async (produtoId, quantidadeVendida) => {
    try {
      // Calcular nova quantidade
      const novaQuantidade = produtoSelecionado.quantidade - quantidadeVendida
      
      // Atualizar no backend
      await api.put(`/produtos/editarProduto/${produtoId}`, {
        quantidade: novaQuantidade
      })
      
      // Atualizar localmente também para garantir sincronização
      const produtosAtualizados = produtos.map(produto => {
        if (produto._id === produtoId) {
          return {
            ...produto,
            quantidade: novaQuantidade
          }
        }
        return produto
      })
      setProdutos(produtosAtualizados)
      
      console.log(`✅ Estoque atualizado: ${produtoSelecionado.nome} - ${produtoSelecionado.quantidade} → ${novaQuantidade}`)
    } catch (error) {
      console.error("Erro ao atualizar estoque no backend:", error)
      // Fallback: atualizar apenas localmente
      const produtosAtualizados = produtos.map(produto => {
        if (produto._id === produtoId) {
          return {
            ...produto,
            quantidade: produto.quantidade - quantidadeVendida
          }
        }
        return produto
      })
      setProdutos(produtosAtualizados)
      console.log("⚠️ Estoque atualizado apenas localmente")
    }
  }

  useEffect(() => {
    carregarVendasDoLocalStorage()
  }, [])

  // Resetar página quando vendas mudarem
  useEffect(() => {
    if (vendas.length > 0 && paginaAtual > Math.ceil(vendas.length / vendasPorPagina)) {
      setPaginaAtual(1)
    }
  }, [vendas, paginaAtual])

  if (loading) {
    return <p className="text-gray-600">Carregando dashboard...</p>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Dashboard de Vendas</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setMostrarRegistrarVenda(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition text-sm"
          >
            + Nova Venda
          </button>
          <button
            onClick={carregarVendasDoLocalStorage}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition text-sm"
          >
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Total de Produtos</h3>
          <p className="text-2xl font-bold text-blue-600">{produtos.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Vendas Hoje</h3>
          <p className="text-2xl font-bold text-green-600">
            {vendas.filter(v => new Date(v.dataVenda).toDateString() === new Date().toDateString()).length}
          </p>
        </div>
      </div>

      {/* Pesquisa de Produtos */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Pesquisar Produtos</h2>
        <input
          type="text"
          placeholder="Digite o nome, categoria ou fornecedor..."
          value={termoPesquisa}
          onChange={(e) => setTermoPesquisa(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-sm"
        />
        
        {produtosFiltrados.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-3">
              {produtosFiltrados.length} produto(s) encontrado(s)
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm bg-white rounded-lg">
                <thead className="bg-green-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Foto</th>
                    <th className="px-4 py-3 text-left">Nome</th>
                    <th className="px-4 py-3 text-left">Categoria</th>
                    <th className="px-4 py-3 text-left">Preço</th>
                    <th className="px-4 py-3 text-left">Estoque</th>
                    <th className="px-4 py-3 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {produtosFiltrados.map((produto) => (
                    <tr key={produto._id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        {produto.imagem ? (
                          <img
                            src={`http://localhost:7001/uploads/${produto.imagem}`}
                            alt={produto.nome}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-md">
                            <span className="text-gray-400 text-xs">Sem foto</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{produto.nome}</td>
                      <td className="px-4 py-3 text-gray-700">{produto.categoria}</td>
                      <td className="px-4 py-3 text-blue-600 font-semibold">
                        R$ {produto.preco?.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          produto.quantidade > 10 
                            ? "bg-green-100 text-green-800" 
                            : produto.quantidade > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {produto.quantidade} unid.
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleRegistrarVenda(produto)}
                          disabled={produto.quantidade === 0}
                          className={`px-4 py-1 rounded text-xs font-semibold transition ${
                            produto.quantidade === 0
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          {produto.quantidade === 0 ? "Sem Estoque" : "Vender"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Consulta de Vendas */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-800">Últimas Vendas</h2>
          {vendas.length > 0 && (
            <span className="text-sm text-gray-600">
              Página {paginaAtual} de {totalPaginas} ({vendas.length} vendas)
            </span>
          )}
        </div>
        
        {vendas.length === 0 ? (
          <p className="text-gray-600 text-sm">Nenhuma venda registrada ainda.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Cliente</th>
                    <th className="text-left py-2">Produto</th>
                    <th className="text-left py-2">Qtd</th>
                    <th className="text-left py-2">Valor Unit.</th>
                    <th className="text-left py-2">Total</th>
                    <th className="text-left py-2">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {vendasPaginaAtual.map((venda) => (
                    <tr key={venda.id} className="border-b hover:bg-gray-50">
                      <td className="py-2">{venda.clienteNome}</td>
                      <td className="py-2">{venda.produtoNome}</td>
                      <td className="py-2">{venda.quantidade}</td>
                      <td className="py-2">R$ {venda.precoUnitario?.toFixed(2)}</td>
                      <td className="py-2 font-semibold">R$ {venda.valorTotal?.toFixed(2)}</td>
                      <td className="py-2 text-xs text-gray-600">
                        {new Date(venda.dataVenda).toLocaleDateString()} às {new Date(venda.dataVenda).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Controles de Paginação */}
            {totalPaginas > 1 && (
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={paginaAnterior}
                  disabled={paginaAtual === 1}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${
                    paginaAtual === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  ← Anterior
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                    <button
                      key={pagina}
                      onClick={() => irParaPagina(pagina)}
                      className={`px-3 py-1 rounded text-sm font-medium transition ${
                        pagina === paginaAtual
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {pagina}
                    </button>
                  ))}
                </div>

                <button
                  onClick={proximaPagina}
                  disabled={paginaAtual === totalPaginas}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${
                    paginaAtual === totalPaginas
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Próximo →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Registrar Venda */}
      {mostrarRegistrarVenda && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {produtoSelecionado ? "Registrar Venda" : "Nova Venda"}
            </h3>
            
            {produtoSelecionado ? (
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-semibold text-sm">{produtoSelecionado.nome}</p>
                  <p className="text-xs text-gray-600">Preço: R$ {produtoSelecionado.preco?.toFixed(2)}</p>
                  <p className="text-xs text-gray-600">Estoque: {produtoSelecionado.quantidade} unid.</p>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Cliente</label>
                  <input
                    type="text"
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    placeholder="Nome do cliente"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    max={produtoSelecionado.quantidade}
                    value={quantidadeVenda}
                    onChange={(e) => setQuantidadeVenda(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-sm"
                  />
                </div>
                
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm font-semibold">
                    Total: R$ {valorTotal.toFixed(2)}
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={confirmarVenda}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
                  >
                    Confirmar Venda
                  </button>
                  <button
                    onClick={() => setMostrarRegistrarVenda(false)}
                    className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition text-sm font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 text-sm mb-4">Selecione um produto para registrar a venda.</p>
                <button
                  onClick={() => setMostrarRegistrarVenda(false)}
                  className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition text-sm font-medium"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Container de Notificações */}
      <NotificationContainer 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
    </div>
  )
}
