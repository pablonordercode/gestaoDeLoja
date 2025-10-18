const colaboradorService = require("../services/colaboradorService");
const { asyncHandler } = require("../utils/error");

/**
 * Controller para adicionar novo colaborador
 */
exports.adicionarColaborador = asyncHandler(async (req, res) => {
    const colaborador = await colaboradorService.criarColaborador(req.body, req.file);
    
    res.status(201).json({ 
        success: true,
        msg: "Colaborador criado com sucesso!",
        colaborador
    });
});

/**
 * Controller para buscar todos os colaboradores
 */
exports.buscarColaboradores = asyncHandler(async (req, res) => {
    const resultado = await colaboradorService.buscarColaboradores(req.query);
    
    res.status(200).json({
        success: true,
        ...resultado
    });
});

/**
 * Controller para buscar colaborador por ID
 */
exports.buscarColaboradorId = asyncHandler(async (req, res) => {
    const colaborador = await colaboradorService.buscarColaboradorPorId(req.params.id);
    
    res.status(200).json({
        success: true,
        data: colaborador 
    });
});

/**
 * Controller para editar colaborador
 */
exports.editarColaborador = asyncHandler(async (req, res) => {
    const colaboradorAtualizado = await colaboradorService.atualizarColaborador(
        req.params.id,
        req.body,
        req.file
    );

    res.status(200).json({
        success: true,
        msg: 'Colaborador atualizado com sucesso',
        data: colaboradorAtualizado
    });
});

/**
 * Controller para deletar colaborador
 */
exports.deletarColaborador = asyncHandler(async (req, res) => {
    const resultado = await colaboradorService.deletarColaborador(req.params.id);

    res.status(200).json({
        success: true,
        msg: 'Colaborador deletado com sucesso',
        data: resultado
    });
});

/**
 * Controller para login de colaborador
 */
exports.loginColaborador = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const resultado = await colaboradorService.login(email, password);

    res.status(200).json({
        success: true,
        msg: "Login realizado com sucesso",
        data: resultado
    });
});

/**
 * Controller para renovar access token usando refresh token
 */
exports.refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const resultado = await colaboradorService.refreshToken(refreshToken);

    res.status(200).json({
        success: true,
        msg: "Tokens renovados com sucesso",
        data: resultado
    });
});

/**
 * Controller para logout (revoga refresh token)
 */
exports.logoutColaborador = asyncHandler(async (req, res) => {
    // O ID do usuário vem do middleware de autenticação
    const userId = req.usuario.id;
    const resultado = await colaboradorService.logout(userId);

    res.status(200).json({
        success: true,
        msg: resultado.msg
    });
});