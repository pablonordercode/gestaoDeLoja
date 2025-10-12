import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import { useNotification } from "../hooks/useNotification"
import NotificationContainer from "../components/NotificationContainer"

export default function Login() {
  const navigate = useNavigate()
  const { notifications, showSuccess, showError, removeNotification } = useNotification()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setErro("")
    setLoading(true)

    try {
      const res = await api.post("/colaborador/login", {
        email,
        password,
      })

      const { token, nome, email: userEmail, id, imagem, cargo } = res.data.data

      // Armazenar dados no localStorage (mesmo formato do registro)
      localStorage.setItem("usuario", JSON.stringify({ id, nome, email: userEmail, imagem, cargo }))
      localStorage.setItem("token", token)

      // Forçar atualização do Navbar
      window.dispatchEvent(new Event('storage'))

      showSuccess(`Bem-vindo, ${nome}!`)
      
      // Redirecionar após o login com delay para mostrar notificação
      setTimeout(() => {
        navigate("/dashboard")
      }, 1500)
    } catch (err) {
      console.error("Erro completo do login:", err.response?.data || err.message)
      const msg =
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Erro ao realizar login. Verifique suas credenciais."
      setErro(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #1f1c2c, #928dab)",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          padding: "2rem",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "350px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          backdropFilter: "blur(10px)",
          color: "#fff",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Login</h2>

        <label style={{ display: "block", marginBottom: "0.5rem" }}>E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            marginBottom: "1rem",
          }}
        />

        <label style={{ display: "block", marginBottom: "0.5rem" }}>Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            marginBottom: "1.5rem",
          }}
        />

        {erro && (
          <p style={{ color: "#ff6b6b", textAlign: "center", marginBottom: "1rem" }}>
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            backgroundColor: "#00b4d8",
            border: "none",
            padding: "10px",
            borderRadius: "8px",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "0.3s",
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
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

