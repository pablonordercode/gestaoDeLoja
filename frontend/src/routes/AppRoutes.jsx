import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "../components/Navbar"
import ProtectedRoute from "../components/ProtectedRoute"
import Home from "../pages/Home"
import Dashboard from "../pages/Dashboard"
import Produto from "../pages/Produto"
import CriarProduto from "../pages/CriarProduto"
import Gestao from "../pages/Gestao"
import Login from "../pages/Login"
import RegistrarColaborador from "../pages/RegistrarColaborador"


export default function AppRoutes() {
  return (
    <Router>
      <Navbar />
      <main className="p-6">
        <Routes>
          {/* ========== ROTAS PÚBLICAS ========== */}
          {/* Qualquer pessoa pode acessar sem estar logada */}
          <Route path="/" element={<Login/>} />
          <Route path="/login" element={<Login />} />
          <Route path="/registrar" element={<RegistrarColaborador />} />
          
          {/* ========== ROTAS PROTEGIDAS ========== */}
          {/* Apenas usuários autenticados podem acessar */}
          <Route path="/home" element={
            <ProtectedRoute>
              <Home/>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/produtos" element={
            <ProtectedRoute>
              <Produto />
            </ProtectedRoute>
          } />
          
          <Route path="/criarProdutosnew" element={
            <ProtectedRoute>
              <CriarProduto />
            </ProtectedRoute>
          } />
          
          <Route path="/gestao" element={
            <ProtectedRoute>
              <Gestao />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </Router>
  )
}
