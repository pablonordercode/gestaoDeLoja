import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import { useNotification } from "../hooks/useNotification"
import NotificationContainer from "../components/NotificationContainer"

export default function Produto() {
  const { notifications, showSuccess, showError, removeNotification } = useNotification()
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Estados para edição
  const [mostrarEditarModal, setMostrarEditarModal] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState(null)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    quantidade: "",
    categoria: "",
    fornecedor: "",
    imagem: null
  })

  useEffect(() => {
    async function fetchProdutos() {
      try {
        const res = await api.get("/api/produtos/todosProdutos")
        setProdutos(res.data.data) // acessa o array dentro do "data"
      } catch (error) {
        console.error("Erro ao buscar produtos:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProdutos()
  }, [])

  const handleEditarProduto = (produto) => {
    setProdutoEditando(produto)
    setFormData({
      nome: produto.nome,
      descricao: produto.descricao || "",
      preco: produto.preco?.toString() || "",
      quantidade: produto.quantidade?.toString() || "",
      categoria: produto.categoria || "",
      fornecedor: produto.fornecedor || "",
      imagem: null
    })
    setMostrarEditarModal(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleFileChange = (e) => {
    setFormData({ ...formData, imagem: e.target.files[0] })
  }

  const handleSubmitEdicao = async (e) => {
    e.preventDefault()
    
    try {
      const data = new FormData()
      data.append("nome", formData.nome)
      data.append("descricao", formData.descricao)
      data.append("preco", formData.preco)
      data.append("quantidade", formData.quantidade)
      data.append("categoria", formData.categoria)
      data.append("fornecedor", formData.fornecedor)
      
      if (formData.imagem) {
        data.append("imagem", formData.imagem)
      }

      await api.put(`/api/produtos/editarProduto/${produtoEditando._id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      showSuccess("Produto editado com sucesso!")
      setMostrarEditarModal(false)
      
      // Recarregar lista de produtos
      const res = await api.get("/api/produtos/todosProdutos")
      setProdutos(res.data.data || [])
    } catch (error) {
      console.error("Erro ao editar produto:", error)
      showError("Erro ao editar produto. Tente novamente.")
    }
  }

  const carregarProdutos = async () => {
    try {
      const res = await api.get("/api/produtos/todosProdutos")
      setProdutos(res.data.data || [])
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
    }
  }

  if (loading) {
    return <p className="text-gray-600">Carregando produtos...</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Produtos</h1>
        <Link
          to="/criarProdutosnew"
          className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow hover:bg-blue-700 transition text-sm"
        >
          + Adicionar Produto
        </Link>
      </div>

      {produtos.length === 0 ? (
        <p className="text-gray-600">Nenhum produto encontrado.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Foto</th>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Descrição</th>
                <th className="px-4 py-3 text-left">Preço</th>
                <th className="px-4 py-3 text-left">Estoque</th>
                <th className="px-4 py-3 text-left">Categoria</th>
                <th className="px-4 py-3 text-left">Fornecedor</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => (
                <tr key={p._id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    {p.imagem ? (
                      <img
                        src={`http://localhost:7001/uploads/${p.imagem}`}
                        alt={p.nome}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-md">
                        <span className="text-gray-400 text-xs">Sem foto</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.nome}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    <span className="line-clamp-2">{p.descricao}</span>
                  </td>
                  <td className="px-4 py-3 text-blue-600 font-semibold">
                    R$ {p.preco?.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.quantidade > 10 
                        ? "bg-green-100 text-green-800" 
                        : p.quantidade > 0
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {p.quantidade} unid.
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{p.categoria}</td>
                  <td className="px-4 py-3 text-gray-700">{p.fornecedor || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleEditarProduto(p)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Editar Produto */}
      {mostrarEditarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Editar Produto</h3>
            
            <form onSubmit={handleSubmitEdicao} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Nome</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Descrição</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Preço</label>
                  <input
                    type="number"
                    name="preco"
                    value={formData.preco}
                    onChange={handleChange}
                    required
                    step="0.01"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Quantidade</label>
                  <input
                    type="number"
                    name="quantidade"
                    value={formData.quantidade}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Categoria</label>
                  <input
                    type="text"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Fornecedor</label>
                  <input
                    type="text"
                    name="fornecedor"
                    value={formData.fornecedor}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Nova Imagem (opcional)</label>
                <input
                  type="file"
                  name="imagem"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full text-sm"
                />
                {produtoEditando?.imagem && (
                  <p className="text-xs text-gray-500 mt-1">
                    Imagem atual: {produtoEditando.imagem}
                  </p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  Salvar Alterações
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarEditarModal(false)}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition text-sm font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
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
