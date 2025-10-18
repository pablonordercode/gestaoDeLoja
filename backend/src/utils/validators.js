/**
 * Valida formato de email
 */
const validarEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Valida senha (mínimo 6 caracteres)
 */
const validarSenha = (senha) => {
    return senha && senha.length >= 6;
};

/**
 * Valida ObjectId do MongoDB
 */
const validarObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Valida número positivo
 */
const validarNumeroPositivo = (numero) => {
    const num = parseFloat(numero);
    return !isNaN(num) && num >= 0;
};

/**
 * Valida número inteiro positivo
 */
const validarInteiroPositivo = (numero) => {
    const num = parseInt(numero);
    return !isNaN(num) && num >= 0 && Number.isInteger(num);
};

/**
 * Sanitiza string removendo espaços extras
 */
const sanitizarString = (str) => {
    return str ? String(str).trim() : '';
};

/**
 * Valida se campo não está vazio
 */
const campoObrigatorio = (valor) => {
    return valor !== undefined && valor !== null && valor !== '';
};

module.exports = {
    validarEmail,
    validarSenha,
    validarObjectId,
    validarNumeroPositivo,
    validarInteiroPositivo,
    sanitizarString,
    campoObrigatorio
};

