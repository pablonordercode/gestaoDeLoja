import { useState } from "react"
import api from "../services/api"
import { useNavigate } from "react-router-dom"
import { useNotification } from "../hooks/useNotification"
import NotificationContainer from "../components/NotificationContainer"

export default function CriarProduto() {
  const navigate = useNavigate()
  const { notifications, showSuccess, showError, removeNotification } = useNotification()
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    quantidade: "",
    categoria: "",
    fornecedor: "",
    imagem: null, // arquivo
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleFileChange = (e) => {
    setFormData({ ...formData, imagem: e.target.files[0] })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const data = new FormData()
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key])
      })

      await api.post("/produtos/addProduto", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      showSuccess("Produto criado com sucesso!")
      setTimeout(() => {
        navigate("/produtos")
      }, 1500) // Aguarda a notificação aparecer antes de navegar
    } catch (error) {
      console.error("Erro ao criar produto:", error)
      showError("Erro ao criar produto. Tente novamente.")
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-4 rounded-xl shadow-md mt-4">
      <h1 className="text-xl font-bold mb-3 text-gray-800">Adicionar Produto</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
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
          <label className="block text-sm text-gray-700 font-medium mb-1">Imagem</label>
          <input
            type="file"
            name="imagem"
            onChange={handleFileChange}
            accept="image/*"
            className="w-full text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition text-sm font-medium"
        >
          Salvar Produto
        </button>
      </form>

      {/* Container de Notificações */}
      <NotificationContainer 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
    </div>
  )
}
