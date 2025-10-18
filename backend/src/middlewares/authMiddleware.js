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

    // 5️⃣ Verificar se é um access token (não um refresh token)
    if (decoded.type === "refresh") {
      return res.status(401).json({
        success: false,
        msg: "Token inválido. Use o access token para acessar recursos protegidos.",
        error: "INVALID_TOKEN_TYPE"
      });
    }

    // 6️⃣ Adicionar informações do usuário à requisição
    req.usuario = {
      id: decoded.id,
      email: decoded.email,
      cargo: decoded.cargo
    };

    // 7️⃣ Continuar para a próxima função
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        msg: "Token inválido",
        error: "INVALID_TOKEN"
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        msg: "Access token expirado. Use o refresh token para renovar.",
        error: "TOKEN_EXPIRED"
      });
    }

    // Outros erros
    return res.status(error.statusCode || 500).json({
      success: false,
      msg: error.message || "Erro ao verificar autenticação",
      error: "AUTH_ERROR"
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

