import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import api from "../services/api"

export default function Navbar() {
  const [usuario, setUsuario] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Verifica se existe token salvo (usuário logado)
  useEffect(() => {
    const updateUsuario = () => {
      const userData = localStorage.getItem("usuario")
      if (userData) {
        setUsuario(JSON.parse(userData))
      } else {
        setUsuario(null)
      }
    }

    // Verificar na montagem do componente
    updateUsuario()

    // Listener para mudanças no localStorage
    window.addEventListener('storage', updateUsuario)

    // Cleanup
    return () => window.removeEventListener('storage', updateUsuario)
  }, [])

  const handleLogout = async () => {
    try {
      // Chamar rota de logout no backend para revogar refresh token
      await api.post("/colaborador/logout")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    } finally {
      // Limpar storage independente do resultado
      localStorage.removeItem("usuario")
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      setUsuario(null)
      navigate("/login")
    }
  }

  // Função para atualizar o usuário (pode ser chamada de outros componentes)
  const updateUsuarioState = () => {
    const userData = localStorage.getItem("usuario")
    if (userData) {
      setUsuario(JSON.parse(userData))
    } else {
      setUsuario(null)
    }
  }

  const handleLogin = () => {
    navigate("/login")
  }

  const handleRegistrar = () => {
    navigate("/registrar")
  }

  // Função para verificar se uma página está ativa
  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center shadow-md">
      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        className="text-2xl font-bold text-blue-400 cursor-pointer select-none"
      >
        GESTÃO <span className="text-white">DE LOJA</span>
      </div>

      {/* Links */}
      <ul className="flex space-x-6">
        <li>
          <button 
            onClick={() => navigate("/dashboard")} 
            className={`hover:text-blue-400 transition ${
              isActive("/dashboard") ? "text-blue-400 font-semibold" : "text-white"
            }`}
          >
            Dashboard
          </button>
        </li>
        <li>
          <button 
            onClick={() => navigate("/produtos")} 
            className={`hover:text-blue-400 transition ${
              isActive("/produtos") ? "text-blue-400 font-semibold" : "text-white"
            }`}
          >
            Produtos
          </button>
        </li>
        <li>
          <button 
            onClick={() => navigate("/gestao")} 
            className={`hover:text-blue-401 transition ${
              isActive("/gestao") ? "text-blue-400 font-semibold" : "text-white"
            }`}
          >
            Gestão
          </button>
        </li>
        <li>
          {/* <button 
            onClick={() => navigate("/dashboard")} 
            className="hover:text-blue-400 transition text-white"
          >
            Vendas
          </button> */}
        </li>
      </ul>

      {/* Botão de Login / Logout */}
      {usuario ? (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {/* Foto do usuário */}
            {usuario.imagem ? (
              <img
                src={`http://localhost:7001/uploads/${usuario.imagem}`}
                alt="Foto do usuário"
                className="w-8 h-8 rounded-full object-cover border-2 border-blue-400"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {usuario.nome ? usuario.nome.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            )}
            {/* Primeiro nome */}
            <span className="text-sm text-gray-300">
              Olá, {usuario.nome ? usuario.nome.split(' ')[0] : 'Usuário'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Sair
          </button>
        </div>
      ) : (
        <div className="flex space-x-3">
          <button
            onClick={handleLogin}
            className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Login
          </button>
          <button
            onClick={handleRegistrar}
            className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 transition"
          >
            Registrar
          </button>
        </div>
      )}
    </nav>
  )
}
