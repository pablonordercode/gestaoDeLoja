import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useNotification } from "../hooks/useNotification";
import NotificationContainer from "../components/NotificationContainer";

export default function Register() {
  const navigate = useNavigate();
  const { notifications, showSuccess, showError, removeNotification } = useNotification();
  const [form, setForm] = useState({ nome: "", email: "", password: "", cargo: "" });
  const [imagem, setImagem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImagem(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    // Validação básica
    if (!form.nome || !form.email || !form.password) {
      setErro("Nome, email e senha são obrigatórios!");
      setLoading(false);
      return;
    }

    try {
      // Preparar FormData para enviar arquivo
      const formData = new FormData();
      formData.append("nome", form.nome);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("cargo", form.cargo || "Colaborador");
      
      if (imagem) {
        formData.append("imagem", imagem);
      }

      const res = await api.post("/colaborador/addColaborador", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      
      showSuccess("Conta criada com sucesso! Faça login para continuar.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setErro(error.response?.data?.msg || "Erro ao cadastrar usuário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Criar Conta</h2>

        {erro && <p className="text-red-500 text-center mb-4">{erro}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="nome"
            placeholder="Nome completo"
            value={form.nome}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Senha (mínimo 6 caracteres)"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200"
            minLength="6"
            required
          />
          <select
            name="cargo"
            value={form.cargo}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200"
          >
            <option value="">Selecione o cargo</option>
            <option value="Administrador">Administrador</option>
            <option value="Gerente">Gerente</option>
            <option value="Colaborador">Colaborador</option>
            <option value="Estagiário">Estagiário</option>
          </select>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto de perfil (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Criando conta..." : "Registrar"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Já tem conta?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Entrar
          </span>
        </p>
      </div>

      {/* Container de Notificações */}
      <NotificationContainer 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
    </div>
  );
}
