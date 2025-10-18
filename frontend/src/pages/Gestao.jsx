

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import { useNotification } from "../hooks/useNotification"
import NotificationContainer from "../components/NotificationContainer"

export default function Gestao() {
  const navigate = useNavigate()
  const { notifications, showSuccess, showError, removeNotification } = useNotification()
  const [produtos, setProdutos] = useState([])
  const [vendas, setVendas] = useState([])
  const [colaboradores, setColaboradores] = useState([])
  const [loading, setLoading] = useState(true)
  const [usuario, setUsuario] = useState(null)
  const [autorizado, setAutorizado] = useState(false)
  
  // Estados para edição de colaborador
  const [mostrarEditarColaborador, setMostrarEditarColaborador] = useState(false)
  const [colaboradorEditando, setColaboradorEditando] = useState(null)
  const [formColaborador, setFormColaborador] = useState({
    nome: "",
    email: "",
    cargo: "",
    password: "",
    ativo: true,
    imagem: null
  })
  
  // Estados para modal de confirmação
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)
  const [colaboradorParaExcluir, setColaboradorParaExcluir] = useState(null)

  useEffect(() => {
    verificarAutorizacao()
  }, [])

  const verificarAutorizacao = () => {
    const userData = localStorage.getItem("usuario")
    
    if (!userData) {
      // Usuário não logado
      navigate("/login")
      return
    }

    const usuarioLogado = JSON.parse(userData)
    setUsuario(usuarioLogado)

    // Verificar se o cargo permite acesso à gestão
    const cargosAutorizados = ["Administrador", "Gerente"]
    
    if (cargosAutorizados.includes(usuarioLogado.cargo)) {
      setAutorizado(true)
      carregarDados()
    } else {
      setAutorizado(false)
      setLoading(false)
    }
  }

  const carregarDados = async () => {
    try {
      await Promise.all([
        carregarProdutos(),
        carregarVendas(),
        carregarColaboradores()
      ])
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
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

  const carregarVendas = () => {
    const vendasSalvas = JSON.parse(localStorage.getItem("vendas") || "[]")
    setVendas(vendasSalvas)
  }

  const carregarColaboradores = async () => {
    try {
      console.log("Carregando colaboradores...")
      const res = await api.get("/api/colaborador/todosColaboradores")
      console.log("Resposta completa da API:", res)
      console.log("Dados da resposta:", res.data)
      
      // Verificar diferentes estruturas possíveis
      let colaboradoresData = []
      if (res.data && res.data.data) {
        colaboradoresData = res.data.data
      } else if (res.data && Array.isArray(res.data)) {
        colaboradoresData = res.data
      } else if (res.data && res.data.success && res.data.data) {
        colaboradoresData = res.data.data
      }
      
      console.log("Colaboradores extraídos:", colaboradoresData)
      setColaboradores(colaboradoresData)
    } catch (error) {
      console.error("Erro ao carregar colaboradores:", error)
      console.error("Status do erro:", error.response?.status)
      console.error("Detalhes do erro:", error.response?.data)
      console.error("URL da requisição:", error.config?.url)
    }
  }

  const handleEditarColaborador = (colaborador) => {
    setColaboradorEditando(colaborador)
    setFormColaborador({
      nome: colaborador.nome,
      email: colaborador.email,
      cargo: colaborador.cargo,
      password: "",
      ativo: colaborador.ativo,
      imagem: null
    })
    setMostrarEditarColaborador(true)
  }

  const handleChangeColaborador = (e) => {
    const { name, value, type, checked, files } = e.target
    
    if (type === 'checkbox') {
      setFormColaborador({ ...formColaborador, [name]: checked })
    } else if (type === 'file') {
      setFormColaborador({ ...formColaborador, [name]: files[0] })
    } else {
      setFormColaborador({ ...formColaborador, [name]: value })
    }
  }

  const handleSubmitEdicaoColaborador = async (e) => {
    e.preventDefault()
    
    try {
      const formData = new FormData()
      formData.append("nome", formColaborador.nome)
      formData.append("email", formColaborador.email)
      formData.append("cargo", formColaborador.cargo)
      formData.append("ativo", formColaborador.ativo)
      
      // Só envia a senha se foi preenchida
      if (formColaborador.password && formColaborador.password.trim() !== "") {
        formData.append("password", formColaborador.password)
      }
      
      // Só envia a imagem se foi selecionada
      if (formColaborador.imagem) {
        formData.append("imagem", formColaborador.imagem)
      }

      await api.put(`/api/colaborador/editarColaborador/${colaboradorEditando._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      
      showSuccess("Colaborador editado com sucesso!")
      setMostrarEditarColaborador(false)
      carregarColaboradores()
    } catch (error) {
      console.error("Erro ao editar colaborador:", error)
      showError(error.response?.data?.msg || "Erro ao editar colaborador. Tente novamente.")
    }
  }

  const removerColaborador = (colaborador) => {
    setColaboradorParaExcluir(colaborador)
    setMostrarConfirmacao(true)
  }

  const confirmarExclusao = async () => {
    if (colaboradorParaExcluir) {
      try {
        await api.delete(`/api/colaborador/deletarColaborador/${colaboradorParaExcluir._id}`)
        showSuccess("Colaborador excluído com sucesso!")
        carregarColaboradores()
      } catch (error) {
        console.error("Erro ao excluir colaborador:", error)
        showError("Erro ao excluir colaborador. Tente novamente.")
      }
    }
    setMostrarConfirmacao(false)
    setColaboradorParaExcluir(null)
  }

  const removerProduto = async (id) => {
    const confirmado = confirm("Tem certeza que deseja excluir este produto?")
    if (confirmado) {
      try {
        await api.delete(`/api/produtos/deletarProduto/${id}`)
        showSuccess("Produto excluído com sucesso!")
        carregarProdutos() // Recarregar lista de produtos
      } catch (error) {
        console.error("Erro ao excluir produto:", error)
        showError("Erro ao excluir produto. Tente novamente.")
      }
    }
  }

  // Calcular faturamento
  const faturamentoHoje = vendas
    .filter(v => new Date(v.dataVenda).toDateString() === new Date().toDateString())
    .reduce((total, v) => total + v.valorTotal, 0)

  const faturamentoTotal = vendas.reduce((total, v) => total + v.valorTotal, 0)

  if (loading) {
    return <p className="text-gray-600">Verificando permissões...</p>
  }

  if (!autorizado) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-6">
            Você não tem permissão para acessar esta página.
            <br />
            Apenas Administradores e Gerentes podem acessar a Gestão.
          </p>
          {usuario && (
            <p className="text-sm text-gray-500 mb-4">
              Seu cargo atual: <span className="font-semibold">{usuario.cargo}</span>
            </p>
          )}
          <div className="flex space-x-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              Ir para Dashboard
            </button>
            <button
              onClick={() => navigate("/produtos")}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition"
            >
              Ver Produtos
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Gestão e Relatórios</h1>
        {usuario && (
          <span className="text-sm text-gray-600">
            Logado como: <span className="font-semibold text-blue-600">{usuario.cargo}</span>
          </span>
        )}
      </div>

      {/* Atalhos de Gestão */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-white text-lg font-bold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/configuracao-loja")}
            className="bg-white text-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition flex items-center space-x-4"
          >
            <div className="text-4xl">⚙️</div>
            <div className="text-left">
              <h3 className="font-bold text-lg">Configurações da Loja</h3>
              <p className="text-sm text-gray-600">Configure nome, CNPJ, endereço e logo</p>
            </div>
          </button>
          <button
            onClick={() => navigate("/registrar")}
            className="bg-white text-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition flex items-center space-x-4"
          >
            <div className="text-4xl">👤</div>
            <div className="text-left">
              <h3 className="font-bold text-lg">Cadastrar Colaborador</h3>
              <p className="text-sm text-gray-600">Adicionar novo membro à equipe</p>
            </div>
          </button>
        </div>
      </div>

      {/* Estatísticas de Faturamento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Faturamento Hoje</h3>
          <p className="text-2xl font-bold text-green-600">
            R$ {faturamentoHoje.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Faturamento Total</h3>
          <p className="text-2xl font-bold text-purple-600">
            R$ {faturamentoTotal.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Total de Colaboradores</h3>
          <p className="text-2xl font-bold text-blue-600">
            {colaboradores.length}
          </p>
        </div>
      </div>

      {/* Gestão de Colaboradores */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Gestão de Colaboradores</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Cargo</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {colaboradores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    Nenhum colaborador encontrado.
                  </td>
                </tr>
              ) : (
                colaboradores.map((colaborador) => (
                  <tr key={colaborador._id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{colaborador.nome}</td>
                    <td className="px-4 py-3">{colaborador.email}</td>
                    <td className="px-4 py-3">{colaborador.cargo}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        colaborador.ativo 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {colaborador.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex space-x-2 justify-center">
                        <button
                          onClick={() => handleEditarColaborador(colaborador)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => removerColaborador(colaborador)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Gestão de Produtos</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Produto</th>
                <th className="px-4 py-3 text-left">Categoria</th>
                <th className="px-4 py-3 text-left">Preço (R$)</th>
                <th className="px-4 py-3 text-left">Estoque</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    Nenhum produto cadastrado.
                  </td>
                </tr>
              ) : (
                produtos.map((produto) => (
                  <tr key={produto._id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3">{produto._id.slice(-6)}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{produto.nome}</td>
                    <td className="px-4 py-3">{produto.categoria}</td>
                    <td className="px-4 py-3">{produto.preco?.toFixed(2)}</td>
                    <td className="px-4 py-3">{produto.quantidade}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removerProduto(produto._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botão de Atualizar */}
      <div className="flex justify-end">
        <button 
          onClick={carregarDados}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition text-sm"
        >
          🔄 Atualizar Relatórios
        </button>
      </div>

      {/* Modal de Editar Colaborador */}
      {mostrarEditarColaborador && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Editar Colaborador</h3>
            
            <form onSubmit={handleSubmitEdicaoColaborador} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Nome</label>
                <input
                  type="text"
                  name="nome"
                  value={formColaborador.nome}
                  onChange={handleChangeColaborador}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formColaborador.email}
                  onChange={handleChangeColaborador}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Cargo</label>
                <select
                  name="cargo"
                  value={formColaborador.cargo}
                  onChange={handleChangeColaborador}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-sm"
                >
                  <option value="">Selecione o cargo</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Colaborador">Colaborador</option>
                  <option value="Estagiário">Estagiário</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Nova Senha (deixe em branco para manter a atual)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formColaborador.password || ""}
                  onChange={handleChangeColaborador}
                  placeholder="Digite uma nova senha (opcional)"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
              </div>

              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Nova Imagem (opcional)
                </label>
                <input
                  type="file"
                  name="imagem"
                  onChange={handleChangeColaborador}
                  accept="image/*"
                  className="w-full text-sm"
                />
                {colaboradorEditando?.imagem && (
                  <div className="mt-2 flex items-center space-x-2">
                    <img
                      src={`http://localhost:7001/uploads/${colaboradorEditando.imagem}`}
                      alt="Imagem atual"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <p className="text-xs text-gray-500">Imagem atual</p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="ativo"
                  checked={formColaborador.ativo}
                  onChange={handleChangeColaborador}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700 font-medium">Colaborador ativo</label>
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
                  onClick={() => setMostrarEditarColaborador(false)}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition text-sm font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {mostrarConfirmacao && colaboradorParaExcluir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Confirmar Exclusão</h3>
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja excluir o colaborador <strong>{colaboradorParaExcluir.nome}</strong>?
                <br />
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={confirmarExclusao}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium"
                >
                  Sim, Excluir
                </button>
                <button
                  onClick={() => {
                    setMostrarConfirmacao(false)
                    setColaboradorParaExcluir(null)
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition text-sm font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
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

