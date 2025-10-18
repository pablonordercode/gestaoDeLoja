import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import { useNotification } from "../hooks/useNotification"
import NotificationContainer from "../components/NotificationContainer"

export default function ConfiguracaoLoja() {
  const navigate = useNavigate()
  const { notifications, showSuccess, showError, removeNotification } = useNotification()
  
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [lojaExiste, setLojaExiste] = useState(false)
  const [lojaId, setLojaId] = useState(null)
  
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    endereco: "",
    telefone: "",
    email: "",
  })
  
  const [logo, setLogo] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoAtual, setLogoAtual] = useState(null)

  // Buscar dados da loja ao carregar
  useEffect(() => {
    buscarDadosLoja()
  }, [])

  const buscarDadosLoja = async () => {
    try {
      setLoadingData(true)
      const response = await api.get("/api/loja")
      
      if (response.data.success && response.data.data) {
        const loja = response.data.data
        setLojaExiste(true)
        setLojaId(loja._id)
        
        setFormData({
          nome: loja.nome || "",
          cnpj: loja.cnpj || "",
          endereco: loja.endereco || "",
          telefone: loja.telefone || "",
          email: loja.email || "",
        })
        
        if (loja.logoUrl) {
          setLogoAtual(loja.logoUrl)
        }
      }
    } catch (error) {
      // Se retornar 404, significa que não há loja cadastrada
      if (error.response?.status === 404) {
        setLojaExiste(false)
      } else {
        console.error("Erro ao buscar loja:", error)
        showError("Erro ao carregar dados da loja")
      }
    } finally {
      setLoadingData(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        showError("Por favor, selecione uma imagem válida")
        return
      }
      
      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError("A imagem deve ter no máximo 5MB")
        return
      }
      
      setLogo(file)
      
      // Criar preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const formatCNPJ = (value) => {
    // Remove tudo que não é dígito
    const cleaned = value.replace(/\D/g, '')
    
    // Aplica a máscara: 00.000.000/0000-00
    if (cleaned.length <= 14) {
      return cleaned
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
    }
    return cleaned.slice(0, 14)
  }

  const formatTelefone = (value) => {
    // Remove tudo que não é dígito
    const cleaned = value.replace(/\D/g, '')
    
    // Aplica a máscara: (00) 00000-0000
    if (cleaned.length <= 11) {
      return cleaned
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
    }
    return cleaned.slice(0, 11)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("nome", formData.nome)
      formDataToSend.append("cnpj", formData.cnpj.replace(/\D/g, '')) // Remove formatação
      formDataToSend.append("endereco", formData.endereco)
      formDataToSend.append("telefone", formData.telefone.replace(/\D/g, '')) // Remove formatação
      formDataToSend.append("email", formData.email)
      
      if (logo) {
        formDataToSend.append("logo", logo)
      }

      let response
      if (lojaExiste) {
        // Atualizar loja existente
        response = await api.put(`/api/loja/${lojaId}`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      } else {
        // Criar nova loja
        response = await api.post("/api/loja", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      }

      if (response.data.success) {
        showSuccess(response.data.msg || "Configurações salvas com sucesso!")
        
        // Atualizar estado
        if (!lojaExiste) {
          setLojaExiste(true)
          setLojaId(response.data.data._id)
        }
        
        // Atualizar logo atual se houver
        if (response.data.data.logoUrl) {
          setLogoAtual(response.data.data.logoUrl)
          setLogoPreview(null)
          setLogo(null)
        }
      }
    } catch (error) {
      console.error("Erro ao salvar:", error)
      const msg = error.response?.data?.msg || error.response?.data?.message || "Erro ao salvar configurações"
      showError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelar = () => {
    if (lojaExiste) {
      // Recarregar dados originais
      buscarDadosLoja()
      setLogo(null)
      setLogoPreview(null)
    } else {
      // Limpar formulário
      setFormData({
        nome: "",
        cnpj: "",
        endereco: "",
        telefone: "",
        email: "",
      })
      setLogo(null)
      setLogoPreview(null)
    }
  }

  if (loadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Configurações da Loja
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo da Loja
              </label>
              
              <div className="flex items-start space-x-4">
                {/* Preview da logo */}
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : logoAtual ? (
                    <img 
                      src={`http://localhost:7001/uploads/${logoAtual}`} 
                      alt="Logo atual" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                
                {/* Input de arquivo */}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                      cursor-pointer"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG ou JPEG (máx. 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Nome */}
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Loja *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Loja do João"
              />
            </div>

            {/* CNPJ */}
            <div>
              <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-2">
                CNPJ *
              </label>
              <input
                type="text"
                id="cnpj"
                name="cnpj"
                value={formatCNPJ(formData.cnpj)}
                onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                required
                maxLength={18}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="00.000.000/0000-00"
              />
            </div>

            {/* Endereço */}
            <div>
              <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-2">
                Endereço *
              </label>
              <input
                type="text"
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Rua, número, bairro, cidade - UF"
              />
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefone *
              </label>
              <input
                type="text"
                id="telefone"
                name="telefone"
                value={formatTelefone(formData.telefone)}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                required
                maxLength={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(00) 00000-0000"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-mail *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="contato@loja.com"
              />
            </div>

            {/* Botões */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
              
              <button
                type="button"
                onClick={handleCancelar}
                disabled={loading}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Notificações */}
      <NotificationContainer 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
    </div>
  )
}


