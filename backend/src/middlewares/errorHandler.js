const { AppError } = require('../utils/error');

// Middleware para rotas não encontradas
const notFound = (req, res, next) => {
    next(new AppError(`Rota não encontrada: ${req.originalUrl}`, 404));
};

// Middleware central de tratamento de erros
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const response = {
        success: false,
        status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
        msg: err.message || 'Erro interno do servidor',
    };

    if (process.env.NODE_ENV === 'development' && err.stack) {
        response.stack = err.stack;
    }

    if (err.details) {
        response.details = err.details;
    }

    // Erros do Mongoose
    if (err.name === 'ValidationError') {
        response.msg = 'Erro de validação';
        response.errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json(response);
    }

    if (err.code === 11000) {
        response.msg = 'Duplicidade de dados';
        response.errors = err.keyValue;
        return res.status(409).json(response);
    }

    return res.status(statusCode).json(response);
};

module.exports = { notFound, errorHandler };


