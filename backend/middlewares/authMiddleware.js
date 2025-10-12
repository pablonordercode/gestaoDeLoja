const jwt = require("jsonwebtoken");
const { AppError } = require("../utils/error");

// Middleware para verificar autenticação JWT
const verificarAuth = (req, res, next) => {
  try {
    // 1️⃣ Buscar token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Token não fornecido. Acesso negado.", 401);
    }

    // 2️⃣ Extrair token (formato: "Bearer TOKEN")
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      throw new AppError("Token inválido. Acesso negado.", 401);
    }

    // 3️⃣ Verificar se JWT_SECRET está configurado
    if (!process.env.JWT_SECRET) {
      throw new AppError("Erro de configuração do servidor", 500);
    }

    // 4️⃣ Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5️⃣ Adicionar informações do usuário à requisição
    req.usuario = {
      id: decoded.id,
      email: decoded.email,
    };

    // 6️⃣ Continuar para a próxima função
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        msg: "Token inválido",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        msg: "Token expirado. Faça login novamente.",
      });
    }

    // Outros erros
    return res.status(error.statusCode || 500).json({
      success: false,
      msg: error.message || "Erro ao verificar autenticação",
    });
  }
};

// Middleware opcional para verificar se é administrador
const verificarAdmin = async (req, res, next) => {
  try {
    const UsuarioColaborador = require("../models/colaboradorModels");
    
    // Buscar dados completos do usuário
    const usuario = await UsuarioColaborador.findById(req.usuario.id);

    if (!usuario) {
      throw new AppError("Usuário não encontrado", 404);
    }

    if (usuario.cargo !== "Administrador" && usuario.cargo !== "Gerente") {
      throw new AppError("Acesso negado. Apenas administradores e gerentes.", 403);
    }

    // Adicionar cargo ao objeto de usuário
    req.usuario.cargo = usuario.cargo;

    next();
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      msg: error.message || "Erro ao verificar permissões",
    });
  }
};

module.exports = { verificarAuth, verificarAdmin };

