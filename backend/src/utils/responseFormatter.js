/**
 * Formata resposta de sucesso
 */
const sucesso = (res, statusCode = 200, mensagem, dados = null) => {
    const resposta = {
        success: true,
        message: mensagem
    };

    if (dados !== null) {
        resposta.data = dados;
    }

    return res.status(statusCode).json(resposta);
};

/**
 * Formata resposta de erro
 */
const erro = (res, statusCode = 500, mensagem, detalhes = null) => {
    const resposta = {
        success: false,
        message: mensagem
    };

    if (detalhes !== null) {
        resposta.details = detalhes;
    }

    return res.status(statusCode).json(resposta);
};

/**
 * Formata resposta com paginação
 */
const sucessoComPaginacao = (res, mensagem, dados, paginacao) => {
    return res.status(200).json({
        success: true,
        message: mensagem,
        data: dados,
        pagination: paginacao
    });
};

module.exports = {
    sucesso,
    erro,
    sucessoComPaginacao
};

