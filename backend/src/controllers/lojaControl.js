const lojaService = require("../services/lojaService");
const { asyncHandler } = require("../utils/error");

/**
 * Controller para criar nova loja
 */
exports.criarLoja = asyncHandler(async (req, res) => {
    const userId = req.usuario.id;
    const loja = await lojaService.criarLoja(req.body, req.file, userId);
    
    res.status(201).json({ 
        success: true,
        msg: "Loja criada com sucesso!",
        data: loja
    });
});

/**
 * Controller para buscar dados da loja
 */
exports.buscarLoja = asyncHandler(async (req, res) => {
    const loja = await lojaService.buscarLoja();
    
    res.status(200).json({
        success: true,
        data: loja
    });
});

/**
 * Controller para atualizar loja
 */
exports.atualizarLoja = asyncHandler(async (req, res) => {
    const lojaAtualizada = await lojaService.atualizarLoja(
        req.params.id,
        req.body,
        req.file
    );

    res.status(200).json({
        success: true,
        msg: 'Loja atualizada com sucesso',
        data: lojaAtualizada
    });
});

/**
 * Controller para deletar loja
 */
exports.deletarLoja = asyncHandler(async (req, res) => {
    const resultado = await lojaService.deletarLoja(req.params.id);

    res.status(200).json({
        success: true,
        msg: 'Loja deletada com sucesso',
        data: resultado
    });
});


