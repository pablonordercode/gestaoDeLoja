import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ children }) {
  // Verificar se o usuário está autenticado
  const isAuthenticated = () => {
    const token = localStorage.getItem("token")
    const usuario = localStorage.getItem("usuario")
    return token && usuario
  }

  // Se não estiver autenticado, redireciona para login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  // Se estiver autenticado, renderiza o componente filho
  return children
}

