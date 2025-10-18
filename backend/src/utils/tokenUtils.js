const jwt = require("jsonwebtoken");
const crypto = require("crypto");

/**
 * Gera access token e refresh token para um usuário
 * @param {Object} user - Dados do usuário
 * @returns {Object} - { accessToken, refreshToken }
 */
const generateTokens = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET não configurado");
    }

    const payload = {
        id: user._id || user.id,
        email: user.email,
        cargo: user.cargo
    };

    // Access Token - curta duração
    const accessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXP || "15m" }
    );

    // Refresh Token - longa duração
    // Podemos usar JWT ou um token aleatório criptográfico
    // Vou usar JWT para facilitar a validação
    const refreshToken = jwt.sign(
        { 
            id: user._id || user.id,
            type: "refresh" // Identificador para validação
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXP || "7d" }
    );

    return {
        accessToken,
        refreshToken
    };
};

/**
 * Gera apenas um novo access token
 * @param {Object} user - Dados do usuário
 * @returns {String} - accessToken
 */
const generateAccessToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET não configurado");
    }

    const payload = {
        id: user._id || user.id,
        email: user.email,
        cargo: user.cargo
    };

    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXP || "15m" }
    );
};

/**
 * Verifica e decodifica um token JWT
 * @param {String} token - Token a ser verificado
 * @returns {Object} - Payload decodificado
 */
const verifyToken = (token) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET não configurado");
    }

    return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Calcula a data de expiração baseada no tempo configurado
 * @param {String} expiresIn - Tempo de expiração (ex: "7d", "24h")
 * @returns {Date} - Data de expiração
 */
const calculateExpiryDate = (expiresIn) => {
    const now = new Date();
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    
    if (!match) {
        // Default: 7 dias
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    const [, value, unit] = match;
    const num = parseInt(value);

    switch (unit) {
        case 's': // segundos
            return new Date(now.getTime() + num * 1000);
        case 'm': // minutos
            return new Date(now.getTime() + num * 60 * 1000);
        case 'h': // horas
            return new Date(now.getTime() + num * 60 * 60 * 1000);
        case 'd': // dias
            return new Date(now.getTime() + num * 24 * 60 * 60 * 1000);
        default:
            return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
};

module.exports = {
    generateTokens,
    generateAccessToken,
    verifyToken,
    calculateExpiryDate
};

