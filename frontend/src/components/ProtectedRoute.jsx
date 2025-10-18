import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ children }) {
  // Verificar se o usuário está autenticado
  const isAuthenticated = () => {
    const accessToken = localStorage.getItem("accessToken")
    const refreshToken = localStorage.getItem("refreshToken")
    const usuario = localStorage.getItem("usuario")
    
    // Se tiver pelo menos um dos tokens e dados do usuário, está autenticado
    return (accessToken || refreshToken) && usuario
  }

  // Se não estiver autenticado, redireciona para login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  // Se estiver autenticado, renderiza o componente filho
  return children
}

