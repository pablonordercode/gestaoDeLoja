const produtoService = require("../services/produtoService");
const { asyncHandler } = require("../utils/error");

/**
 * Controller para adicionar novo produto
 */
exports.adicionarProduto = asyncHandler(async (req, res) => {
    const produto = await produtoService.criarProduto(req.body, req.file);
    
    res.status(201).json({ 
        success: true,
        msg: "Produto criado com sucesso!",
        produto
    });
});

/**
 * Controller para buscar todos os produtos
 */
exports.buscarTodosProdutos = asyncHandler(async (req, res) => {
    const resultado = await produtoService.buscarTodosProdutos(req.query);
    
    res.status(200).json({
        success: true,
        ...resultado
    });
});

/**
 * Controller para buscar produto por ID
 */
exports.buscarProdutoId = asyncHandler(async (req, res) => {
    const produto = await produtoService.buscarProdutoPorId(req.params.id);
    
    res.status(200).json({
        success: true,
        data: produto
    });
});

/**
 * Controller para editar produto
 */
exports.editarProduto = asyncHandler(async (req, res) => {
    const produtoAtualizado = await produtoService.atualizarProduto(
        req.params.id,
        req.body,
        req.file
    );

    res.status(200).json({
        success: true,
        msg: 'Produto atualizado com sucesso',
        data: produtoAtualizado
    });
});

/**
 * Controller para deletar produto
 */
exports.deletarProduto = asyncHandler(async (req, res) => {
    const resultado = await produtoService.deletarProduto(req.params.id);

    res.status(200).json({
        success: true,
        msg: 'Produto deletado com sucesso',
        data: resultado
    });
});
