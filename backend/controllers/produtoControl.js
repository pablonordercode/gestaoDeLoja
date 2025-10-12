const Produtonew = require("../models/produtosModels");
const { asyncHandler, AppError } = require("../utils/error");

exports.adicionarProduto = asyncHandler(async (req, res) => {
    const { nome, descricao, preco, quantidade, categoria, fornecedor } = req.body;

        // Verifica se todos os campos obrigatórios foram fornecidos
    if (!nome || !descricao || !preco || !quantidade || !categoria || !fornecedor) {
        throw new AppError("Todos os campos devem ser preenchidos!", 400);
    }

        // Verifica se uma imagem foi enviada no request
    if (!req.file || !req.file.filename) {
        throw new AppError('Imagem do produto é obrigatória', 400);
    }

        // Validação de tipos
    if (isNaN(preco) || isNaN(quantidade)) {
        throw new AppError('Preço e quantidade devem ser números válidos', 400);
    }

        // Define a categoria como "Categoria" se nenhuma for fornecida
        const categoriaFinal = categoria || "Categoria";

        // Cria uma nova instância do Produto com os dados fornecidos
        const criaProduto = new Produtonew({
            nome,
            descricao,
            preco: parseFloat(preco),
            quantidade: parseInt(quantidade),
            categoria: categoriaFinal,
            fornecedor, 
            imagem: req.file.filename,
        });

        // Salva o produto no banco de dados
    await criaProduto.save();
    res.status(201).json({ 
        msg: "Produto Criado com Sucesso!",
        produto: {
            id: criaProduto._id,
            nome: criaProduto.nome,
            preco: criaProduto.preco,
            quantidade: criaProduto.quantidade
        }
    });
});
 
exports.buscarTodosProdutos = asyncHandler(async (req, res) => {
        // Parâmetros de paginação
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Busca todos os produtos com paginação
        const pegaTodosProdutos = await Produtonew.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Conta o total de produtos para metadados
        const totalProdutos = await Produtonew.countDocuments();
        const totalPages = Math.ceil(totalProdutos / limit);

        res.status(200).json({
            success: true,
            data: pegaTodosProdutos,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalProdutos,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
});

exports.buscarProdutoId = asyncHandler(async (req, res) => {
    const { id } = req.params;

        // Validação do ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('ID do produto inválido', 400);
    }

        const produto = await Produtonew.findById(id);
        
    if (!produto) {
        throw new AppError('Produto não encontrado', 404);
    }

    res.status(200).json({
        success: true,
        data: produto
    });
});

exports.editarProduto = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

        // Validação do ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('ID do produto inválido', 400);
    }

        // Verificar se o produto existe
        const produtoExistente = await Produtonew.findById(id);
    if (!produtoExistente) {
        throw new AppError('Produto não encontrado', 404);
    }

        // Validação dos dados de entrada
        const { nome, descricao, preco, quantidade, categoria, fornecedor } = updateData;
        
        // Validar tipos numéricos se fornecidos
    if (preco !== undefined && (isNaN(preco) || preco < 0)) {
        throw new AppError('Preço deve ser um número válido e não negativo', 400);
    }

    if (quantidade !== undefined && (isNaN(quantidade) || quantidade < 0)) {
        throw new AppError('Quantidade deve ser um número válido e não negativo', 400);
    }

        // Preparar dados para atualização
        const dadosAtualizacao = {};
        if (nome !== undefined) dadosAtualizacao.nome = nome;
        if (descricao !== undefined) dadosAtualizacao.descricao = descricao;
        if (preco !== undefined) dadosAtualizacao.preco = parseFloat(preco);
        if (quantidade !== undefined) dadosAtualizacao.quantidade = parseInt(quantidade);
        if (categoria !== undefined) dadosAtualizacao.categoria = categoria;
        if (fornecedor !== undefined) dadosAtualizacao.fornecedor = fornecedor;

        // Se uma nova imagem foi enviada, atualizar o campo imagem
        if (req.file && req.file.filename) {
            dadosAtualizacao.imagem = req.file.filename;
        }

        // Verificar se há dados para atualizar
    if (Object.keys(dadosAtualizacao).length === 0) {
        throw new AppError('Nenhum dado válido fornecido para atualização', 400);
    }

        // Atualizar o produto
        const produtoAtualizado = await Produtonew.findByIdAndUpdate(
            id, 
            dadosAtualizacao, 
            { 
                new: true, 
                runValidators: true 
            }
        );

    res.status(200).json({
        success: true,
        msg: 'Produto atualizado com sucesso',
        data: produtoAtualizado
    });
});

exports.deletarProduto = asyncHandler(async (req, res) => {
    const { id } = req.params;

        // Validação do ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('ID do produto inválido', 400);
    }

        // Verificar se o produto existe antes de deletar
        const produtoExistente = await Produtonew.findById(id);
    if (!produtoExistente) {
        throw new AppError('Produto não encontrado', 404);
    }

        // Deletar o produto
        const produtoDeletado = await Produtonew.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        msg: 'Produto deletado com sucesso',
        data: {
            id: produtoDeletado._id,
            nome: produtoDeletado.nome
        }
    });
});