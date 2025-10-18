const produtoRepository = require("../repositories/produtoRepository");
const { AppError } = require("../utils/error");
const { validarObjectId } = require("../utils/validators");

class ProdutoService {
    /**
     * Cria um novo produto
     */
    async criarProduto(dados, arquivo) {
        const { nome, descricao, preco, quantidade, categoria, fornecedor } = dados;

        // Validações
        if (!nome || !descricao || !preco || !quantidade || !categoria || !fornecedor) {
            throw new AppError("Todos os campos devem ser preenchidos!", 400);
        }

        if (!arquivo || !arquivo.filename) {
            throw new AppError('Imagem do produto é obrigatória', 400);
        }

        if (isNaN(preco) || isNaN(quantidade)) {
            throw new AppError('Preço e quantidade devem ser números válidos', 400);
        }

        if (parseFloat(preco) < 0) {
            throw new AppError('Preço não pode ser negativo', 400);
        }

        if (parseInt(quantidade) < 0) {
            throw new AppError('Quantidade não pode ser negativa', 400);
        }

        // Criar produto
        const dadosProduto = {
            nome: nome.trim(),
            descricao: descricao.trim(),
            preco: parseFloat(preco),
            quantidade: parseInt(quantidade),
            categoria: categoria.trim(),
            fornecedor: fornecedor.trim(),
            imagem: arquivo.filename
        };

        const novoProduto = await produtoRepository.create(dadosProduto);

        return {
            id: novoProduto._id,
            nome: novoProduto.nome,
            preco: novoProduto.preco,
            quantidade: novoProduto.quantidade,
            categoria: novoProduto.categoria
        };
    }

    /**
     * Busca todos os produtos com paginação
     */
    async buscarTodosProdutos(query) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;

        // Construir filtros
        const filtros = this._construirFiltros(query);

        // Buscar produtos
        const { produtos, total } = await produtoRepository.findAll(
            filtros,
            { skip, limit }
        );

        const totalPages = Math.ceil(total / limit);

        return {
            data: produtos,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };
    }

    /**
     * Busca produto por ID
     */
    async buscarProdutoPorId(id) {
        if (!validarObjectId(id)) {
            throw new AppError('ID do produto inválido', 400);
        }

        const produto = await produtoRepository.findById(id);
        
        if (!produto) {
            throw new AppError('Produto não encontrado', 404);
        }

        return produto;
    }

    /**
     * Atualiza produto
     */
    async atualizarProduto(id, dados, arquivo) {
        if (!validarObjectId(id)) {
            throw new AppError('ID do produto inválido', 400);
        }

        // Verificar se produto existe
        const produtoExiste = await produtoRepository.findById(id);
        if (!produtoExiste) {
            throw new AppError('Produto não encontrado', 404);
        }

        const { nome, descricao, preco, quantidade, categoria, fornecedor } = dados;
        const dadosAtualizacao = {};

        // Validar e preparar dados
        if (nome !== undefined) {
            dadosAtualizacao.nome = String(nome).trim();
        }

        if (descricao !== undefined) {
            dadosAtualizacao.descricao = String(descricao).trim();
        }

        if (preco !== undefined) {
            const precoNumero = parseFloat(preco);
            if (isNaN(precoNumero) || precoNumero < 0) {
                throw new AppError('Preço deve ser um número válido e não negativo', 400);
            }
            dadosAtualizacao.preco = precoNumero;
        }

        if (quantidade !== undefined) {
            const quantidadeNumero = parseInt(quantidade);
            if (isNaN(quantidadeNumero) || quantidadeNumero < 0) {
                throw new AppError('Quantidade deve ser um número válido e não negativo', 400);
            }
            dadosAtualizacao.quantidade = quantidadeNumero;
        }

        if (categoria !== undefined) {
            dadosAtualizacao.categoria = String(categoria).trim();
        }

        if (fornecedor !== undefined) {
            dadosAtualizacao.fornecedor = String(fornecedor).trim();
        }

        if (arquivo && arquivo.filename) {
            dadosAtualizacao.imagem = arquivo.filename;
        }

        // Verificar se há dados para atualizar
        if (Object.keys(dadosAtualizacao).length === 0) {
            throw new AppError('Nenhum dado válido fornecido para atualização', 400);
        }

        // Atualizar
        const produtoAtualizado = await produtoRepository.update(id, dadosAtualizacao);

        return produtoAtualizado;
    }

    /**
     * Deleta produto
     */
    async deletarProduto(id) {
        if (!validarObjectId(id)) {
            throw new AppError('ID do produto inválido', 400);
        }

        const produtoExiste = await produtoRepository.findById(id);
        if (!produtoExiste) {
            throw new AppError('Produto não encontrado', 404);
        }

        const produtoDeletado = await produtoRepository.delete(id);

        return {
            id: produtoDeletado._id,
            nome: produtoDeletado.nome
        };
    }

    /**
     * Busca produtos com estoque baixo
     */
    async buscarProdutosEstoqueBaixo(quantidadeMinima = 10) {
        const { produtos } = await produtoRepository.findComEstoqueBaixo(quantidadeMinima);
        return produtos;
    }

    /**
     * Atualiza quantidade do produto
     */
    async atualizarQuantidade(id, novaQuantidade) {
        if (!validarObjectId(id)) {
            throw new AppError('ID do produto inválido', 400);
        }

        if (isNaN(novaQuantidade) || novaQuantidade < 0) {
            throw new AppError('Quantidade deve ser um número válido e não negativo', 400);
        }

        const produto = await produtoRepository.atualizarQuantidade(id, parseInt(novaQuantidade));
        
        if (!produto) {
            throw new AppError('Produto não encontrado', 404);
        }

        return produto;
    }

    /**
     * Método auxiliar para construir filtros
     */
    _construirFiltros(query) {
        const { categoria, fornecedor, precoMin, precoMax } = query;
        const filtros = {};

        if (categoria) {
            filtros.categoria = { $regex: categoria, $options: 'i' };
        }

        if (fornecedor) {
            filtros.fornecedor = { $regex: fornecedor, $options: 'i' };
        }

        if (precoMin !== undefined || precoMax !== undefined) {
            filtros.preco = {};
            if (precoMin !== undefined) {
                filtros.preco.$gte = parseFloat(precoMin);
            }
            if (precoMax !== undefined) {
                filtros.preco.$lte = parseFloat(precoMax);
            }
        }

        return filtros;
    }
}

module.exports = new ProdutoService();

